/**
 * GitHub Contents API Client for Git-backed Blog CMS
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'aatishdoke20';
  const repo = process.env.GITHUB_REPO || 'aishwarya-beauty-parlour';
  const branch = process.env.GITHUB_BRANCH || 'main';

  return {
    token,
    owner,
    repo,
    branch,
    isConfigured: Boolean(token && owner && repo)
  };
}

/**
 * Make an HTTPS request to GitHub API
 */
function requestGithub(apiPath, method = 'GET', body = null) {
  const { token, owner, repo } = getGitHubConfig();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${owner}/${repo}/contents/${apiPath}`,
      method,
      headers: {
        'User-Agent': 'Aishwarya-Beauty-Parlour-CMS',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Get file SHA from GitHub (returns null if file does not exist)
 */
async function getFileSha(filePath) {
  const { branch } = getGitHubConfig();
  try {
    const res = await requestGithub(`${filePath}?ref=${branch}`, 'GET');
    if (res.status === 200 && res.data.sha) {
      return res.data.sha;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Commit a file to GitHub repository
 */
async function commitFileToGitHub(filePath, fileContentBuffer, commitMessage) {
  const { branch, isConfigured } = getGitHubConfig();
  if (!isConfigured) {
    throw new Error('GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO is not configured in environment variables.');
  }

  const existingSha = await getFileSha(filePath);
  const base64Content = fileContentBuffer.toString('base64');

  const payload = {
    message: commitMessage,
    content: base64Content,
    branch
  };
  if (existingSha) {
    payload.sha = existingSha;
  }

  const res = await requestGithub(filePath, 'PUT', payload);
  if (res.status === 200 || res.status === 201) {
    return {
      success: true,
      commitSha: res.data.commit?.sha,
      filePath
    };
  } else {
    throw new Error(`GitHub API returned HTTP ${res.status}: ${res.data.message || 'Unknown error'}`);
  }
}

/**
 * Delete a file from GitHub repository
 */
async function deleteFileFromGitHub(filePath, commitMessage) {
  const { branch, isConfigured } = getGitHubConfig();
  if (!isConfigured) {
    throw new Error('GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO is not configured in environment variables.');
  }

  const existingSha = await getFileSha(filePath);
  if (!existingSha) {
    return { success: true, message: 'File was already deleted or not found.' };
  }

  const payload = {
    message: commitMessage,
    sha: existingSha,
    branch
  };

  const res = await requestGithub(filePath, 'DELETE', payload);
  if (res.status === 200) {
    return { success: true, message: 'File deleted.' };
  } else {
    throw new Error(`GitHub API returned HTTP ${res.status}: ${res.data.message || 'Unknown error'}`);
  }
}

module.exports = {
  getGitHubConfig,
  getFileSha,
  commitFileToGitHub,
  deleteFileFromGitHub
};
