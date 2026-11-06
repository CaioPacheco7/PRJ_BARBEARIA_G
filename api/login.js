/* POST /api/login { password } -> cookie de sessão. Trava o IP depois de várias tentativas erradas. */
const store = require("./_lib/store");
const auth = require("./_lib/auth");
const { send, readJson, guardWrite, clientIp } = require("./_lib/http");

const MAX_TENTATIVAS = 8;
const JANELA_SEG = 15 * 60;

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return send(res, 405, { error: "method" }, { Allow: "POST" });
    if (!guardWrite(req, res)) return;
    if (!auth.configured()) return send(res, 503, { error: "not_configured", message: "O painel ainda não tem senha configurada." });

    const key = `guina:login:${clientIp(req)}`;
    if ((await store.attempts(key)) >= MAX_TENTATIVAS) {
      return send(res, 429, { error: "locked", message: "Muitas tentativas. Aguarde uns 15 minutos e tente de novo." }, { "Retry-After": String(JANELA_SEG) });
    }

    let body;
    try { body = await readJson(req, 2048); } catch (e) { return send(res, e.status || 400, { error: "bad_json" }); }

    if (!auth.passwordOk(body && body.password)) {
      await store.hit(key, JANELA_SEG);
      await new Promise((r) => setTimeout(r, 600)); // desacelera tentativas em sequência
      return send(res, 401, { error: "wrong_password", message: "Senha incorreta." });
    }

    await store.clear(key);
    return send(res, 200, { ok: true }, { "Set-Cookie": auth.sessionCookie(req, auth.makeToken(), Math.floor(auth.SESSAO_MS / 1000)) });
  } catch (e) {
    console.error("[api/login]", e && e.message);
    return send(res, 500, { error: "server", message: "Algo deu errado. Tente de novo." });
  }
};
