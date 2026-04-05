/* ═══════════════════════════════════════════
   IRON FORGE GYM v2 — JavaScript
   ═══════════════════════════════════════════ */

'use strict';

// ── HELPERS ──
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ═══════════════════════════════════════════
   1. PAGE LOADER
══════════════════════════════════════════ */
(function loader() {
  const el = $('#loader');
  const bar = $('#loaderBar');
  const pct = $('#loaderPct');
  let progress = 0;

  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      bar.style.width = '100%';
      pct.textContent = '100';
      setTimeout(() => {
        el.classList.add('done');
        document.body.classList.remove('is-loading');
        initHeroWords();
        initCounters();
      }, 300);
    } else {
      bar.style.width = progress + '%';
      pct.textContent = Math.floor(progress);
    }
  }, 80);
})();

/* ═══════════════════════════════════════════
   2. GRAIN TEXTURE
══════════════════════════════════════════ */
(function grain() {
  const canvas = $('#grainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let frame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    frame = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();
})();

/* ═══════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════ */
(function cursor() {
  const dot = $('#cDot');
  const ring = $('#cRing');
  const text = $('#cText');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function raf() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(raf);
  })();

  // Cursor labels
  $$('[data-label]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      text.textContent = el.dataset.label;
      text.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      text.style.opacity = '0';
    });
  });

  // Scale on interactive
  $$('a, button, .scard, .pcard, .review, .tf').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
      ring.style.width = '56px'; ring.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width = '36px'; ring.style.height = '36px';
    });
  });
})();

/* ═══════════════════════════════════════════
   4. NAVBAR
══════════════════════════════════════════ */
(function nav() {
  const nav    = $('#nav');
  const burger = $('#burger');
  const drawer = $('#drawer');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  });

  $$('.dl').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav highlight
  const sections = $$('section[id]');
  const navLinks = $$('.nav-item');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === '#' + e.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));
})();

/* ═══════════════════════════════════════════
   5. HERO
══════════════════════════════════════════ */
function initHeroWords() {
  // Animate hero words up
  $$('.h1-word').forEach(w => w.classList.add('visible'));

  // Parallax hero image
  const img = $('#heroImg');
  if (img) {
    img.classList.add('loaded');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.5) {
        img.style.transform = `scale(1) translateY(${y * 0.3}px)`;
      }
    }, { passive: true });
  }
}

/* ═══════════════════════════════════════════
   6. COUNTER ANIMATION
══════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.counter');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.to;
      const duration = 1800;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

/* ═══════════════════════════════════════════
   7. SCROLL REVEAL
══════════════════════════════════════════ */
(function scrollReveal() {
  const els = $$('[data-reveal]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const delay = parseFloat(el.dataset.delay || 0);
      el.style.transitionDelay = delay + 's';
      el.classList.add('revealed');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ═══════════════════════════════════════════
   8. SERVICES CAROUSEL
══════════════════════════════════════════ */
(function carousel() {
  const track  = $('#sCardsTrack');
  const prev   = $('#sPrev');
  const next   = $('#sNext');
  const fill   = $('#scardsFill');
  if (!track) return;

  const cards = $$('.scard');
  const total = cards.length;
  let cur = 0;

  function cardWidth() {
    if (!cards[0]) return 0;
    return cards[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap);
  }

  function go(index) {
    cur = clamp(index, 0, total - 1);
    track.style.transform = `translateX(-${cur * cardWidth()}px)`;
    fill.style.width = ((cur + 1) / total * 100) + '%';
    prev.disabled = cur === 0;
    next.disabled = cur === total - 1;
  }

  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  window.addEventListener('resize', () => go(cur), { passive: true });

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? go(cur + 1) : go(cur - 1);
  });

  go(0);
})();

/* ═══════════════════════════════════════════
   9. BMI CALCULATOR
══════════════════════════════════════════ */
(function bmi() {
  let unit = 'metric';

  // Tabs
  $$('.btab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.btab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      unit = btn.dataset.u;
      const track = $('#btabTrack');
      if (track) track.classList.toggle('right', unit === 'imperial');
      const htU = $('#htU'), wtU = $('#wtU');
      const htI = $('#bHt'), wtI = $('#bWt');
      if (unit === 'metric') {
        htU.textContent = 'cm'; wtU.textContent = 'kg';
        htI.placeholder = '175'; wtI.placeholder = '70';
      } else {
        htU.textContent = 'in'; wtU.textContent = 'lbs';
        htI.placeholder = '69'; wtI.placeholder = '154';
      }
      resetBmi();
    });
  });

  // Gender
  $$('.gpill').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.gpill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function resetBmi() {
    const num = $('#bmiNum'), cat = $('#bmiCatLabel'), adv = $('#bmiAdvice'), needle = $('#bmiNeedle');
    if (num) num.textContent = '—';
    if (cat) cat.textContent = 'Enter details above';
    if (adv) adv.textContent = '';
    if (needle) needle.style.left = '0%';
  }

  function category(b) {
    if (b < 18.5) return { label: 'Underweight', pos: b / 18.5 * 20, advice: '💪 Gain lean mass — our strength training & nutrition programs were built for you.' };
    if (b < 25)   return { label: 'Normal Weight', pos: 20 + (b - 18.5) / 6.5 * 30, advice: '✅ Great shape. Maintain & level up with our performance programs.' };
    if (b < 30)   return { label: 'Overweight', pos: 50 + (b - 25) / 5 * 25, advice: '🔥 Time to cut. Our HIIT + diet plans will get you there fast.' };
    return { label: 'Obese', pos: Math.min(75 + (b - 30) / 10 * 25, 96), advice: '🚨 Let s start immediately. Our supervised beginner program is designed for you.' };
  }

  $('#bmiBtn')?.addEventListener('click', () => {
    const ht = parseFloat($('#bHt').value);
    const wt = parseFloat($('#bWt').value);
    if (!ht || !wt || ht <= 0 || wt <= 0) {
      shake($('.bmi-card'));
      return;
    }

    let bmi;
    if (unit === 'metric') {
      bmi = wt / ((ht / 100) ** 2);
    } else {
      bmi = (703 * wt) / (ht ** 2);
    }
    bmi = Math.round(bmi * 10) / 10;
    const cat = category(bmi);

    // Animate number
    const numEl = $('#bmiNum');
    const start = performance.now();
    const dur = 800;
    const from = 0;
    ;(function step(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const e = 1 - (1 - t) ** 3;
      numEl.textContent = (from + (bmi - from) * e).toFixed(1);
      if (t < 1) requestAnimationFrame(step);
    })(start);

    $('#bmiCatLabel').textContent = cat.label;
    $('#bmiNeedle').style.left = cat.pos + '%';
    const adv = $('#bmiAdvice');
    adv.textContent = cat.advice;
    adv.style.display = cat.advice ? 'block' : 'none';

    const result = $('#bmiResult');
    result.style.display = 'block';
  });

  // Enter key
  ['#bHt', '#bWt'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#bmiBtn').click(); });
  });

  function shake(el) {
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' }
    ], { duration: 380, easing: 'ease' });
  }
})();

