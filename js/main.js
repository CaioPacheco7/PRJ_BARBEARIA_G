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

  /* Listas que entram em cascata: cada item ganha um atraso pela posição na lista */
  [
    [".menu__group li", 0.07],
    [".slots li", 0.045],
    [".contacts li", 0.09],
    [".stats > div", 0.1],
    [".ftr__grid > *", 0.1],
  ].forEach(([sel, step]) => {
    document.querySelectorAll(sel).forEach((el) => {
      const i = [...el.parentElement.children].indexOf(el);
      el.classList.add("reveal");
      el.style.setProperty("--d", `${Math.min(i * step, 0.6).toFixed(2)}s`);
    });
  });

  /* Revelar ao rolar (inclui os títulos de seção, que desenham a linha) */
  const reveals = document.querySelectorAll(".reveal, .sec-head");
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
    /* o h2 nasce recortado (cortina), e o navegador o trata como invisível: observa-se o bloco que o contém */
    const holders = new Map();
    reveals.forEach((el) => {
      if (el.matches(".h2")) holders.set(el.parentElement, el);
      else io.observe(el);
    });
    const hio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            holders.get(entry.target).classList.add("is-in");
            hio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    holders.forEach((_, parent) => hio.observe(parent));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Depoimentos: cada fileira vira um grupo repetido até cobrir a tela, mais uma cópia
     para o loop ficar contínuo (a animação anda metade da largura total) */
  document.querySelectorAll(".tm__row").forEach((row) => {
    const cards = [...row.children];
    const group = document.createElement("div");
    group.className = "tm__group";
    cards.forEach((c) => group.appendChild(c));
    row.appendChild(group);
    let guard = 0;
    while (group.scrollWidth < window.innerWidth * 1.15 && guard++ < 6) {
      cards.forEach((c) => {
        const copy = c.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        group.appendChild(copy);
      });
    }
    const twin = group.cloneNode(true);
    twin.setAttribute("aria-hidden", "true");
    row.appendChild(twin);
  });

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

  /* Contagem dos números (ano de fundação e anos de ofício) */
  const countUp = (el, from, to, delay) => {
    const dur = 1400;
    const start = performance.now() + delay;
    const tick = (t) => {
      const p = Math.min(Math.max((t - start) / dur, 0), 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduced && "IntersectionObserver" in window) {
    const nio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        nio.unobserve(el);
        countUp(el, Number(el.dataset.from || 0), Number(el.dataset.target), el.closest(".rail") && performance.now() < 2500 ? 900 : 150);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count], [data-years]").forEach((el) => {
      el.dataset.target = el.textContent.trim();
      el.textContent = el.dataset.from || 0;
      nio.observe(el);
    });
  }

  /* Link ativo do menu conforme a seção na tela */
  const links = new Map([...document.querySelectorAll(".nav a")].map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const a = links.get(entry.target.id);
        if (a && entry.isIntersecting) {
          links.forEach((l) => l.classList.toggle("is-active", l === a));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) sio.observe(s);
    });
  }

  /* Rolagem: barra de progresso e movimentos leves (só com o movimento liberado) */
  const progress = document.querySelector(".progress");
  const hero = document.querySelector(".hero");
  const mate = document.querySelector(".photo--b");
  const bigWord = document.querySelector(".ftr__big");
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (y < vh * 0.4) links.forEach((l) => l.classList.remove("is-active"));
    if (reduced) return;
    /* o hero só "viaja" na rolagem quando cabe inteiro na tela (desktop); no celular ele é maior que a tela */
    if (y < vh * 1.3 && window.matchMedia("(min-width: 901px) and (min-height: 561px)").matches) {
      hero.style.setProperty("--hy", (y * 0.12).toFixed(1));
      hero.style.setProperty("--ho", Math.max(0, 1 - y / (vh * 0.85)).toFixed(3));
    }
    if (mate) {
      const r = mate.getBoundingClientRect();
      if (r.bottom > -100 && r.top < vh + 100) {
        mate.style.setProperty("--py", (-((r.top + r.height / 2 - vh / 2) / vh) * 56).toFixed(1));
      }
    }
    if (bigWord) {
      const r = bigWord.getBoundingClientRect();
      if (r.top < vh * 1.2) bigWord.style.setProperty("--fx", ((r.top - vh) * 0.05).toFixed(1));
    }
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };
  frame();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);

  /* Hero: o selo acompanha o mouse de leve (só com mouse) */
  if (!reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const seal = hero.querySelector(".seal");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      seal.style.setProperty("--sx", ((x / r.width - 0.5) * -22).toFixed(1));
      seal.style.setProperty("--sy", ((y / r.height - 0.5) * -22).toFixed(1));
    });
    hero.addEventListener("mouseleave", () => {
      seal.style.setProperty("--sx", 0);
      seal.style.setProperty("--sy", 0);
    });
  }
})();
