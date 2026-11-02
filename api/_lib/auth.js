/**
 * Authentication and Session Security Helper for Owner Blog Editor
 */

const crypto = require('crypto');

// In-memory rate limiting map (IP -> { count: number, lockUntil: number })
const loginAttempts = new Map();

const SESSION_COOKIE_NAME = 'aishwarya_blog_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  return process.env.BLOG_SESSION_SECRET || 'fallback-secret-for-development-change-in-production';
}

/**
 * Check rate limit for IP
 */
function isRateLimited(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return false;

  if (record.lockUntil > 0) {
    if (Date.now() < record.lockUntil) {
      return true;
    }
    // Lock expired, reset
    loginAttempts.delete(ip);
    return false;
  }

  return false;
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(ip) {
  const record = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  record.count = (record.count || 0) + 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
  }
  loginAttempts.set(ip, record);
}

/**
 * Clear login attempts on success
 */
function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

/**
 * Sign session token: base64(payload).signature
 */
function createSessionToken(email) {
  const payload = JSON.stringify({
    email,
    created: Date.now(),
    expires: Date.now() + SESSION_MAX_AGE_MS
  });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(b64Payload);
  const signature = hmac.digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verify session token from cookie
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const [b64Payload, signature] = token.split('.');
  if (!b64Payload || !signature) return null;

  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(b64Payload);
  const expectedSignature = hmac.digest('base64url');

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    try {
      const data = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
      if (data.expires > Date.now()) {
        return data;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Parse cookies from header
 */
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

/**
 * Get authenticated user from request
 */
function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  return verifySessionToken(token);
}

/**
 * Set HTTP-Only session cookie header string
 */
function makeSetCookieHeader(token, maxAgeSeconds = 7 * 24 * 60 * 60) {
  const isSecure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const secureFlag = isSecure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

function makeClearCookieHeader() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

module.exports = {
  SESSION_COOKIE_NAME,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
  createSessionToken,
  verifySessionToken,
  authenticateRequest,
  makeSetCookieHeader,
  makeClearCookieHeader
};
