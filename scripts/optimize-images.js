const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.resolve(__dirname, '..', 'images');

async function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(await getAllImages(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(item) && !item.includes('.optimized.')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeAll() {
  console.log('🖼️  Optimizing all images across Aishwarya Beauty Parlour...');
  const images = await getAllImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to optimize.`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const imgPath of images) {
    const inputBuffer = fs.readFileSync(imgPath);
    const beforeSize = inputBuffer.length;
    totalBefore += beforeSize;

    const relPath = path.relative(path.resolve(__dirname, '..'), imgPath);
    const meta = await sharp(inputBuffer).metadata();

    // Determine target width
    let maxWidth = 1200;
    if (relPath.includes('hero')) {
      maxWidth = 1200;
    } else if (relPath.includes('service-') || relPath.includes('blog')) {
      maxWidth = 960;
    } else if (meta.width < 960) {
      maxWidth = meta.width;
    }

    // 1. Optimize JPEG
    const isPng = /\.png$/i.test(imgPath);
    let optBuffer;
    if (isPng) {
      optBuffer = await sharp(inputBuffer)
        .resize({ width: Math.min(meta.width, maxWidth), withoutEnlargement: true })
        .png({ compressionLevel: 9, effort: 8 })
        .toBuffer();
    } else {
      optBuffer = await sharp(inputBuffer)
        .resize({ width: Math.min(meta.width, maxWidth), withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true, progressive: true })
        .toBuffer();
    }

    // Write back optimized version
    fs.writeFileSync(imgPath, optBuffer);
    const afterSize = optBuffer.length;
    totalAfter += afterSize;

    // 2. Also generate .webp sibling
    const parsed = path.parse(imgPath);
    const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: Math.min(meta.width, maxWidth), withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    fs.writeFileSync(webpPath, webpBuffer);

    const savedPercent = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
    console.log(`  ⚡ ${relPath}: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (-${savedPercent}%) | WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB`);
  }

  const totalSavedMb = ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2);
  const totalSavedPct = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);

  console.log('\n============================================================');
  console.log(`🎉 Image Optimization Complete!`);
  console.log(`Original Total: ${(totalBefore / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized Total: ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Saved: ${totalSavedMb} MB (-${totalSavedPct}%)`);
  console.log('============================================================\n');
}

optimizeAll().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
