(() => {
  "use strict";

  const WHATSAPP = "5577991620519";
  const FOUNDED = 2010;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Links do WhatsApp: a mensagem já vai pronta, com o serviço escolhido */
  document.querySelectorAll("[data-wa]").forEach((a) => {
    const service = a.dataset.service;
    const text = service
      ? `Olá, Guina! Quero agendar: ${service}.`
      : "Olá, Guina! Vim pelo site e quero agendar um horário.";
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Números que dependem do ano */
  const now = new Date().getFullYear();
  document.querySelectorAll("[data-years]").forEach((el) => (el.textContent = now - FOUNDED));
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = now));

  /* Cabeçalho e botão fixo do celular */
  const header = document.querySelector(".hdr");
  const dock = document.querySelector(".dock");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    dock.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu do celular */
  const toggle = document.querySelector(".nav-toggle");
  const setMenu = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  document.querySelectorAll("#menu-mobile a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* Revelar ao rolar */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Conversa de exemplo: as mensagens aparecem em sequência */
  const chat = document.getElementById("chat");
  if (chat) {
    const msgs = [...chat.querySelectorAll(".msg")];
    const delays = [400, 1300, 2900, 3700];
    const play = () => {
      chat.classList.add("is-live");
      msgs.forEach((m, i) => setTimeout(() => m.classList.add("is-on"), reduced ? 0 : delays[i] ?? 0));
    };
    if ("IntersectionObserver" in window) {
      const co = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          play();
          co.disconnect();
        }
      }, { threshold: 0.35 });
      co.observe(chat);
    } else {
      play();
    }
  }
})();
