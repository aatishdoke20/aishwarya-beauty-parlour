const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\4c2e55fc-dd5f-496a-8cc1-32de7578f212\\.system_generated\\logs\\transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":71')) {
    const obj = JSON.parse(line);
    console.log('Keys in step 71:', Object.keys(obj));
    if (obj.content) {
      if (typeof obj.content === 'string') {
        console.log('Content is string, length:', obj.content.length);
        // check if data:image or file paths
        const matches = obj.content.match(/[A-Za-z]:[\\\/][^\s\"\'\<\>]+/g);
        console.log('File matches in string:', matches);
      } else if (Array.isArray(obj.content)) {
        console.log('Content is array, items:', obj.content.length);
        obj.content.forEach((item, idx) => {
          console.log(`Item ${idx}:`, typeof item, item.type, Object.keys(item));
          if (item.image_url) console.log('image_url:', JSON.stringify(item.image_url).substring(0, 200));
          if (item.source) console.log('source:', JSON.stringify(item.source).substring(0, 200));
        });
      } else {
        console.log('Content is object:', Object.keys(obj.content));
      }
    }
  }
});
