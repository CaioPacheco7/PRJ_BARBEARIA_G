/* Pequenas ajudas para as funções: resposta JSON, leitura do corpo e proteção contra pedidos de outros sites. */

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

async function readJson(req, limit = 8192) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    if (typeof req.body === "object") return req.body;
    return JSON.parse(String(req.body));
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) { const e = new Error("too_large"); e.status = 413; throw e; }
    chunks.push(c);
  }
  const s = Buffer.concat(chunks).toString("utf8");
  return s ? JSON.parse(s) : {};
}

/* Só aceita JSON vindo do próprio site (um formulário de outro endereço não consegue enviar isso). */
function guardWrite(req, res) {
  const ct = String(req.headers["content-type"] || "").toLowerCase();
  if (!ct.startsWith("application/json")) { send(res, 415, { error: "content_type" }); return false; }
  const origin = req.headers.origin;
  if (origin) {
    let host = "";
    try { host = new URL(origin).host; } catch (_) { /* origem ilegível */ }
    const mine = req.headers["x-forwarded-host"] || req.headers.host;
    if (host !== mine) { send(res, 403, { error: "origin" }); return false; }
  }
  return true;
}

function clientIp(req) {
  const xff = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xff || (req.socket && req.socket.remoteAddress) || "desconhecido";
}

module.exports = { send, readJson, guardWrite, clientIp };
