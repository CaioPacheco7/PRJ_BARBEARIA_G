/* Servidor de desenvolvimento: serve o site e as funções de /api, como a Vercel faz.
   Uso:  node scripts/dev-server.js        (abre em http://127.0.0.1:5173/)
   A senha do painel vem de ADMIN_PASSWORD (variável de ambiente ou arquivo .env.local, que não vai para o git). */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
process.chdir(ROOT);

// lê .env.local (linhas CHAVE=valor), sem sobrescrever o que já está no ambiente
try {
  for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (_) { /* sem .env.local: tudo bem */ }

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

// cabeçalhos do vercel.json (só o padrão "/algo(.*)", que é o que usamos)
let headerRules = [];
try {
  const vc = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  headerRules = (vc.headers || []).map((h) => ({
    re: new RegExp("^" + h.source.split("(.*)").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"),
    headers: h.headers,
  }));
} catch (_) { /* sem vercel.json */ }

const BLOQUEADO = /(^|\/)(\.|node_modules|scripts|api(\/|$))/i;

function applyHeaders(res, pathname) {
  for (const r of headerRules) if (r.re.test(pathname)) for (const h of r.headers) res.setHeader(h.key, h.value);
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) || BLOQUEADO.test(path.relative(ROOT, file).replace(/\\/g, "/"))) {
    res.statusCode = 404; return res.end("Não encontrado");
  }
  let target = file;
  try { if (fs.statSync(target).isDirectory()) { res.statusCode = 301; res.setHeader("Location", pathname + "/"); return res.end(); } } catch (_) { /* segue */ }
  fs.readFile(target, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Não encontrado"); }
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[path.extname(target).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    applyHeaders(res, pathname);
    res.end(data);
  });
}

async function serveApi(req, res, name) {
  const file = path.join(ROOT, "api", name + ".js");
  if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) { res.statusCode = 404; res.setHeader("Content-Type", "application/json"); return res.end('{"error":"not_found"}'); }
  for (const k of Object.keys(require.cache)) if (k.startsWith(path.join(ROOT, "api"))) delete require.cache[k]; // recarrega a cada pedido
  applyHeaders(res, "/api/" + name);
  try { await require(file)(req, res); } catch (e) { console.error(e); if (!res.headersSent) { res.statusCode = 500; res.end('{"error":"server"}'); } }
}

http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://x").pathname;
  const m = pathname.match(/^\/api\/([^/]+)\/?$/);
  if (m) return serveApi(req, res, m[1]);
  if (req.method !== "GET" && req.method !== "HEAD") { res.statusCode = 405; return res.end(); }
  serveStatic(req, res, pathname);
}).listen(PORT, HOST, () => {
  const senha = process.env.ADMIN_PASSWORD ? "definida" : "NÃO definida (o login ficará desativado)";
  console.log(`Site: http://${HOST}:${PORT}/   Painel: http://${HOST}:${PORT}/admin/   Senha do painel: ${senha}`);
});
