const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPECTED_DOMAIN = 'https://aishwaryabeautyparlour.vercel.app';

const pages = [
  { file: 'index.html', canonical: `${EXPECTED_DOMAIN}/` },
  { file: 'about.html', canonical: `${EXPECTED_DOMAIN}/about.html` },
  { file: 'services.html', canonical: `${EXPECTED_DOMAIN}/services.html` },
  { file: 'bridal-makeup.html', canonical: `${EXPECTED_DOMAIN}/bridal-makeup.html` },
  { file: 'gallery.html', canonical: `${EXPECTED_DOMAIN}/gallery.html` },
  { file: 'location.html', canonical: `${EXPECTED_DOMAIN}/location.html` },
  { file: 'contact.html', canonical: `${EXPECTED_DOMAIN}/contact.html` },
  { file: 'blog/index.html', canonical: `${EXPECTED_DOMAIN}/blog/` },
  { file: 'blog/ladies-haircut-hair-spa-manchar/index.html', canonical: `${EXPECTED_DOMAIN}/blog/ladies-haircut-hair-spa-manchar/` },
  { file: 'blog/maharashtrian-bridal-makeup-manchar/index.html', canonical: `${EXPECTED_DOMAIN}/blog/maharashtrian-bridal-makeup-manchar/` },
];

let errors = [];

// 1. Verify robots.txt
console.log('--- Checking robots.txt ---');
const robotsContent = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!robotsContent.includes(`Sitemap: ${EXPECTED_DOMAIN}/sitemap.xml`)) {
  errors.push('robots.txt does not contain correct Sitemap directive');
} else {
  console.log('✅ robots.txt points to correct sitemap URL');
}
if (robotsContent.includes('.in') || robotsContent.includes('workers.dev')) {
  errors.push('robots.txt contains stale domain references');
}

// 2. Verify sitemap.xml
console.log('\n--- Checking sitemap.xml ---');
const sitemapContent = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
pages.forEach(p => {
  if (!sitemapContent.includes(`<loc>${p.canonical}</loc>`)) {
    errors.push(`sitemap.xml missing <loc>${p.canonical}</loc>`);
  } else {
    console.log(`✅ sitemap.xml contains: ${p.canonical}`);
  }
});
if (sitemapContent.includes('.in') || sitemapContent.includes('workers.dev')) {
  errors.push('sitemap.xml contains stale domain references');
}

// 3. Verify HTML pages
console.log('\n--- Checking HTML Pages ---');
pages.forEach(p => {
  const filePath = path.join(ROOT, p.file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check canonical
  const canonicalMatches = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g);
  if (!canonicalMatches) {
    errors.push(`${p.file} is missing canonical tag`);
  } else if (canonicalMatches.length !== 1) {
    errors.push(`${p.file} has multiple canonical tags: ${canonicalMatches.length}`);
  } else {
    const hrefMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
    if (hrefMatch[1] !== p.canonical) {
      errors.push(`${p.file} canonical mismatch: expected ${p.canonical}, got ${hrefMatch[1]}`);
    } else {
      console.log(`✅ ${p.file}: Exactly 1 valid canonical (${hrefMatch[1]})`);
    }
  }

  // Check og:url
  const ogUrlMatch = content.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
  if (!ogUrlMatch) {
    errors.push(`${p.file} missing og:url`);
  } else if (ogUrlMatch[1] !== p.canonical) {
    errors.push(`${p.file} og:url (${ogUrlMatch[1]}) does not match canonical (${p.canonical})`);
  } else {
    console.log(`✅ ${p.file}: og:url matches canonical`);
  }

  // Check og:image absolute URL
  const ogImageMatch = content.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  if (!ogImageMatch) {
    errors.push(`${p.file} missing og:image`);
  } else if (!ogImageMatch[1].startsWith('http')) {
    errors.push(`${p.file} og:image is relative: ${ogImageMatch[1]}`);
  } else {
    console.log(`✅ ${p.file}: og:image is absolute URL`);
  }

  // Check JSON-LD
  const jsonLdMatches = content.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  if (jsonLdMatches) {
    jsonLdMatches.forEach((block, idx) => {
      const jsonText = block.replace(/<script\s+type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      try {
        JSON.parse(jsonText);
        console.log(`✅ ${p.file}: JSON-LD block ${idx + 1} valid JSON`);
      } catch (e) {
        errors.push(`${p.file} JSON-LD block ${idx + 1} invalid JSON: ${e.message}`);
      }
    });
  }

  // Stale domain check
  if (content.includes('aishwaryabeautyparlour.in')) {
    errors.push(`${p.file} contains stale domain aishwaryabeautyparlour.in`);
  }
  if (content.includes('workers.dev')) {
    errors.push(`${p.file} contains stale domain workers.dev`);
  }
});

console.log('\n--- Final Verification Summary ---');
if (errors.length === 0) {
  console.log('🎉 ALL SEO CHECKS PASSED WITH ZERO ERRORS!');
  process.exit(0);
} else {
  console.error('❌ Errors found:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
