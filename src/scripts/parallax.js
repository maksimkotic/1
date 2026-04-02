(() => {
  const app = window.__app;
  if (!app || app.prefersReducedMotion) return;

  const clamp = app.clamp;
  const frames = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!frames.length) return;

  let rafId = 0;
  const onScroll = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const viewportH = window.innerHeight || 1;

      for (const frame of frames) {
        const img = frame.querySelector(".media-frame__img");
        if (!img) continue;

        const rect = frame.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < viewportH;
        if (!isVisible) continue;

        const progress = (viewportH - rect.top) / (viewportH + rect.height);
        const t = clamp(progress, 0, 1);
        const offset = (t - 0.5) * 46;
        img.style.transform = `translate3d(0, ${offset}px, 0) scale(1.22)`;
      }
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();

