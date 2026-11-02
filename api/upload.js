/**
 * Image Upload Endpoint for Owner CMS
 * POST /api/upload
 * Requires authenticated owner session, valid MIME type, and MANDATORY alt text.
 */

const fs = require('fs');
const path = require('path');
const { authenticateRequest } = require('./_lib/auth');
const { getGitHubConfig, commitFileToGitHub } = require('./_lib/github');

const ROOT_DIR = path.resolve(__dirname, '..');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Authenticate Session
  const session = authenticateRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to upload images.' });
  }

  // 2. Validate input
  const { slug, filename, fileData, mimeType, altText } = req.body || {};

  if (!altText || altText.trim().length < 3) {
    return res.status(422).json({
      error: 'Alt text is strictly required for all uploaded images to comply with accessibility and SEO standards.'
    });
  }

  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return res.status(422).json({
      error: `Unsupported image type (${mimeType}). Allowed formats: JPEG, PNG, WebP.`
    });
  }

  if (!fileData) {
    return res.status(422).json({ error: 'No image data provided.' });
  }

  // Decode Base64 data (strip prefix if present, e.g. "data:image/jpeg;base64,...")
  const base64Clean = fileData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Clean, 'base64');

  if (buffer.length > MAX_FILE_SIZE) {
    return res.status(422).json({
      error: `Image exceeds maximum allowed size of 5MB (${Math.round(buffer.length / 1024)} KB). Please compress before uploading.`
    });
  }

  // Sanitize filename & slug
  const cleanSlug = (slug || 'general').toLowerCase().replace(/[^a-z0-9\-_]/g, '');
  const cleanName = (filename || 'image.jpg').toLowerCase().replace(/[^a-z0-9\-_.]/g, '');

  const relativeRepoPath = `images/blog/${cleanSlug}/${cleanName}`;
  const publicUrl = `/images/blog/${cleanSlug}/${cleanName}`;

  // Save locally if disk writable
  try {
    const localDir = path.join(ROOT_DIR, 'images', 'blog', cleanSlug);
    fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(path.join(localDir, cleanName), buffer);

    const publicDir = path.join(ROOT_DIR, 'public', 'images', 'blog', cleanSlug);
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, cleanName), buffer);
  } catch (e) {
    // Disk write may fail on Vercel runtime, handled gracefully
  }

  // Commit to GitHub if configured
  const gh = getGitHubConfig();
  let commitResult = null;
  if (gh.isConfigured) {
    try {
      commitResult = await commitFileToGitHub(
        relativeRepoPath,
        buffer,
        `CMS: Upload image ${cleanName} for ${cleanSlug}`
      );
    } catch (ghErr) {
      return res.status(502).json({
        error: `GitHub upload commit failed: ${ghErr.message}`,
        url: publicUrl
      });
    }
  }

  return res.status(200).json({
    success: true,
    url: publicUrl,
    altText: altText.trim(),
    commitSha: commitResult?.commitSha || null,
    message: 'Image uploaded and processed successfully.'
  });
};
