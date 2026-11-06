/* GET /api/session -> o painel pergunta se já está logado e se o servidor está pronto (senha e armazenamento). */
const store = require("./_lib/store");
const auth = require("./_lib/auth");
const { send } = require("./_lib/http");

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "method" }, { Allow: "GET" });
  return send(res, 200, { authed: auth.isAuthed(req), configured: auth.configured(), storage: store.mode() });
};
