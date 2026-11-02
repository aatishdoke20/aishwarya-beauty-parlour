const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. API Routes Handling (Vercel serverless emulation)
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace('/api/', '').split('/')[0];
    const apiFile = path.join(ROOT_DIR, 'api', `${route}.js`);

    if (fs.existsSync(apiFile)) {
      try {
        const handler = require(apiFile);

        // Parse JSON body if present
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          if (body) {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = {};
            }
          }
          req.query = parsedUrl.query;

          // Polyfill simple res.status().json()
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          try {
            await handler(req, res);
          } catch (handlerErr) {
            console.error('API Error:', handlerErr);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: handlerErr.message }));
          }
        });
        return;
      } catch (loadErr) {
        console.error('Failed to load API route:', loadErr);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Server handler error' }));
      }
    } else {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'API route not found' }));
    }
  }

  // 2. Static File Handling
  let cleanUrl = pathname;
  let safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, '');

  if (safePath === '/' || safePath === '\\') {
    safePath = 'index.html';
  } else {
    safePath = safePath.replace(/^[\/\\]+/, '');
  }

  let filePath = path.join(ROOT_DIR, safePath);

  // If path is a directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexInDir = path.join(filePath, 'index.html');
    if (fs.existsSync(indexInDir)) {
      filePath = indexInDir;
    }
  }

  // If not found and no extension, try with .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Clean URL rewrites for /admin and /admin/blog
  if (cleanUrl === '/admin' || cleanUrl === '/admin/blog') {
    filePath = path.join(ROOT_DIR, 'admin', 'blog', 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Aishwarya Beauty Parlour dev/preview server running at http://localhost:${PORT}`);
  console.log(`   - Public Website: http://localhost:${PORT}/`);
  console.log(`   - Blog Index:     http://localhost:${PORT}/blog/`);
  console.log(`   - Owner CMS:      http://localhost:${PORT}/admin/blog`);
});
