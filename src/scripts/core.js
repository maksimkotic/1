(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const todayEl = document.querySelector("[data-today]");
  if (todayEl) {
    const d = new Date();
    todayEl.textContent = d.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  window.__app = window.__app || {};

  window.__app.prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;

  window.__app.clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  if (nav && toggle && backdrop) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      backdrop.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    backdrop.addEventListener("click", () => setOpen(false));

    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 821px)").matches) setOpen(false);
    });
  }
})();

