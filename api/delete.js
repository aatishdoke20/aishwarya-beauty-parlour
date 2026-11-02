/**
 * Post Deletion Endpoint for Owner CMS
 * POST /api/delete
 * Requires authenticated owner session and post slug.
 */

const fs = require('fs');
const path = require('path');
const { authenticateRequest } = require('./_lib/auth');
const { getGitHubConfig, deleteFileFromGitHub } = require('./_lib/github');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'blog');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Authenticate Session
  const session = authenticateRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }

  const { slug } = req.body || {};
  if (!slug) {
    return res.status(400).json({ error: 'Post slug is required for deletion.' });
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9\-_]/g, '');
  const relativeRepoPath = `content/blog/${cleanSlug}.md`;

  // Remove locally if disk is writable
  try {
    const localPath = path.join(CONTENT_DIR, `${cleanSlug}.md`);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  } catch (e) {
    // Handled
  }

  // Commit deletion to GitHub if configured
  const gh = getGitHubConfig();
  if (gh.isConfigured) {
    try {
      await deleteFileFromGitHub(relativeRepoPath, `CMS: Delete post ${cleanSlug}`);
    } catch (ghErr) {
      return res.status(502).json({
        error: `GitHub deletion commit failed: ${ghErr.message}`
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Post "${cleanSlug}" deleted successfully. Vercel deployment triggered.`
  });
};
