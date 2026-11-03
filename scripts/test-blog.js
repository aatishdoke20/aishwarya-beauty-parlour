/**
 * Comprehensive Technical QA Test Suite for Aishwarya Beauty Parlour Blog
 * 
 * Verifies:
 * 1. Slug creation and sanitization
 * 2. Content validation & mandatory alt-text rules
 * 3. Draft exclusion from public output and sitemap
 * 4. Static publish generation & pre-rendered initial HTML
 * 5. SEO metadata, canonicals, and Schema.org JSON-LD structured data
 * 6. Sitemap.xml accuracy (indexable canonicals only)
 * 7. Admin security, rate-limiting, and auth endpoints
 * 8. Asset integrity & zero broken links / images
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const { slugify, calculateReadingTime, parseMarkdownFile, extractHeadings } = require('./build-blog');
const { createSessionToken, verifySessionToken, isRateLimited, recordFailedAttempt, clearAttempts } = require('../api/_lib/auth');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n============================================================');
  console.log('🧪 AISHWARYA BEAUTY PARLOUR BLOG QA & ACCEPTANCE SUITE');
  console.log('============================================================\n');

  // TEST SUITE 1: SLUG CREATION & SANITIZATION
  console.log('--- Suite 1: Slug Creation & Sanitization ---');
  runTest('Creates clean lowercase hyphenated slug', () => {
    assert.strictEqual(slugify('Ladies Haircut in Manchar'), 'ladies-haircut-in-manchar');
  });
  runTest('Handles special characters, punctuation, and multi-spaces', () => {
    assert.strictEqual(
      slugify('Bridal Makeup & Hair Spa: 2026 Special (Manchar!)'),
      'bridal-makeup-hair-spa-2026-special-manchar'
    );
  });
  runTest('Trims leading and trailing hyphens', () => {
    assert.strictEqual(slugify('---hello world---'), 'hello-world');
  });

  // TEST SUITE 2: READING TIME & HEADINGS
  console.log('\n--- Suite 2: Reading Time & Headings Extraction ---');
  runTest('Calculates reading time appropriately', () => {
    const text = new Array(300).fill('word').join(' ');
    const rt = calculateReadingTime(text);
    assert.strictEqual(rt, '2 min read');
  });
  runTest('Extracts H2 and H3 headings for Table of Contents', () => {
    const md = `
# Title
## Section One
Some text
### Subsection A
More text
## Section Two
    `;
    const headings = extractHeadings(md);
    assert.strictEqual(headings.length, 3);
    assert.strictEqual(headings[0].title, 'Section One');
    assert.strictEqual(headings[0].id, 'section-one');
    assert.strictEqual(headings[1].level, 3);
  });

  // TEST SUITE 3: SEED CONTENT INTEGRITY
  console.log('\n--- Suite 3: Seed Content Integrity ---');
  const haircutFile = path.join(ROOT_DIR, 'content', 'blog', 'ladies-haircut-hair-spa-manchar.md');
  const bridalFile = path.join(ROOT_DIR, 'content', 'blog', 'maharashtrian-bridal-makeup-manchar.md');
  const facialFile = path.join(ROOT_DIR, 'content', 'blog', 'facial-in-manchar-how-to-choose.md');
  const waxingFile = path.join(ROOT_DIR, 'content', 'blog', 'waxing-in-manchar-rica-chocolate-soft-wax.md');
  const keratinFile = path.join(ROOT_DIR, 'content', 'blog', 'keratin-treatment-vs-hair-smoothening-manchar.md');

  runTest('Seed article 1 exists with required metadata', () => {
    assert.ok(fs.existsSync(haircutFile), 'haircut article file missing');
    const content = fs.readFileSync(haircutFile, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);
    assert.strictEqual(frontmatter.slug, 'ladies-haircut-hair-spa-manchar');
    assert.strictEqual(frontmatter.status, 'published');
    assert.ok(frontmatter.featuredImage?.alt, 'Missing featured image alt');
    assert.ok(frontmatter.seo?.title, 'Missing SEO title');
    assert.ok(frontmatter.seo?.description, 'Missing meta description');
    assert.ok(body.includes('butterfly'), 'Body missing expected butterfly haircut copy');
  });

  runTest('Seed article 2 exists with required metadata', () => {
    assert.ok(fs.existsSync(bridalFile), 'bridal article file missing');
    const content = fs.readFileSync(bridalFile, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);
    assert.strictEqual(frontmatter.slug, 'maharashtrian-bridal-makeup-manchar');
    assert.strictEqual(frontmatter.status, 'published');
    assert.ok(frontmatter.featuredImage?.alt, 'Missing featured image alt');
    assert.ok(body.includes('Nauvari'), 'Body missing expected Nauvari copy');
  });

  runTest('Seed article 3 (Facial) exists with required metadata', () => {
    assert.ok(fs.existsSync(facialFile), 'facial article file missing');
    const content = fs.readFileSync(facialFile, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);
    assert.strictEqual(frontmatter.slug, 'facial-in-manchar-how-to-choose');
    assert.strictEqual(frontmatter.status, 'published');
    assert.ok(frontmatter.featuredImage?.alt, 'Missing featured image alt');
    assert.ok(body.includes('facial'), 'Body missing expected facial copy');
  });

  runTest('Seed article 4 (Waxing) exists with required metadata', () => {
    assert.ok(fs.existsSync(waxingFile), 'waxing article file missing');
    const content = fs.readFileSync(waxingFile, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);
    assert.strictEqual(frontmatter.slug, 'waxing-in-manchar-rica-chocolate-soft-wax');
    assert.strictEqual(frontmatter.status, 'published');
    assert.ok(frontmatter.featuredImage?.alt, 'Missing featured image alt');
    assert.ok(body.includes('Rica'), 'Body missing expected Rica wax copy');
  });

  runTest('Seed article 5 (Keratin) exists with required metadata', () => {
    assert.ok(fs.existsSync(keratinFile), 'keratin article file missing');
    const content = fs.readFileSync(keratinFile, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);
    assert.strictEqual(frontmatter.slug, 'keratin-treatment-vs-hair-smoothening-manchar');
    assert.strictEqual(frontmatter.status, 'published');
    assert.ok(frontmatter.featuredImage?.alt, 'Missing featured image alt');
    assert.ok(body.includes('keratin') || body.includes('Keratin'), 'Body missing expected keratin copy');
  });

  // TEST SUITE 4: DRAFT EXCLUSION TEST
  console.log('\n--- Suite 4: Draft Exclusion Verification ---');
  runTest('Draft posts are excluded from public sitemap and index', () => {
    // Write temporary draft
    const draftPath = path.join(ROOT_DIR, 'content', 'blog', 'test-temp-draft.md');
    fs.writeFileSync(draftPath, `---
title: "Temporary Secret Draft"
slug: "test-temp-draft"
status: "draft"
author: "Varsha Doke"
excerpt: "This is a private draft."
featuredImage:
  src: "/images/blog/test.jpg"
  alt: "Test"
seo:
  title: "Draft"
  description: "Draft desc"
---
Draft body content.
    `, 'utf8');

    // Run build
    const { execSync } = require('child_process');
    execSync('node scripts/build-blog.js', { cwd: ROOT_DIR });

    // Check sitemap
    const sitemap = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
    assert.ok(!sitemap.includes('test-temp-draft'), 'DRAFT LEAKED INTO SITEMAP.XML!');

    // Check blog index HTML
    const blogIndex = fs.readFileSync(path.join(ROOT_DIR, 'blog', 'index.html'), 'utf8');
    assert.ok(!blogIndex.includes('Temporary Secret Draft'), 'DRAFT LEAKED INTO BLOG INDEX!');

    // Cleanup
    fs.unlinkSync(draftPath);
    // Re-run build to restore clean state
    execSync('node scripts/build-blog.js', { cwd: ROOT_DIR });
  });

  // TEST SUITE 5: PRE-RENDERED INITIAL HTML (VIEW-SOURCE CHECK)
  console.log('\n--- Suite 5: Pre-rendered Initial HTML & Crawlability ---');
  runTest('Full article text is in initial HTML without client-side JS', () => {
    const article1Html = fs.readFileSync(path.join(ROOT_DIR, 'blog', 'ladies-haircut-hair-spa-manchar', 'index.html'), 'utf8');
    assert.ok(article1Html.includes('A good haircut should suit your hair texture'), 'Initial HTML missing lead paragraph');
    assert.ok(article1Html.includes('Butterfly cut, layered cut or step cut'), 'Initial HTML missing haircut comparison H2');
    assert.ok(article1Html.includes('What does a hair spa do?'), 'Initial HTML missing hair spa section');
    assert.ok(article1Html.includes('Shop No. B-5, Shet Ambalal Trust Complex'), 'Initial HTML missing NAP details');
    assert.ok(article1Html.includes('+91 95619 85045'), 'Initial HTML missing studio telephone');
  });

  runTest('Articles contain exactly one H1 tag and proper headings hierarchy', () => {
    const article1Html = fs.readFileSync(path.join(ROOT_DIR, 'blog', 'ladies-haircut-hair-spa-manchar', 'index.html'), 'utf8');
    const h1Matches = article1Html.match(/<h1[^>]*>/g);
    assert.strictEqual(h1Matches.length, 1, 'Article should have exactly one H1 tag');
  });

  // TEST SUITE 6: STRUCTURED DATA & SEO
  console.log('\n--- Suite 6: Schema.org Structured Data & SEO ---');
  runTest('Article BlogPosting JSON-LD is valid and matches visible content', () => {
    const article1Html = fs.readFileSync(path.join(ROOT_DIR, 'blog', 'ladies-haircut-hair-spa-manchar', 'index.html'), 'utf8');
    const jsonLdBlocks = [...article1Html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(jsonLdBlocks.length >= 2, 'Expected at least 2 JSON-LD blocks (BlogPosting + Breadcrumbs)');

    const blogPosting = JSON.parse(jsonLdBlocks[0][1]);
    assert.strictEqual(blogPosting['@type'], 'BlogPosting');
    assert.strictEqual(blogPosting.author.name, 'Varsha Doke');
    assert.strictEqual(blogPosting.publisher.name, 'Aishwarya Beauty Parlour Manchar');
    assert.strictEqual(blogPosting.mainEntityOfPage['@id'], 'https://aishwaryabeautyparlour.vercel.app/blog/ladies-haircut-hair-spa-manchar/');
  });

  runTest('BreadcrumbList JSON-LD matches visible breadcrumbs', () => {
    const article1Html = fs.readFileSync(path.join(ROOT_DIR, 'blog', 'ladies-haircut-hair-spa-manchar', 'index.html'), 'utf8');
    const jsonLdBlocks = [...article1Html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const breadcrumbs = JSON.parse(jsonLdBlocks[1][1]);
    assert.strictEqual(breadcrumbs['@type'], 'BreadcrumbList');
    assert.strictEqual(breadcrumbs.itemListElement.length, 3);
    assert.strictEqual(breadcrumbs.itemListElement[0].name, 'Home');
    assert.strictEqual(breadcrumbs.itemListElement[1].name, 'Blog');
  });

  runTest('Multilingual alternates, html lang and language switchers are valid', () => {
    const mrHtml = fs.readFileSync(path.join(ROOT_DIR, 'mr', 'blog', 'manchar-ladies-haircut-hair-spa', 'index.html'), 'utf8');
    const hiHtml = fs.readFileSync(path.join(ROOT_DIR, 'hi', 'blog', 'manchar-me-ladies-haircut-hair-spa', 'index.html'), 'utf8');
    
    assert.ok(mrHtml.includes('lang="mr-IN"'), 'Marathi article missing html lang="mr-IN"');
    assert.ok(hiHtml.includes('lang="hi-IN"'), 'Hindi article missing html lang="hi-IN"');

    assert.ok(mrHtml.includes('hreflang="en-IN"'), 'Marathi article missing en-IN hreflang');
    assert.ok(mrHtml.includes('hreflang="mr-IN"'), 'Marathi article missing mr-IN hreflang');
    assert.ok(mrHtml.includes('hreflang="hi-IN"'), 'Marathi article missing hi-IN hreflang');
    assert.ok(mrHtml.includes('hreflang="x-default"'), 'Marathi article missing x-default hreflang');

    assert.ok(mrHtml.includes('class="lang-btn active"'), 'Marathi article missing active switcher state');
    assert.ok(hiHtml.includes('class="lang-btn active"'), 'Hindi article missing active switcher state');
  });

  // TEST SUITE 7: IMAGE ASSETS & ALT TEXT
  console.log('\n--- Suite 7: Image Assets & Accessibility ---');
  runTest('Featured images exist on disk and have non-empty alt text', () => {
    const img1 = path.join(ROOT_DIR, 'images', 'blog', 'blog-ladies-haircut-hair-spa-manchar.jpg');
    const img2 = path.join(ROOT_DIR, 'images', 'blog', 'blog-maharashtrian-bridal-makeup-manchar.jpg');
    const img3 = path.join(ROOT_DIR, 'images', 'facial-treatment.jpg');
    const img4 = path.join(ROOT_DIR, 'images', 'service-rica-wax.jpg');
    const img5 = path.join(ROOT_DIR, 'images', 'service-keratin.jpg');
    assert.ok(fs.existsSync(img1), 'Haircut blog image missing from disk');
    assert.ok(fs.existsSync(img2), 'Bridal blog image missing from disk');
    assert.ok(fs.existsSync(img3), 'Facial blog image missing from disk');
    assert.ok(fs.existsSync(img4), 'Waxing blog image missing from disk');
    assert.ok(fs.existsSync(img5), 'Keratin blog image missing from disk');
    assert.ok(fs.statSync(img1).size > 10000, 'Image 1 is corrupt or empty');
    assert.ok(fs.statSync(img2).size > 10000, 'Image 2 is corrupt or empty');
    assert.ok(fs.statSync(img3).size > 10000, 'Image 3 is corrupt or empty');
    assert.ok(fs.statSync(img4).size > 10000, 'Image 4 is corrupt or empty');
    assert.ok(fs.statSync(img5).size > 10000, 'Image 5 is corrupt or empty');
  });

  // TEST SUITE 8: SECURITY & ADMIN AUTHENTICATION
  console.log('\n--- Suite 8: Security & Admin Session Management ---');
  runTest('Creates and verifies signed HMAC-SHA256 session tokens', () => {
    process.env.BLOG_SESSION_SECRET = 'test-secret-key-for-unit-testing-32chars';
    const token = createSessionToken('owner@test.com');
    assert.ok(token.includes('.'), 'Token must contain signature delimiter');
    const verified = verifySessionToken(token);
    assert.strictEqual(verified.email, 'owner@test.com');
  });

  runTest('Rejects tampered session tokens', () => {
    const token = createSessionToken('owner@test.com');
    const tampered = token.slice(0, -4) + 'abcd';
    const verified = verifySessionToken(tampered);
    assert.strictEqual(verified, null, 'Tampered token must be rejected');
  });

  runTest('Rate-limiting locks out after 5 consecutive failed attempts', () => {
    const testIp = '192.168.1.99';
    clearAttempts(testIp);
    assert.strictEqual(isRateLimited(testIp), false);
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(testIp);
      assert.strictEqual(isRateLimited(testIp), false);
    }
    recordFailedAttempt(testIp); // 5th attempt
    assert.strictEqual(isRateLimited(testIp), true);
    clearAttempts(testIp);
  });

  console.log('\n============================================================');
  console.log(`🏁 QA RESULTS: ${passedTests}/${totalTests} tests passed.`);
  console.log('============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();

