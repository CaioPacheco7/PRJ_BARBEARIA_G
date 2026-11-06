/* Junta o que o Guina alterou com os valores de partida, e valida o que chega do painel. */
const { SERVICES, HOURS } = require("./defaults");

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_HORARIOS = 30;
const PRECO_MAX = 9999;

const priceOk = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= PRECO_MAX;
const round2 = (v) => Math.round(v * 100) / 100;

function build(stored) {
  const sp = (stored && stored.prices) || {};
  const sh = (stored && stored.hours) || {};
  const services = SERVICES.map((s) => ({ ...s, price: priceOk(sp[s.id]) ? sp[s.id] : s.price }));
  const hours = {
    weekdays: Array.isArray(sh.weekdays) && sh.weekdays.length ? sh.weekdays : HOURS.weekdays,
    friday: Array.isArray(sh.friday) && sh.friday.length ? sh.friday : HOURS.friday,
  };
  return {
    services,
    prices: Object.fromEntries(services.map((s) => [s.id, s.price])),
    hours,
    updatedAt: (stored && stored.updatedAt) || null,
  };
}

function cleanHours(list, label) {
  if (!Array.isArray(list)) return { error: `Horários de "${label}" inválidos.` };
  if (list.length === 0) return { error: `Deixe pelo menos um horário em "${label}".` };
  if (list.length > MAX_HORARIOS) return { error: `Máximo de ${MAX_HORARIOS} horários em "${label}".` };
  for (const h of list) if (typeof h !== "string" || !HHMM.test(h)) return { error: `Horário inválido em "${label}": ${String(h).slice(0, 12)}` };
  return { value: [...new Set(list)].sort() };
}

/* body = { prices?: {id: número}, hours?: { weekdays?: [...], friday?: [...] } }
   Devolve { ok, value } com o objeto a gravar, ou { ok:false, message }. */
function validate(body, current) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, message: "Dados inválidos." };
  const ids = new Set(SERVICES.map((s) => s.id));
  const prices = { ...((current && current.prices) || {}) };
  const hours = {
    weekdays: (current && current.hours && current.hours.weekdays) || HOURS.weekdays,
    friday: (current && current.hours && current.hours.friday) || HOURS.friday,
  };

  if (body.prices !== undefined) {
    if (!body.prices || typeof body.prices !== "object" || Array.isArray(body.prices)) return { ok: false, message: "Preços inválidos." };
    for (const [id, v] of Object.entries(body.prices)) {
      if (!ids.has(id)) return { ok: false, message: `Serviço desconhecido: ${id.slice(0, 8)}` };
      if (!priceOk(v)) return { ok: false, message: `Preço inválido (use de 0 a ${PRECO_MAX}).` };
      prices[id] = round2(v);
    }
  }
  if (body.hours !== undefined) {
    if (!body.hours || typeof body.hours !== "object" || Array.isArray(body.hours)) return { ok: false, message: "Horários inválidos." };
    for (const [key, label] of [["weekdays", "demais dias"], ["friday", "sextas"]]) {
      if (body.hours[key] === undefined) continue;
      const r = cleanHours(body.hours[key], label);
      if (r.error) return { ok: false, message: r.error };
      hours[key] = r.value;
    }
  }
  return { ok: true, value: { prices, hours, updatedAt: new Date().toISOString() } };
}

module.exports = { build, validate };
