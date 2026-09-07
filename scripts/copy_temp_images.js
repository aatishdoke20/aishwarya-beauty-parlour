const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Dell\\Downloads';
const targetDir = 'f:\\Aishwarya Parlour\\images';

const files = [
  'ChatGPT Image Sep 4, 2026, 01_23_05 PM.png',
  'ChatGPT Image Sep 4, 2026, 01_23_14 PM.png',
  'ChatGPT Image Sep 4, 2026, 01_23_25 PM.png',
  'ChatGPT Image Sep 4, 2026, 01_24_00 PM.png'
];

files.forEach((f, idx) => {
  const src = path.join(srcDir, f);
  const dest = path.join(targetDir, `supplied-temp-${idx + 1}.png`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${f} -> supplied-temp-${idx + 1}.png`);
});
