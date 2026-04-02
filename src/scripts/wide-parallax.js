(() => {
  const app = window.__app;
  if (!app || app.prefersReducedMotion) return;

  const clamp = app.clamp;
  const bg = document.querySelector("[data-wide-parallax]");
  if (!bg) return;

  let rafId = 0;
  const onScroll = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const viewportH = window.innerHeight || 1;
      const section = bg.parentElement;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < viewportH;
      if (!isVisible) return;

      const progress = (viewportH - rect.top) / (viewportH + rect.height);
      const t = clamp(progress, 0, 1);
      const offset = (t - 0.5) * 90;
      bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();

