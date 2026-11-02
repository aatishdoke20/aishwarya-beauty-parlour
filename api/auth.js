/**
 * Owner Authentication Endpoint
 * POST /api/auth?action=login
 * POST /api/auth?action=logout
 * GET  /api/auth?action=session
 */

const {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
  createSessionToken,
  authenticateRequest,
  makeSetCookieHeader,
  makeClearCookieHeader
} = require('./_lib/auth');

module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const action = req.query?.action || (req.body && req.body.action) || 'session';
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  // 1. Check Session
  if (req.method === 'GET' || action === 'session') {
    const session = authenticateRequest(req);
    if (session) {
      return res.status(200).json({
        authenticated: true,
        email: session.email,
        expires: session.expires
      });
    } else {
      return res.status(200).json({
        authenticated: false
      });
    }
  }

  // 2. Logout
  if (action === 'logout') {
    res.setHeader('Set-Cookie', makeClearCookieHeader());
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }

  // 3. Login
  if (action === 'login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
      });
    }

    const { email, password } = req.body || {};
    const configuredEmail = process.env.BLOG_ADMIN_EMAIL;
    const configuredPassword = process.env.BLOG_ADMIN_PASSWORD;

    if (!configuredEmail || !configuredPassword) {
      return res.status(500).json({
        error: 'CMS admin credentials (BLOG_ADMIN_EMAIL, BLOG_ADMIN_PASSWORD) are not yet configured in server environment variables. Please see the setup guide.'
      });
    }

    if (!email || !password || email.trim() !== configuredEmail.trim() || password !== configuredPassword) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({
        error: 'Invalid email address or password. Please verify your credentials.'
      });
    }

    // Success
    clearAttempts(clientIp);
    const token = createSessionToken(email.trim());
    res.setHeader('Set-Cookie', makeSetCookieHeader(token));

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      email: email.trim()
    });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
};
