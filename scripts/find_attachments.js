const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\4c2e55fc-dd5f-496a-8cc1-32de7578f212\\.system_generated\\logs\\transcript.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('USER_INPUT') && line.includes('SITE ARCHITECTURE PROMPT')) {
    const obj = JSON.parse(line);
    console.log('Keys in step:', Object.keys(obj));
    console.log('content sample:', JSON.stringify(obj.content).substring(0, 500));
    // Check if there are media or attachments or files
    for (const key of Object.keys(obj)) {
      if (key !== 'content') {
        console.log(key, ':', JSON.stringify(obj[key]).substring(0, 300));
      }
    }
  }
});
