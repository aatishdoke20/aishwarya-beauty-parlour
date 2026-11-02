/**
 * Server Configuration & Publishing Setup Status Endpoint
 * GET /api/status
 * Reports whether environment variables are set without ever leaking their secret values.
 */

const { authenticateRequest } = require('./_lib/auth');
const { getGitHubConfig } = require('./_lib/github');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const session = authenticateRequest(req);
  const isAuthenticated = Boolean(session);

  const gh = getGitHubConfig();

  const status = {
    serverTime: new Date().toISOString(),
    isAuthenticated,
    environment: {
      hasAdminEmail: Boolean(process.env.BLOG_ADMIN_EMAIL),
      hasAdminPassword: Boolean(process.env.BLOG_ADMIN_PASSWORD),
      hasSessionSecret: Boolean(process.env.BLOG_SESSION_SECRET),
      hasGithubToken: Boolean(process.env.GITHUB_TOKEN),
      hasGithubOwner: Boolean(process.env.GITHUB_OWNER),
      hasGithubRepo: Boolean(process.env.GITHUB_REPO),
      hasGithubBranch: Boolean(process.env.GITHUB_BRANCH)
    },
    github: {
      owner: gh.owner,
      repo: gh.repo,
      branch: gh.branch,
      isConfigured: gh.isConfigured
    },
    publishingMode: gh.isConfigured ? 'git-backed' : 'configuration-pending',
    setupChecklist: [
      { key: 'BLOG_ADMIN_EMAIL', label: 'Owner Login Email', configured: Boolean(process.env.BLOG_ADMIN_EMAIL) },
      { key: 'BLOG_ADMIN_PASSWORD', label: 'Owner Login Password', configured: Boolean(process.env.BLOG_ADMIN_PASSWORD) },
      { key: 'BLOG_SESSION_SECRET', label: 'Session HMAC Secret', configured: Boolean(process.env.BLOG_SESSION_SECRET) },
      { key: 'GITHUB_TOKEN', label: 'GitHub Contents Token (Contents: Read/Write)', configured: Boolean(process.env.GITHUB_TOKEN) },
      { key: 'GITHUB_OWNER', label: 'GitHub Repository Owner', configured: Boolean(process.env.GITHUB_OWNER) },
      { key: 'GITHUB_REPO', label: 'GitHub Repository Name', configured: Boolean(process.env.GITHUB_REPO) },
      { key: 'GITHUB_BRANCH', label: 'Deployment Branch (main)', configured: Boolean(process.env.GITHUB_BRANCH) }
    ]
  };

  return res.status(200).json(status);
};

