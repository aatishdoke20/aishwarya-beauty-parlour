const fs = require('fs');
const path = require('path');

const files = [
  'C:\\Users\\Dell\\Downloads\\ChatGPT Image Sep 4, 2026, 01_23_05 PM.png',
  'C:\\Users\\Dell\\Downloads\\ChatGPT Image Sep 4, 2026, 01_23_14 PM.png',
  'C:\\Users\\Dell\\Downloads\\ChatGPT Image Sep 4, 2026, 01_23_25 PM.png',
  'C:\\Users\\Dell\\Downloads\\ChatGPT Image Sep 4, 2026, 01_24_00 PM.png'
];

files.forEach(f => {
  const buf = fs.readFileSync(f);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  console.log(path.basename(f), ':', width, 'x', height, 'Size:', Math.round(buf.length/1024), 'KB');
});
