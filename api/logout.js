/* POST /api/logout -> apaga o cookie de sessão. */
const auth = require("./_lib/auth");
const { send, guardWrite } = require("./_lib/http");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" }, { Allow: "POST" });
  if (!guardWrite(req, res)) return;
  return send(res, 200, { ok: true }, { "Set-Cookie": auth.sessionCookie(req, "", 0) });
};
