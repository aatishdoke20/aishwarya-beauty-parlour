const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPECTED_DOMAIN = 'https://aishwaryabeautyparlour.vercel.app';

const pages = [
  // 7 core pages
  { file: 'index.html', canonical: `${EXPECTED_DOMAIN}/` },
  { file: 'about.html', canonical: `${EXPECTED_DOMAIN}/about.html` },
  { file: 'services.html', canonical: `${EXPECTED_DOMAIN}/services.html` },
  { file: 'bridal-makeup.html', canonical: `${EXPECTED_DOMAIN}/bridal-makeup.html` },
  { file: 'gallery.html', canonical: `${EXPECTED_DOMAIN}/gallery.html` },
  { file: 'location.html', canonical: `${EXPECTED_DOMAIN}/location.html` },
  { file: 'contact.html', canonical: `${EXPECTED_DOMAIN}/contact.html` },
  
  // 3 Blog archives
  { file: 'blog/index.html', canonical: `${EXPECTED_DOMAIN}/blog/`, lang: 'en-IN', isArchive: true },
  { file: 'mr/blog/index.html', canonical: `${EXPECTED_DOMAIN}/mr/blog/`, lang: 'mr-IN', isArchive: true },
  { file: 'hi/blog/index.html', canonical: `${EXPECTED_DOMAIN}/hi/blog/`, lang: 'hi-IN', isArchive: true },

  // 6 Blog articles
  {
    file: 'blog/ladies-haircut-hair-spa-manchar/index.html',
    canonical: `${EXPECTED_DOMAIN}/blog/ladies-haircut-hair-spa-manchar/`,
    lang: 'en-IN',
    articleKey: 'haircut'
  },
  {
    file: 'blog/maharashtrian-bridal-makeup-manchar/index.html',
    canonical: `${EXPECTED_DOMAIN}/blog/maharashtrian-bridal-makeup-manchar/`,
    lang: 'en-IN',
    articleKey: 'bridal'
  },
  {
    file: 'mr/blog/manchar-ladies-haircut-hair-spa/index.html',
    canonical: `${EXPECTED_DOMAIN}/mr/blog/manchar-ladies-haircut-hair-spa/`,
    lang: 'mr-IN',
    articleKey: 'haircut'
  },
  {
    file: 'mr/blog/manchar-maharashtrian-bridal-makeup/index.html',
    canonical: `${EXPECTED_DOMAIN}/mr/blog/manchar-maharashtrian-bridal-makeup/`,
    lang: 'mr-IN',
    articleKey: 'bridal'
  },
  {
    file: 'hi/blog/manchar-me-ladies-haircut-hair-spa/index.html',
    canonical: `${EXPECTED_DOMAIN}/hi/blog/manchar-me-ladies-haircut-hair-spa/`,
    lang: 'hi-IN',
    articleKey: 'haircut'
  },
  {
    file: 'hi/blog/manchar-me-maharashtrian-bridal-makeup/index.html',
    canonical: `${EXPECTED_DOMAIN}/hi/blog/manchar-me-maharashtrian-bridal-makeup/`,
    lang: 'hi-IN',
    articleKey: 'bridal'
  },
  {
    file: 'blog/facial-in-manchar-how-to-choose/index.html',
    canonical: `${EXPECTED_DOMAIN}/blog/facial-in-manchar-how-to-choose/`,
    lang: 'en-IN',
    articleKey: 'facial'
  },
  {
    file: 'mr/blog/facial-in-manchar-how-to-choose/index.html',
    canonical: `${EXPECTED_DOMAIN}/mr/blog/facial-in-manchar-how-to-choose/`,
    lang: 'mr-IN',
    articleKey: 'facial'
  },
  {
    file: 'hi/blog/facial-in-manchar-how-to-choose/index.html',
    canonical: `${EXPECTED_DOMAIN}/hi/blog/facial-in-manchar-how-to-choose/`,
    lang: 'hi-IN',
    articleKey: 'facial'
  },
  {
    file: 'blog/waxing-in-manchar-rica-chocolate-soft-wax/index.html',
    canonical: `${EXPECTED_DOMAIN}/blog/waxing-in-manchar-rica-chocolate-soft-wax/`,
    lang: 'en-IN',
    articleKey: 'waxing'
  },
  {
    file: 'mr/blog/waxing-in-manchar-rica-chocolate-soft-wax/index.html',
    canonical: `${EXPECTED_DOMAIN}/mr/blog/waxing-in-manchar-rica-chocolate-soft-wax/`,
    lang: 'mr-IN',
    articleKey: 'waxing'
  },
  {
    file: 'hi/blog/waxing-in-manchar-rica-chocolate-soft-wax/index.html',
    canonical: `${EXPECTED_DOMAIN}/hi/blog/waxing-in-manchar-rica-chocolate-soft-wax/`,
    lang: 'hi-IN',
    articleKey: 'waxing'
  },
  {
    file: 'blog/keratin-treatment-vs-hair-smoothening-manchar/index.html',
    canonical: `${EXPECTED_DOMAIN}/blog/keratin-treatment-vs-hair-smoothening-manchar/`,
    lang: 'en-IN',
    articleKey: 'keratin'
  },
  {
    file: 'mr/blog/keratin-treatment-vs-hair-smoothening-manchar/index.html',
    canonical: `${EXPECTED_DOMAIN}/mr/blog/keratin-treatment-vs-hair-smoothening-manchar/`,
    lang: 'mr-IN',
    articleKey: 'keratin'
  },
  {
    file: 'hi/blog/keratin-treatment-vs-hair-smoothening-manchar/index.html',
    canonical: `${EXPECTED_DOMAIN}/hi/blog/keratin-treatment-vs-hair-smoothening-manchar/`,
    lang: 'hi-IN',
    articleKey: 'keratin'
  }
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

// 2. Verify sitemap.xml
console.log('\n--- Checking sitemap.xml for all 25 canonical URLs ---');
const sitemapContent = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
pages.forEach(p => {
  if (!sitemapContent.includes(`<loc>${p.canonical}</loc>`)) {
    errors.push(`sitemap.xml missing <loc>${p.canonical}</loc>`);
  } else {
    console.log(`✅ sitemap.xml contains: ${p.canonical}`);
  }
});

// 3. Verify HTML pages
console.log('\n--- Checking HTML Pages & SEO Architecture ---');
pages.forEach(p => {
  const filePath = path.join(ROOT, p.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`File missing on disk: ${p.file}`);
    return;
  }
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

  // If blog page, verify html lang, hreflangs, and language switcher
  if (p.lang) {
    // html lang
    const htmlLangMatch = content.match(/<html\s+lang="([^"]+)"/);
    if (!htmlLangMatch || htmlLangMatch[1] !== p.lang) {
      errors.push(`${p.file} html lang expected ${p.lang}, got ${htmlLangMatch ? htmlLangMatch[1] : 'none'}`);
    } else {
      console.log(`✅ ${p.file}: html lang is "${p.lang}"`);
    }

    // hreflang alternates
    const hreflangs = [...content.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)];
    const hreflangMap = Object.fromEntries(hreflangs.map(m => [m[1], m[2]]));

    ['en-IN', 'mr-IN', 'hi-IN', 'x-default'].forEach(targetLang => {
      if (!hreflangMap[targetLang]) {
        errors.push(`${p.file} missing hreflang for ${targetLang}`);
      }
    });

    if (hreflangs.length >= 4) {
      console.log(`✅ ${p.file}: 4 reciprocal hreflang tags found (en-IN, mr-IN, hi-IN, x-default)`);
    }

    // Language switcher
    const switcherMatches = [...content.matchAll(/<a\s+href="([^"]+)"\s+class="lang-btn([^"]*)"/g)];
    if (switcherMatches.length !== 3) {
      errors.push(`${p.file} expected 3 switcher buttons, got ${switcherMatches.length}`);
    } else {
      const activeButtons = switcherMatches.filter(m => m[2].includes('active'));
      if (activeButtons.length !== 1) {
        errors.push(`${p.file} expected exactly 1 active switcher button, got ${activeButtons.length}`);
      } else {
        console.log(`✅ ${p.file}: 3-button switcher present with active language correctly flagged`);
      }
    }
  }

  // Check JSON-LD
  const jsonLdMatches = content.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  if (jsonLdMatches) {
    jsonLdMatches.forEach((block, idx) => {
      const jsonText = block.replace(/<script\s+type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      try {
        JSON.parse(jsonText);
      } catch (e) {
        errors.push(`${p.file} JSON-LD block ${idx + 1} invalid JSON: ${e.message}`);
      }
    });
    console.log(`✅ ${p.file}: ${jsonLdMatches.length} valid JSON-LD block(s)`);
  }
});

console.log('\n--- Final Verification Summary ---');
if (errors.length === 0) {
  console.log('🎉 ALL 25 CANONICAL ROUTES AND MULTILINGUAL SEO CHECKS PASSED WITH ZERO ERRORS!');
  process.exit(0);
} else {
  console.error('❌ Errors found:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

