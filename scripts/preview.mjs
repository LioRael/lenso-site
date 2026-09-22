import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'out');
const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'], ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'], ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
]);

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Malformed URL');
    return;
  }
  const relative = normalize(pathname).replace(/^[/\\]+/, '');
  let file = join(root, relative);
  if (!file.startsWith(`${root}/`) && file !== root) {
    response.writeHead(400).end('Invalid path');
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && !extname(file)) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentTypes.get(extname(file)) ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`Previewing out at http://${host}:${port}`));
