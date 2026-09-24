import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'out');
const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);
const redirects = new Map();
for (const line of readFileSync(join(root, '_redirects'), 'utf8').split(/\r?\n/u)) {
  const entry = line.trim();
  if (!entry || entry.startsWith('#')) continue;
  const [from, to, status, ...extra] = entry.split(/\s+/u);
  if (!from.startsWith('/') || !to.startsWith('/') || status !== '301' || extra.length || redirects.has(from)) {
    throw new Error(`Preview only supports unique, exact 301 redirects: ${entry}`);
  }
  redirects.set(from, to);
}
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'], ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'], ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
]);

createServer((request, response) => {
  let pathname;
  let search;
  try {
    const url = new URL(request.url ?? '/', `http://${host}`);
    pathname = decodeURIComponent(url.pathname);
    search = url.search;
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Malformed URL');
    return;
  }
  const destination = redirects.get(pathname);
  if (destination) {
    response.writeHead(301, { Location: `${destination}${search}` }).end();
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
