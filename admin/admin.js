/* Painel do Guina: entrar, alterar preços e horários, salvar. Sem bibliotecas. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const views = { load: $("#v-load"), login: $("#v-login"), panel: $("#v-panel") };
  const show = (name) => { for (const [k, el] of Object.entries(views)) el.hidden = k !== name; };

  const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
  const KEYS = ["weekdays", "friday"];

  let services = [];          // [{id, name, group, price}]
  let server = null;          // o que está salvo: { prices, hours }
  const draft = { prices: {}, hours: { weekdays: [], friday: [] } };
  const invalid = new Set();  // ids de preços com texto inválido
  const added = new Set();    // "chave|hh:mm" novos, para destacar

  /* ---------- rede ---------- */
  async function api(path, opts = {}) {
    const init = { credentials: "same-origin", cache: "no-store", ...opts };
    if (opts.body !== undefined) { init.headers = { "Content-Type": "application/json" }; init.body = JSON.stringify(opts.body); }
    try {
      const r = await fetch(path, init);
      let data = null;
      try { data = await r.json(); } catch (_) { /* sem corpo */ }
      return { ok: r.ok, status: r.status, data };
    } catch (_) {
      return { ok: false, status: 0, data: null };
    }
  }

  /* ---------- formatação ---------- */
  const fmtPrice = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));
  function parsePrice(text) {
    const s = String(text).trim().replace(/^R\$\s*/i, "").replace(",", ".");
    if (!/^\d{1,4}(\.\d{1,2})?$/.test(s)) return NaN;
    return Number(s);
  }
  const snapshot = () => JSON.stringify({ prices: draft.prices, hours: draft.hours });
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- estado salvo x rascunho ---------- */
  function loadDraft(cfg) {
    services = cfg.services;
    server = { prices: clone(cfg.prices), hours: clone(cfg.hours) };
    draft.prices = clone(cfg.prices);
    draft.hours = clone(cfg.hours);
    invalid.clear();
    added.clear();
    const u = $("#atualizado");
    if (cfg.updatedAt) {
      const d = new Date(cfg.updatedAt);
      u.textContent = "Última alteração: " + d.toLocaleDateString("pt-BR", { timeZone: "America/Bahia" }) + " às " + d.toLocaleTimeString("pt-BR", { timeZone: "America/Bahia", hour: "2-digit", minute: "2-digit" }) + ".";
    } else {
      u.textContent = "";
    }
  }

  const dirty = () => snapshot() !== JSON.stringify(server);

  /* ---------- tela: preços ---------- */
  function renderPrices() {
    const box = $("#precos");
    box.textContent = "";
    const groups = [...new Set(services.map((s) => s.group))];
    for (const g of groups) {
      const card = document.createElement("div");
      card.className = "card";
      const h = document.createElement("h3");
      h.textContent = g;
      card.append(h);
      for (const s of services.filter((x) => x.group === g)) {
        const row = document.createElement("div");
        row.className = "p";
        row.dataset.id = s.id;
        const label = document.createElement("label");
        label.htmlFor = "preco-" + s.id;
        label.textContent = s.name;
        const wrap = document.createElement("div");
        wrap.className = "p__in";
        const rs = document.createElement("span");
        rs.textContent = "R$";
        const input = document.createElement("input");
        input.id = "preco-" + s.id;
        input.type = "text";
        input.inputMode = "decimal";
        input.autocomplete = "off";
        input.value = fmtPrice(draft.prices[s.id]);
        input.setAttribute("aria-label", "Preço de " + s.name + ", em reais");
        input.addEventListener("input", () => onPriceInput(s.id, input, row));
        input.addEventListener("blur", () => { if (!invalid.has(s.id)) input.value = fmtPrice(draft.prices[s.id]); });
        wrap.append(rs, input);
        row.append(label, wrap);
        card.append(row);
        markPrice(row, s.id);
      }
      box.append(card);
    }
  }

  function markPrice(row, id) {
    row.classList.toggle("p--mudou", draft.prices[id] !== server.prices[id] && !invalid.has(id));
    row.classList.toggle("p--erro", invalid.has(id));
  }

  function onPriceInput(id, input, row) {
    const v = parsePrice(input.value);
    if (Number.isNaN(v)) invalid.add(id);
    else { invalid.delete(id); draft.prices[id] = v; }
    markPrice(row, id);
    refreshBar();
  }

  /* ---------- tela: horários ---------- */
  function renderHours() {
    for (const key of KEYS) {
      const ul = $("#chips-" + key);
      ul.textContent = "";
      for (const h of draft.hours[key]) {
        const li = document.createElement("li");
        li.className = "chip" + (added.has(key + "|" + h) ? " chip--novo" : "");
        const span = document.createElement("span");
        span.textContent = h;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "×";
        btn.setAttribute("aria-label", "Remover " + h + (key === "friday" ? " das sextas" : " dos demais dias"));
        btn.addEventListener("click", () => {
          draft.hours[key] = draft.hours[key].filter((x) => x !== h);
          added.delete(key + "|" + h);
          renderHours();
          refreshBar();
          $("#add-" + key).focus();
        });
        li.append(span, btn);
        ul.append(li);
      }
    }
  }

  function showAddError(msg) {
    const p = $("#add-erro");
    p.hidden = !msg;
    p.textContent = msg || "";
  }

  for (const form of document.querySelectorAll(".add")) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const key = form.dataset.key;
      const input = $("#add-" + key);
      const v = input.value;
      if (!HHMM.test(v)) return showAddError("Escolha um horário válido (ex.: 14:30).");
      if (draft.hours[key].includes(v)) return showAddError("Esse horário já está na lista.");
      if (draft.hours[key].length >= 30) return showAddError("Máximo de 30 horários por lista.");
      showAddError("");
      draft.hours[key] = [...draft.hours[key], v].sort();
      if (!server.hours[key].includes(v)) added.add(key + "|" + v);
      input.value = "";
      renderHours();
      refreshBar();
      input.focus();
    });
  }

  /* ---------- barra de salvar ---------- */
  const statusEl = $("#status");
  const btnSalvar = $("#salvar");
  const btnDescartar = $("#descartar");

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "savebar__txt " + (kind ? "is-" + kind : "muted");
  }

  function refreshBar() {
    const d = dirty();
    const bad = invalid.size > 0;
    btnSalvar.disabled = !d || bad;
    btnDescartar.disabled = !d;
    if (bad) setStatus("Corrija os preços em vermelho (ex.: 35 ou 32,50).", "bad");
    else if (d) setStatus("Você tem alterações que ainda não foram salvas.", "dirty");
    else if (!statusEl.classList.contains("is-ok")) setStatus("Nenhuma alteração.");
  }

  btnDescartar.addEventListener("click", () => {
    draft.prices = clone(server.prices);
    draft.hours = clone(server.hours);
    invalid.clear();
    added.clear();
    showAddError("");
    renderPrices();
    renderHours();
    setStatus("Alterações descartadas.");
    refreshBar();
  });

  btnSalvar.addEventListener("click", async () => {
    if (btnSalvar.disabled) return;
    btnSalvar.disabled = true;
    btnDescartar.disabled = true;
    setStatus("Salvando…");
    const r = await api("/api/config", { method: "PUT", body: { prices: draft.prices, hours: draft.hours } });
    if (r.ok) {
      loadDraft(r.data);
      renderPrices();
      renderHours();
      setStatus("Salvo! O site já está com os novos valores.", "ok");
      refreshBar();
      return;
    }
    if (r.status === 401) { goLogin("Sua sessão expirou. Entre de novo para salvar."); return; }
    const msg = (r.data && r.data.message) || (r.status === 0 ? "Sem conexão. Verifique a internet e tente de novo." : "Não foi possível salvar. Tente de novo.");
    setStatus(msg, "bad");
    btnSalvar.disabled = false;
    btnDescartar.disabled = false;
  });

  window.addEventListener("beforeunload", (e) => {
    if (!views.panel.hidden && dirty()) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------- entrar / sair ---------- */
  const loginForm = $("#login-form");
  const loginErro = $("#login-erro");
  const senha = $("#senha");

  function goLogin(message) {
    show("login");
    loginErro.hidden = !message;
    loginErro.textContent = message || "";
    senha.value = "";
    senha.focus();
  }

  $("#ver-senha").addEventListener("click", (e) => {
    const on = senha.type === "password";
    senha.type = on ? "text" : "password";
    e.currentTarget.textContent = on ? "Ocultar" : "Mostrar";
    e.currentTarget.setAttribute("aria-pressed", String(on));
    e.currentTarget.setAttribute("aria-label", on ? "Ocultar senha" : "Mostrar senha");
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!senha.value) { loginErro.hidden = false; loginErro.textContent = "Digite a senha."; senha.focus(); return; }
    const btn = $("#login-btn");
    btn.disabled = true;
    btn.textContent = "Entrando…";
    const r = await api("/api/login", { method: "POST", body: { password: senha.value } });
    btn.disabled = false;
    btn.textContent = "Entrar";
    if (r.ok) { loginErro.hidden = true; await openPanel(); return; }
    loginErro.hidden = false;
    loginErro.textContent =
      (r.data && r.data.message) ||
      (r.status === 0 ? "Sem conexão. Verifique a internet e tente de novo." : "Não foi possível entrar. Tente de novo.");
    senha.select();
  });

  $("#sair").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST", body: {} });
    goLogin("");
  });

  /* ---------- abrir o painel ---------- */
  async function openPanel() {
    const [cfg, ses] = await Promise.all([api("/api/config"), api("/api/session")]);
    if (!cfg.ok) { goLogin("Não consegui carregar os dados. Tente de novo."); return; }
    loadDraft(cfg.data);
    renderPrices();
    renderHours();
    setStatus("Nenhuma alteração.");
    const aviso = $("#aviso-storage");
    const semArmazenamento = ses.ok && ses.data && ses.data.storage === "none";
    aviso.hidden = !semArmazenamento;
    if (semArmazenamento) aviso.textContent = "Atenção: o armazenamento do site ainda não foi configurado. Você pode ver e editar, mas o botão Salvar não vai funcionar até isso ser feito.";
    refreshBar();
    show("panel");
    $("#painel-titulo").focus();
  }

  async function init() {
    const ses = await api("/api/session");
    if (!ses.ok) { goLogin("Não consegui falar com o servidor. Tente de novo em instantes."); return; }
    if (!ses.data.configured) {
      goLogin("O painel ainda não tem senha configurada no servidor.");
      return;
    }
    if (ses.data.authed) await openPanel();
    else goLogin("");
  }

  init();
})();
