/* Confere se os valores de partida do painel (api/_lib/defaults.js) batem com o index.html.
   Se não baterem, o site e o painel mostrariam preços/horários diferentes antes da primeira edição.
   Uso:  node scripts/check-defaults.js */
const fs = require("fs");
const path = require("path");
const { SERVICES, HOURS } = require("../api/_lib/defaults");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const erros = [];

const doHtml = {};
for (const m of html.matchAll(/data-service="([^"]+)"><span class="row__n">(\d+)<\/span>.*?<small>R\$<\/small>([\d,]+)/g)) {
  doHtml[m[2]] = { nome: m[1], preco: Number(m[3].replace(",", ".")) };
}

for (const s of SERVICES) {
  const h = doHtml[s.id];
  if (!h) { erros.push(`Serviço ${s.id} (${s.name}) existe no painel mas não está no index.html`); continue; }
  if (h.preco !== s.price) erros.push(`Serviço ${s.id}: painel ${s.price}, index.html ${h.preco}`);
  if (h.nome.toLowerCase() !== s.name.toLowerCase()) erros.push(`Serviço ${s.id}: nome "${s.name}" no painel, "${h.nome}" no index.html`);
}
for (const id of Object.keys(doHtml)) if (!SERVICES.some((s) => s.id === id)) erros.push(`Serviço ${id} (${doHtml[id].nome}) está no index.html mas falta no painel`);

const listas = [...html.matchAll(/<ul class="slots"[^>]*>(.*?)<\/ul>/gs)].map((m) => [...m[1].matchAll(/<li>(\d\d:\d\d)<\/li>/g)].map((x) => x[1]));
if (JSON.stringify(listas[0]) !== JSON.stringify(HOURS.weekdays)) erros.push(`Horários dos demais dias diferem: index.html [${listas[0]}] x painel [${HOURS.weekdays}]`);
if (JSON.stringify(listas[1]) !== JSON.stringify(HOURS.friday)) erros.push(`Horários de sexta diferem: index.html [${listas[1]}] x painel [${HOURS.friday}]`);

if (erros.length) { console.error("DIFERENÇAS ENCONTRADAS:\n- " + erros.join("\n- ")); process.exit(1); }
console.log(`ok: ${SERVICES.length} serviços e os dois grupos de horários batem com o index.html.`);
