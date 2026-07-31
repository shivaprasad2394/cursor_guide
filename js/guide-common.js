/**
 * Shared guide chrome: TOC highlight + Quick/Deep track toggle.
 */
(function () {
  const KEY = "lset-guide-track";

  function initToc() {
    const tocLinks = document.querySelectorAll(".guide-sidebar a[href^='#']");
    const sections = [...document.querySelectorAll(".guide-section[id], .guide-chapter[id]")];
    if (!tocLinks.length || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          tocLinks.forEach((a) => {
            const href = a.getAttribute("href");
            a.classList.toggle("guide-toc-active", href === `#${id}`);
          });
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  function applyTrack(track) {
    document.body.dataset.guideTrack = track;
    document.querySelectorAll("[data-track-set]").forEach((btn) => {
      btn.classList.toggle("guide-track-active", btn.dataset.trackSet === track);
    });
    try {
      localStorage.setItem(KEY, track);
    } catch (_) {
      /* ignore */
    }
  }

  function initTracks() {
    const buttons = document.querySelectorAll("[data-track-set]");
    if (!buttons.length) return;

    let track = "quick";
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "quick" || saved === "deep") track = saved;
    } catch (_) {
      /* ignore */
    }
    applyTrack(track);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => applyTrack(btn.dataset.trackSet));
    });
  }

  initToc();
  initTracks();
})();
