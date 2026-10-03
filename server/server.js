const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);
const apiOrigin = new URL(process.env.SECO_API_ORIGIN || 'https://seco-backend-api.onrender.com');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split('?')[0]);

  if (requested === '/api/v1' || requested.startsWith('/api/v1/')) {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const headers = { ...req.headers, host: apiOrigin.host };
    delete headers.origin;
    delete headers.referer;
    const upstream = https.request({
      hostname: apiOrigin.hostname,
      port: apiOrigin.port || 443,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      method: req.method,
      headers
    }, (upstreamResponse) => {
      res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(res);
    });
    upstream.on('error', () => {
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ detail: 'Backend API proxy unavailable' }));
    });
    req.pipe(upstream);
    return;
  }

  const relative = requested === '/' ? 'public/index.html' : requested.replace(/^\/+/, '');
  const candidates = requested === '/'
    ? [path.join(root, 'public/index.html')]
    : [path.join(root, relative), path.join(root, 'public', relative)];
  const filePath = candidates.find((candidate) => {
    const resolved = path.resolve(candidate);
    return resolved.startsWith(root) && fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory();
  });
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SECO Mobile running at http://localhost:${port}`);
});
