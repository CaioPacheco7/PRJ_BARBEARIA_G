/* Login do painel: uma senha só, guardada na variável ADMIN_PASSWORD (nunca no código).
   Depois do login o navegador recebe um cookie assinado, que expira sozinho. */
const crypto = require("crypto");

const COOKIE = "guina_admin";
const SESSAO_MS = 12 * 60 * 60 * 1000; // 12 horas

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

function configured() {
  return typeof process.env.ADMIN_PASSWORD === "string" && process.env.ADMIN_PASSWORD.length > 0;
}

/* A chave que assina o cookie nasce da senha: trocar a senha encerra todas as sessões. */
function secret() {
  return crypto.createHmac("sha256", "guina-sessao-v1").update(process.env.ADMIN_PASSWORD).digest();
}

function passwordOk(candidate) {
  if (!configured() || typeof candidate !== "string") return false;
  return crypto.timingSafeEqual(sha(candidate), sha(process.env.ADMIN_PASSWORD));
}

const sign = (exp) => crypto.createHmac("sha256", secret()).update(String(exp)).digest("base64url");

function makeToken() {
  const exp = Date.now() + SESSAO_MS;
  return `${exp}.${sign(exp)}`;
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isAuthed(req) {
  if (!configured()) return false;
  const token = parseCookies(req)[COOKIE];
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return good.length === got.length && crypto.timingSafeEqual(good, got);
}

function isHttps(req) {
  return req.headers["x-forwarded-proto"] === "https" || !!(req.socket && req.socket.encrypted);
}

function sessionCookie(req, token, maxAgeSeconds) {
  return [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`,
    isHttps(req) ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

module.exports = { configured, passwordOk, makeToken, isAuthed, sessionCookie, SESSAO_MS };
