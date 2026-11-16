'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------
  // スクロールで出現（グループ内は少しずつ遅らせて連続的に）
  // ---------------------------------------------
  const groups = [
    { sel: '.p-problem__voice', variant: 'left' },
    { sel: '.p-problem__item' },
    { sel: '.p-problem__concept', variant: 'pop' },
    { sel: '.p-about__catch, .p-about__text', variant: 'right' },
    { sel: '.p-recommend__item', variant: 'pop' },
    { sel: '.p-reason__card' },
    { sel: '.p-cta-band__text', variant: 'left' },
    { sel: '.p-cta-band .c-btn', variant: 'right' },
    { sel: '.p-voice__card' },
    { sel: '.p-price__card', variant: 'pop' },
    { sel: '.p-flow__item' },
    { sel: '.p-faq__item' },
    { sel: '.p-cta__en', variant: 'pop' },
    { sel: '.p-cta__title, .p-cta__btns' },
  ];
  const revealTargets = [];
  groups.forEach(({ sel, variant }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('js-reveal');
      if (variant) el.classList.add(`js-reveal--${variant}`);
      el.style.setProperty('--delay', `${(i % 6) * 0.12}s`);
      revealTargets.push(el);
    });
  });
  document.querySelectorAll('.c-heading').forEach((el) => {
    el.classList.add('js-heading');
    revealTargets.push(el);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-in');
      revealObserver.unobserve(el);
      // 出現し終えたらクラスを外し、ホバー時の動きに切り替える
      if (el.classList.contains('js-reveal')) {
        const delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
        setTimeout(() => {
          el.classList.remove('js-reveal', 'js-reveal--left', 'js-reveal--right', 'js-reveal--pop', 'is-in');
        }, (delay + 1.2) * 1000);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  revealTargets.forEach((el) => revealObserver.observe(el));

  // ---------------------------------------------
  // 数字のカウントアップ（−6.8kg / 94.2%）
  // ---------------------------------------------
  const countUp = (el, delay) => {
    const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!node) return;
    const raw = node.textContent.trim();
    const sign = /^[−-]/.test(raw) ? raw[0] : '';
    const target = parseFloat(raw.replace(/^[−-]/, ''));
    const decimals = (raw.split('.')[1] || '').length;
    if (reduceMotion || Number.isNaN(target)) return;
    node.textContent = sign + (0).toFixed(decimals);
    setTimeout(() => {
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
        node.textContent = sign + (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };
  document.querySelectorAll('.p-mv__badge-num').forEach((el, i) => countUp(el, 1200 + i * 150));

  // ---------------------------------------------
  // SP固定CTA：MVを過ぎたら表示、最終CTA・フッターが見えている間は隠す
  // ---------------------------------------------
  const fixedCta = document.querySelector('.p-fixed-cta');
  const mv = document.querySelector('.p-mv');
  const hideAreas = document.querySelectorAll('.p-cta, .l-footer');
  if (fixedCta && mv) {
    let pastMv = false;
    const visibleHideAreas = new Set();
    const update = () => fixedCta.classList.toggle('is-show', pastMv && visibleHideAreas.size === 0);
    new IntersectionObserver(([e]) => { pastMv = !e.isIntersecting; update(); }).observe(mv);
    const hideObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visibleHideAreas.add(e.target) : visibleHideAreas.delete(e.target)));
      update();
    });
    hideAreas.forEach((el) => hideObserver.observe(el));
  }
});
