# Aishwarya Beauty Parlour – Blog & Git-Backed CMS Guide 💄📖

This document explains the architecture, one-time setup, and operational workflow for the **Aishwarya Beauty Parlour Blog and Owner CMS publishing system**.

---

## 🌟 Architecture Overview

The blog uses a **Git-backed Static Site Generation (SSG)** workflow hosted on **Vercel**:
1. **Content Source**: Every article is stored as structured Markdown with YAML frontmatter in `content/blog/{slug}.md`.
2. **Build Engine**: Node.js script (`scripts/build-blog.js`) compiles markdown into crawlable, pre-rendered static HTML (`/blog/{slug}/index.html`), generates `/blog/index.html`, and automatically updates `sitemap.xml` with canonical indexable URLs.
3. **Owner Editor (`/admin/blog`)**: A secure, owner-only dashboard where Varsha Doke can write posts with live side-by-side preview, upload images with mandatory accessibility alt text, and manage drafts.
4. **Git-Backed Publishing**: When the owner clicks **Publish to Site**, the serverless function commits the file directly to the GitHub repository using the GitHub Contents API. This triggers the automatic Vercel production deployment.
5. **SEO & AEO/GEO Compliant**:
   - Direct answers in standfirst paragraphs for AI/search engine answer boxes
   - Full `BlogPosting` and `BreadcrumbList` Schema.org JSON-LD
   - Strictly pre-rendered initial HTML (zero client-side rendering dependency for search crawlers)
   - Drafts are completely excluded from public output and sitemap

---

## 🔑 One-Time Setup: Vercel Environment Variables

To activate online publishing, configure the following environment variables in your **Vercel Project Dashboard** (**Settings &rarr; Environment Variables**):

| Variable Name | Description | Example / Value |
|---|---|---|
| `BLOG_ADMIN_EMAIL` | Owner login email address | `owner@example.com` |
| `BLOG_ADMIN_PASSWORD` | Strong password for owner CMS login | *[Create strong password]* |
| `BLOG_SESSION_SECRET` | 32+ character random secret for signing session cookies | *[Generate random 32+ char string]* |
| `GITHUB_TOKEN` | GitHub Personal Access Token (Fine-grained) with **Contents: Read & Write** permission | `github_pat_xxxxxx` |
| `GITHUB_OWNER` | GitHub account or organization name | `aatishdoke20` |
| `GITHUB_REPO` | GitHub repository name | `aishwarya-beauty-parlour` |
| `GITHUB_BRANCH` | Production deployment branch | `main` |

### Creating the GitHub Fine-Grained Token:
1. In GitHub, go to **Settings &rarr; Developer Settings &rarr; Personal access tokens &rarr; Fine-grained tokens**.
2. Click **Generate new token**.
3. Name it: `Aishwarya Blog CMS Publishing`.
4. Under **Repository access**, select **Only select repositories** and pick `aishwarya-beauty-parlour`.
5. Under **Repository permissions**, find **Contents** and select **Access: Read and write**.
6. Generate token and paste into Vercel's `GITHUB_TOKEN` environment variable.
7. Redeploy the project on Vercel.

---

## 📝 Seed Articles Included at Launch

Two complete, locally relevant articles have been published and seeded:

1. **Ladies Haircut and Hair Spa in Manchar: Choosing a Style That Fits Your Hair**
   - **Public URL**: `https://aishwaryabeautyparlour.vercel.app/blog/ladies-haircut-hair-spa-manchar/`
   - **Service Pairs**: Ladies Haircut (layered, butterfly, step) + Hair Spa Therapy
   - **Keywords**: `ladies haircut in Manchar`, `hair spa in Manchar`, `butterfly haircut Manchar`, `layer cut Manchar`
   - **Featured Image**: `/images/blog/blog-ladies-haircut-hair-spa-manchar.jpg`

2. **Maharashtrian Bridal Makeup in Manchar: Traditional Details and HD Finish**
   - **Public URL**: `https://aishwaryabeautyparlour.vercel.app/blog/maharashtrian-bridal-makeup-manchar/`
   - **Service Pairs**: Traditional Maharashtrian Bridal Makeup + HD Bridal Makeup (Nauvari draping, mundavalya, jewelry)
   - **Keywords**: `bridal makeup artist in Manchar`, `Maharashtrian bridal makeup Manchar`, `HD bridal makeup Manchar`, `Nauvari bridal makeup`
   - **Featured Image**: `/images/blog/blog-maharashtrian-bridal-makeup-manchar.jpg`

---

## 💻 Local Commands & Verification

```bash
# Install / verify dependencies
npm install

# Build blog static pages and update sitemap
npm run build

# Run comprehensive QA tests (Unit tests + SEO verification)
npm test

# Start local preview server (with simulated Vercel serverless API)
npm run serve
```

When running `npm run serve`:
- Public Website: `http://localhost:3000/`
- Blog Index: `http://localhost:3000/blog/`
- Owner CMS: `http://localhost:3000/admin/blog`
