const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const port = process.env.PORT || 3000;
const apiBase = process.env.PRODUCT_API_BASE_URL || 'http://localhost:8080';
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/chat': ['chat.html', 'text/html; charset=utf-8'],
  '/chat.js': ['chat.js', 'text/javascript; charset=utf-8'],
  '/internet-buyflow': ['internet-buyflow.html', 'text/html; charset=utf-8'],
  '/internet-buyflow.js': ['internet-buyflow.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8']
};

http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/ai/chat' && req.method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 65536) {
          res.writeHead(413).end('Request too large');
          return;
        }
      }
      const response = await fetch(new URL('/ai/chat', apiBase), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        signal: AbortSignal.timeout(30000)
      });
      res.writeHead(response.status, { 'Content-Type': 'application/json; charset=utf-8' }).end(await response.text());
    } catch (error) {
      console.error('Chat request failed:', error.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify({ error: 'Chat service unavailable' }));
    }
    return;
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: pathname === '/ai/chat' ? 'POST' : 'GET' }).end();
    return;
  }
  if (pathname === '/ai/chat') return res.writeHead(405, { Allow: 'POST' }).end();
  if (pathname === '/dynamic/province/products') {
    try {
      const upstream = new URL(pathname, apiBase);
      upstream.search = new URL(req.url, 'http://localhost').search;
      const response = await fetch(upstream, { signal: AbortSignal.timeout(5000) });
      res.writeHead(response.status, { 'Content-Type': 'application/json; charset=utf-8' }).end(await response.text());
    } catch (error) {
      console.error('Could not load province products:', error.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify({ error: 'Could not load products' }));
    }
    return;
  }
  if (pathname === '/api/products') {
    try {
      const response = await fetch(new URL('/api/products', apiBase), { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`Product API returned ${response.status}`);
      const products = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(products));
    } catch (error) {
      console.error('Could not load products:', error.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify({ error: 'Could not load products' }));
    }
    return;
  }
  const asset = assets[pathname];
  if (!asset) return res.writeHead(404).end('Not found');
  try {
    const content = await fs.readFile(path.join(__dirname, 'public', asset[0]));
    res.writeHead(200, { 'Content-Type': asset[1] }).end(content);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Unable to load page');
  }
}).listen(port, () => console.log(`Storefront running at http://localhost:${port}`));
