
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  // Serve TS/TSX files as JavaScript, mimicking dev environment behavior.
  // In a true build, these would be compiled to .js files.
  '.ts': 'text/javascript',
  '.tsx': 'text/javascript',
};

const server = http.createServer((req, res) => {
  // Prevent directory traversal attacks
  const unsafeFilePath = req.url === '/' ? 'index.html' : req.url;
  const safeFilePath = path.normalize(unsafeFilePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safeFilePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If the file doesn't exist, it's likely a client-side route.
      // Fallback to serving the main index.html for the SPA to handle.
      serveFile(path.join(__dirname, 'index.html'), res);
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        return sendError(res, 500, 'Server Error');
      }
      // If a directory is requested, fall back to index.html
      if (stats.isDirectory()) {
        serveFile(path.join(__dirname, 'index.html'), res);
      } else {
        serveFile(filePath, res);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Production server running at http://localhost:${PORT}/`);
  console.log('To run this server, use `npm start` or `node server.js`.');
});

function serveFile(filePath, res) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If reading the fallback index.html fails, send a 500 error.
      if (filePath.endsWith('index.html')) {
        return sendError(res, 500, 'Server Error: Critical file missing.');
      }
      // Otherwise, it was a legitimate file not found error.
      return sendError(res, 404, 'File Not Found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

function sendError(res, code, message) {
  res.writeHead(code, { 'Content-Type': 'text/plain' });
  res.end(message);
}
