const fs = require('fs');
const path = require('path');

function search(dir, depth=0) {
  if (depth > 4) return [];
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (item === 'node_modules' || item.startsWith('.') || item === 'AppData' || item === 'Local') continue;
      const p = path.join(dir, item);
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          results.push(...search(p, depth + 1));
        } else if (/\.(png|jpg|jpeg|webp)$/i.test(item) && s.mtimeMs > Date.now() - 2 * 3600 * 1000) {
          results.push({ path: p, size: s.size, mtime: s.mtime });
        }
      } catch(e){}
    }
  } catch(e){}
  return results;
}

const dirsToSearch = [
  'C:\\Users\\Dell\\Downloads',
  'C:\\Users\\Dell\\Pictures',
  'C:\\Users\\Dell\\Desktop',
  'f:\\'
];

dirsToSearch.forEach(d => {
  console.log('Searching in:', d);
  const res = search(d);
  res.forEach(r => console.log('Found:', r.path, r.size, r.mtime));
});
