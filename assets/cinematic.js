(() => {
  const hero = document.querySelector('.hero');
  const video = hero.querySelector('video');
  const button = hero.querySelector('.motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  let visible = true;

  function updateMotion() {
    const active = enabled && visible && !document.hidden;
    hero.classList.toggle('paused', !active);
    button.textContent = enabled ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', enabled ? 'Pause animation' : 'Play animation');
    if (active) video.play().catch(() => {});
    else video.pause();
  }

  // Some media engines report ended instead of seeking at the loop boundary.
  video.addEventListener('ended', () => {
    if (enabled && visible && !document.hidden) {
      video.currentTime = 0;
      updateMotion();
    }
  });
  window.addEventListener('pageshow', updateMotion);

  button.hidden = false;
  button.addEventListener('click', () => { enabled = !enabled; updateMotion(); });
  reduced.addEventListener('change', () => { enabled = !reduced.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  }).observe(hero);
  updateMotion();

  // The lookup supports JSONP, including on local file previews.
  const cards = new Map();
  for (const card of document.querySelectorAll('#work article')) {
    const id = card.querySelector('a').pathname.match(/\/id(\d+)/)?.[1];
    if (id) cards.set(id, card);
  }
  const lookup = document.createElement('script');
  window.portfolioArtwork = ({ results }) => {
    for (const app of results) {
      const card = cards.get(String(app.trackId));
      const artwork = app.artworkUrl512 || app.artworkUrl100;
      if (card && artwork && /^https:\/\/[\w.-]+\.mzstatic\.com\//.test(artwork)) {
        card.style.setProperty('--artwork', 'url(' + JSON.stringify(artwork) + ')');
      }
    }
  };
  lookup.src = 'https://itunes.apple.com/lookup?country=us&id=' +
    [...cards.keys()].join(',') + '&callback=portfolioArtwork';
  document.head.append(lookup);
})();
