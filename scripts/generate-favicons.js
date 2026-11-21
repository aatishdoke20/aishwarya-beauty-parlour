const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'images');

// 1. Beautiful, highly professional Salon Crest Logo SVG (Vector)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="35%" stop-color="#F3E5AB"/>
      <stop offset="65%" stop-color="#AA7A1E"/>
      <stop offset="100%" stop-color="#7B5512"/>
    </linearGradient>
    <linearGradient id="blushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A65355"/>
      <stop offset="100%" stop-color="#752B2D"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F7F1E6"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#7B5512" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="256" cy="256" r="248" fill="url(#bgGrad)"/>
  
  <!-- Outer Decorative Ring -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
  <circle cx="256" cy="256" r="228" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="4,6"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="url(#goldGrad)" stroke-width="2.5"/>

  <!-- Botanical Wreath Accents (Left & Right) -->
  <g fill="url(#goldGrad)" opacity="0.85">
    <!-- Left Leaves -->
    <path d="M120 256 C115 230 130 205 145 190 C140 210 135 235 140 256 Z"/>
    <path d="M110 280 C110 305 125 325 142 335 C135 315 130 295 132 280 Z"/>
    <!-- Right Leaves -->
    <path d="M392 256 C397 230 382 205 367 190 C372 210 377 235 372 256 Z"/>
    <path d="M402 280 C402 305 387 325 370 335 C377 315 382 295 380 280 Z"/>
  </g>

  <!-- Central Crest Emblem: Ornate 'A' -->
  <g filter="url(#shadow)">
    <!-- Main Letter A in Cormorant / Didot Editorial Serif Style -->
    <path d="M256 96 L278 96 L356 320 L318 320 L298 260 L214 260 L194 320 L156 320 L234 96 Z M256 142 L225 234 L287 234 Z" fill="url(#blushGrad)"/>
    
    <!-- Gold Serif Accents & Crown Flourish -->
    <!-- Crown / Tiara Flourish above A -->
    <path d="M256 70 C262 82 272 88 285 88 C275 92 265 92 256 86 C247 92 237 92 227 88 C240 88 250 82 256 70 Z" fill="url(#goldGrad)"/>
    <circle cx="256" cy="62" r="5" fill="url(#goldGrad)"/>
    <circle cx="236" cy="74" r="3.5" fill="url(#goldGrad)"/>
    <circle cx="276" cy="74" r="3.5" fill="url(#goldGrad)"/>

    <!-- Crossbar Floral Scroll -->
    <path d="M210 248 Q256 262 302 248 Q256 254 210 248 Z" fill="url(#goldGrad)"/>
  </g>

  <!-- Ribbon / Brand Banner -->
  <g>
    <!-- Brand Name Text -->
    <text x="256" y="375" text-anchor="middle" font-family="'Marcellus', 'Cormorant Garamond', 'Georgia', serif" font-size="28" font-weight="700" letter-spacing="4" fill="#752B2D">AISHWARYA</text>
    <text x="256" y="405" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="14" font-weight="600" letter-spacing="3" fill="#8C6521">BEAUTY PARLOUR</text>
    <text x="256" y="428" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="11" font-weight="500" letter-spacing="4" fill="#AA7A1E">MANCHAR</text>
    
    <!-- Stars / Diamond separator -->
    <path d="M256 442 L258 447 L263 447 L259 450 L261 455 L256 452 L251 455 L253 450 L249 447 L254 447 Z" fill="url(#goldGrad)"/>
  </g>
</svg>`;

async function generateAssets() {
  console.log('✨ Generating Logo, Favicons, and Brand Assets for www.aishwaryaparlour.in...');

  // 1. Save Vector Logo SVG
  const logoSvgPath = path.join(IMAGES_DIR, 'logo.svg');
  const faviconSvgPath = path.join(ROOT_DIR, 'favicon.svg');
  fs.writeFileSync(logoSvgPath, logoSvg, 'utf8');
  fs.writeFileSync(faviconSvgPath, logoSvg, 'utf8');
  console.log('  ✅ Created: images/logo.svg & favicon.svg');

  const svgBuffer = Buffer.from(logoSvg);

  // 2. High-Res Logo PNG (512x512) for Google Schema.org & OpenGraph
  const logoPngPath = path.join(IMAGES_DIR, 'logo.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile(logoPngPath);
  console.log('  ✅ Created: images/logo.png (512x512)');

  // 3. Google Search Snippet Favicon (192x192) - Google requires multiple of 48px
  const icon192Path = path.join(IMAGES_DIR, 'favicon-192x192.png');
  await sharp(svgBuffer).resize(192, 192).png().toFile(icon192Path);
  console.log('  ✅ Created: images/favicon-192x192.png (192x192 for Google Search Snippet)');

  // 4. Apple Touch Icon (180x180) for iOS Safari
  const appleTouchPath = path.join(IMAGES_DIR, 'apple-touch-icon.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile(appleTouchPath);
  console.log('  ✅ Created: images/apple-touch-icon.png (180x180)');

  // 5. Standard desktop browser favicons (96x96, 48x48, 32x32, 16x16)
  const icon96Path = path.join(IMAGES_DIR, 'favicon-96x96.png');
  await sharp(svgBuffer).resize(96, 96).png().toFile(icon96Path);
  console.log('  ✅ Created: images/favicon-96x96.png');

  const icon48Path = path.join(IMAGES_DIR, 'favicon-48x48.png');
  await sharp(svgBuffer).resize(48, 48).png().toFile(icon48Path);
  console.log('  ✅ Created: images/favicon-48x48.png');

  const icon32Path = path.join(IMAGES_DIR, 'favicon-32x32.png');
  await sharp(svgBuffer).resize(32, 32).png().toFile(icon32Path);
  console.log('  ✅ Created: images/favicon-32x32.png');

  // 6. Root favicon.ico (standard 48x48 or 32x32 PNG inside ico container)
  const rootFaviconIco = path.join(ROOT_DIR, 'favicon.ico');
  const buf48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(rootFaviconIco, buf48);
  console.log('  ✅ Created: /favicon.ico (48x48 standard root icon)');

  // 7. Web App Manifest (site.webmanifest)
  const manifest = {
    name: "Aishwarya Beauty Parlour Manchar",
    short_name: "Aishwarya Parlour",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#A65355",
    icons: [
      {
        src: "/images/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync(path.join(ROOT_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('  ✅ Created: site.webmanifest');

  console.log('\n🎉 Brand logo & favicon generation completed successfully!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
