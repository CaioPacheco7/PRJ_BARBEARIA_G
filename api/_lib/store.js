/* Onde os dados do painel ficam guardados.
   - Na Vercel: Redis da Upstash (variáveis KV_REST_API_URL/TOKEN ou UPSTASH_REDIS_REST_URL/TOKEN).
   - No computador (desenvolvimento): um arquivo em .data/config.json.
   - Na Vercel sem Redis configurado: não grava (o painel avisa), porque o disco de lá é descartável. */
const fs = require("fs");
const path = require("path");

const KEY = "guina:config";

function kv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function filePath() {
  if (process.env.VERCEL) return null;
  return process.env.STORE_FILE || path.join(process.cwd(), ".data", "config.json");
}

function mode() {
  if (kv()) return "kv";
  if (filePath()) return "file";
  return "none";
}

async function redis(command) {
  const c = kv();
  const r = await fetch(c.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`redis http ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(`redis: ${j.error}`);
  return j.result;
}

async function load() {
  const m = mode();
  if (m === "kv") {
    const raw = await redis(["GET", KEY]);
    return raw ? JSON.parse(raw) : null;
  }
  if (m === "file") {
    try { return JSON.parse(fs.readFileSync(filePath(), "utf8")); } catch (e) { if (e.code === "ENOENT") return null; throw e; }
  }
  return null;
}

async function save(data) {
  const m = mode();
  if (m === "kv") { await redis(["SET", KEY, JSON.stringify(data)]); return; }
  if (m === "file") {
    const f = filePath();
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = f + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, f);
    return;
  }
  const err = new Error("storage_not_configured");
  err.code = "NO_STORE";
  throw err;
}

/* Contador de tentativas de login (por IP). Com Redis vale para todas as instâncias;
   sem Redis fica na memória do processo, o que já segura o uso local. */
const mem = (globalThis.__guinaTentativas = globalThis.__guinaTentativas || new Map()); // sobrevive a recargas do módulo

async function attempts(key) {
  if (kv()) return Number((await redis(["GET", key])) || 0);
  const e = mem.get(key);
  return e && e.until > Date.now() ? e.n : 0;
}

async function hit(key, ttlSeconds) {
  if (kv()) {
    const n = Number(await redis(["INCR", key]));
    if (n === 1) await redis(["EXPIRE", key, ttlSeconds]);
    return n;
  }
  const e = mem.get(key);
  const n = e && e.until > Date.now() ? e.n + 1 : 1;
  mem.set(key, { n, until: e && e.until > Date.now() ? e.until : Date.now() + ttlSeconds * 1000 });
  return n;
}

async function clear(key) {
  if (kv()) { await redis(["DEL", key]); return; }
  mem.delete(key);
}

module.exports = { load, save, mode, attempts, hit, clear };
