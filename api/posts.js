/**
 * Blog Posts Management Endpoint
 * GET  /api/posts - List posts (drafts + published) for authenticated owner
 * POST /api/posts - Create, save draft, publish, or unpublish post
 */

const fs = require('fs');
const path = require('path');
const { authenticateRequest } = require('./_lib/auth');
const { getGitHubConfig, commitFileToGitHub } = require('./_lib/github');
const { parseMarkdownFile, calculateReadingTime, slugify } = require('../scripts/build-blog');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'blog');

/**
 * Load local posts from disk
 */
function getLocalPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
      const { frontmatter, body } = parseMarkdownFile(content);
      posts.push({
        ...frontmatter,
        slug: frontmatter.slug || path.basename(file, '.md'),
        body
      });
    } catch (e) {
      console.error('Error reading post file:', file, e);
    }
  }

  posts.sort((a, b) => new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0));
  return posts;
}

/**
 * Convert post object back to YAML Frontmatter + Markdown
 */
function serializeToMarkdown(post) {
  let yaml = '---\n';
  yaml += `title: "${(post.title || '').replace(/"/g, '\\"')}"\n`;
  yaml += `slug: "${post.slug}"\n`;
  yaml += `excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"\n`;
  yaml += `category: "${post.category || 'General'}"\n`;
  yaml += `author: "${post.author || 'Varsha Doke'}"\n`;
  yaml += `status: "${post.status || 'draft'}"\n`;
  yaml += `publishedAt: "${post.publishedAt || new Date().toISOString().split('T')[0]}"\n`;
  yaml += `updatedAt: "${new Date().toISOString().split('T')[0]}"\n`;
  yaml += `readingTime: "${post.readingTime || calculateReadingTime(post.body || '')}"\n`;

  // Featured Image
  yaml += 'featuredImage:\n';
  yaml += `  src: "${post.featuredImage?.src || ''}"\n`;
  yaml += `  alt: "${(post.featuredImage?.alt || '').replace(/"/g, '\\"')}"\n`;
  if (post.featuredImage?.caption) {
    yaml += `  caption: "${post.featuredImage.caption.replace(/"/g, '\\"')}"\n`;
  }

  // SEO
  yaml += 'seo:\n';
  yaml += `  title: "${(post.seo?.title || post.title || '').replace(/"/g, '\\"')}"\n`;
  yaml += `  description: "${(post.seo?.description || post.excerpt || '').replace(/"/g, '\\"')}"\n`;
  yaml += `  canonical: "https://aishwaryabeautyparlour.vercel.app/blog/${post.slug}/"\n`;
  if (post.seo?.focusKeyword) yaml += `  focusKeyword: "${post.seo.focusKeyword}"\n`;
  if (post.seo?.ogImage) yaml += `  ogImage: "${post.seo.ogImage}"\n`;
  yaml += `  noindex: ${Boolean(post.seo?.noindex)}\n`;

  // Related Services
  if (post.relatedServices && post.relatedServices.length > 0) {
    yaml += 'relatedServices:\n';
    post.relatedServices.forEach(s => {
      yaml += `  - title: "${s.title}"\n    url: "${s.url}"\n`;
    });
  }

  // Related Posts
  if (post.relatedPosts && post.relatedPosts.length > 0) {
    yaml += 'relatedPosts:\n';
    post.relatedPosts.forEach(p => {
      yaml += `  - "${p}"\n`;
    });
  }

  // FAQs
  if (post.faqs && post.faqs.length > 0) {
    yaml += 'faqs:\n';
    post.faqs.forEach(f => {
      yaml += `  - question: "${f.question.replace(/"/g, '\\"')}"\n`;
      yaml += `    answer: "${f.answer.replace(/"/g, '\\"')}"\n`;
    });
  }

  yaml += '---\n\n';
  yaml += post.body || '';

  return yaml;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Authenticate session
  const session = authenticateRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to access post management.' });
  }

  // 1. List Posts
  if (req.method === 'GET') {
    const posts = getLocalPosts();
    return res.status(200).json({ posts });
  }

  // 2. Save / Publish Post
  if (req.method === 'POST') {
    const postData = req.body;
    if (!postData) {
      return res.status(400).json({ error: 'Missing request body.' });
    }

    // Validation
    const errors = [];
    if (!postData.title || postData.title.trim().length < 5) {
      errors.push('Post title is required (minimum 5 characters).');
    }
    const slug = slugify(postData.slug || postData.title || '');
    if (!slug) {
      errors.push('A valid lowercase URL slug is required.');
    }
    if (!postData.excerpt || postData.excerpt.trim().length < 10) {
      errors.push('Short excerpt is required (minimum 10 characters).');
    }
    if (!postData.category) {
      errors.push('Category is required.');
    }
    if (!postData.body || postData.body.trim().length < 20) {
      errors.push('Article body is required (minimum 20 characters).');
    }
    if (!postData.featuredImage?.src) {
      errors.push('Featured image is required.');
    }
    if (!postData.featuredImage?.alt || postData.featuredImage.alt.trim().length < 3) {
      errors.push('Featured image ALT text is required for accessibility and SEO.');
    }
    if (!postData.seo?.title) {
      errors.push('SEO Title is required.');
    }
    if (!postData.seo?.description) {
      errors.push('Meta Description is required.');
    }

    if (errors.length > 0) {
      return res.status(422).json({ error: 'Validation failed', details: errors });
    }

    postData.slug = slug;
    postData.readingTime = calculateReadingTime(postData.body);
    const mdContent = serializeToMarkdown(postData);

    const relativeRepoPath = `content/blog/${slug}.md`;
    const gh = getGitHubConfig();

    let commitResult = null;
    let localSaved = false;

    // Try saving locally first (works for local development and tests)
    try {
      const localFilePath = path.join(CONTENT_DIR, `${slug}.md`);
      fs.writeFileSync(localFilePath, mdContent, 'utf8');
      localSaved = true;
    } catch (e) {
      // On Vercel read-only filesystem, saving locally may throw, which is expected
    }

    // Git-backed publishing
    if (gh.isConfigured) {
      try {
        const commitMsg = `CMS: ${postData.status === 'published' ? 'Publish' : 'Save draft'} "${postData.title}"`;
        commitResult = await commitFileToGitHub(relativeRepoPath, Buffer.from(mdContent, 'utf8'), commitMsg);
      } catch (ghErr) {
        return res.status(502).json({
          error: `GitHub Commit Error: ${ghErr.message}. The changes were not pushed to GitHub.`,
          localSaved
        });
      }
    } else {
      // GitHub credentials not set
      if (process.env.VERCEL === '1') {
        return res.status(503).json({
          error: 'GitHub publishing is not yet configured. Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in Vercel project environment variables to enable online publishing.',
          setupRequired: true
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: gh.isConfigured
        ? `Post saved and committed to GitHub (branch: ${gh.branch}). Vercel deployment has been triggered.`
        : 'Post saved locally.',
      slug,
      status: postData.status,
      commitSha: commitResult?.commitSha || null,
      isLiveSoon: postData.status === 'published' && Boolean(commitResult)
    });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};

