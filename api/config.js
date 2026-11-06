/* GET  /api/config -> preços e horários atuais (público: o site usa isto para se atualizar)
   PUT  /api/config -> salva alterações (só com o painel logado) */
const store = require("./_lib/store");
const auth = require("./_lib/auth");
const { build, validate } = require("./_lib/config");
const { send, readJson, guardWrite } = require("./_lib/http");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const cfg = build(await store.load());
      return send(res, 200, cfg, { "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=30" });
    }

    if (req.method === "PUT") {
      if (!guardWrite(req, res)) return;
      if (!auth.isAuthed(req)) return send(res, 401, { error: "unauthorized", message: "Sessão expirada. Entre de novo." });

      let body;
      try { body = await readJson(req); } catch (e) { return send(res, e.status || 400, { error: "bad_json", message: "Não consegui ler os dados enviados." }); }

      const v = validate(body, await store.load());
      if (!v.ok) return send(res, 422, { error: "invalid", message: v.message });

      try { await store.save(v.value); } catch (e) {
        if (e.code === "NO_STORE") return send(res, 503, { error: "no_store", message: "O armazenamento ainda não foi configurado, então não dá para salvar." });
        throw e;
      }
      return send(res, 200, build(v.value));
    }

    return send(res, 405, { error: "method" }, { Allow: "GET, PUT" });
  } catch (e) {
    console.error("[api/config]", e && e.message);
    return send(res, 500, { error: "server", message: "Algo deu errado. Tente de novo." });
  }
};