/* ═══════════════════════════════════════════
   10. CONTACT FORM
══════════════════════════════════════════ */
(function contactForm() {
  const form = $('#cf');
  const btn  = $('#cfBtn');
  const label = $('#cfBtnLabel');
  const ok   = $('#cfOk');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = $('#cfN').value.trim();
    const phone = $('#cfP').value.trim();
    const msg   = $('#cfM').value.trim(); // ✅ FIXED

    if (!name) { highlight($('#cfN')); return; }
    if (!phone) { highlight($('#cfP')); return; }

    label.textContent = 'Sending…';
    btn.disabled = true;

    // ✅ WhatsApp redirect
    const whatsappMsg = `Name: ${name}%0APhone: ${phone}%0AMessage: ${msg}`;
    const whatsappURL = `https://wa.me/91XXXXXXXXXX?text=${whatsappMsg}`;

    setTimeout(() => {
      window.open(whatsappURL, "_blank");

      label.textContent = 'Send Message';
      btn.disabled = false;
      ok.style.display = 'flex';
      form.reset();

      setTimeout(() => ok.style.display = 'none', 5000);
    }, 800);
  });

  function highlight(el) {
    el.style.borderColor = '#c8102e';
    el.focus();
    el.addEventListener('input', () => el.style.borderColor = '', { once: true });
  }
})();

/* ═══════════════════════════════════════════
   11. BACK TO TOP
══════════════════════════════════════════ */
(function btt() {
  const btn = $('#btt');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ═══════════════════════════════════════════
   12. CARD TILT (Desktop)
══════════════════════════════════════════ */
(function tilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  $$('.pcard, .scard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
})();

/* ═══════════════════════════════════════════
   13. TICKER HOVER PAUSE
══════════════════════════════════════════ */
$('.ticker-track')?.addEventListener('mouseenter', function() { this.style.animationPlayState = 'paused'; });
$('.ticker-track')?.addEventListener('mouseleave', function() { this.style.animationPlayState = 'running'; });

/* ═══════════════════════════════════════════
   14. SMOOTH ANCHOR SCROLL (offset for fixed nav)
══════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════
   15. BMIRESULT: hide initially
══════════════════════════════════════════ */
const bmiResult = $('#bmiResult');
if (bmiResult) bmiResult.style.display = 'none';

/* ── DEV BADGE ── */
console.log('%c IRON FORGE v2 ', 'background:#c8102e;color:#fff;font:bold 14px/1 monospace;padding:8px 16px;border-radius:2px;');
