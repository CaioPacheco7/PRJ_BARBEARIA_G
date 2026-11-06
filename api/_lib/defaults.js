/* Valores de partida do site (os mesmos que estão no index.html).
   O painel guarda só o que o Guina muda; o que ele não mudou continua vindo daqui. */

const SERVICES = [
  { id: "05", name: "Corte social", group: "Cabelo", price: 30 },
  { id: "07", name: "Corte social (tesoura)", group: "Cabelo", price: 40 },
  { id: "06", name: "Corte social (criança)", group: "Cabelo", price: 25 },
  { id: "18", name: "Pezinho", group: "Cabelo", price: 10 },
  { id: "10", name: "Degradê", group: "Degradê", price: 35 },
  { id: "14", name: "Degradê navalhado", group: "Degradê", price: 40 },
  { id: "03", name: "Barba", group: "Barba e bigode", price: 25 },
  { id: "04", name: "Bigode", group: "Barba e bigode", price: 10 },
  { id: "08", name: "Corte social + barba", group: "Combos", price: 50 },
  { id: "09", name: "Corte social + pigmentação", group: "Combos", price: 55 },
  { id: "11", name: "Degradê + barba", group: "Combos", price: 55 },
  { id: "13", name: "Degradê + sobrancelha", group: "Combos", price: 45 },
  { id: "12", name: "Degradê + barba + sobrancelha", group: "Combos", price: 60 },
  { id: "15", name: "Degradê navalhado + barba", group: "Combos", price: 60 },
  { id: "17", name: "Degradê navalhado + sobrancelha", group: "Combos", price: 50 },
  { id: "16", name: "Degradê navalhado + barba + sobrancelha", group: "Combos", price: 65 },
];

const HOURS = {
  weekdays: ["09:00", "10:00", "10:30", "11:00", "14:30", "15:30", "16:00", "16:30"],
  friday: ["08:00", "08:30", "10:00", "10:30", "11:10", "14:00", "14:30", "15:00", "15:45", "16:15", "16:45", "17:15", "18:30", "19:00", "19:30"],
};

module.exports = { SERVICES, HOURS };
