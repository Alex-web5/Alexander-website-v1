import gsap from "gsap";
AOS.init({ startEvent: "preloader:done" });

// navigation code section
// ===== mobile menu =====
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

function setMenu(open) {
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.toggleAttribute("inert", !open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.documentElement.classList.toggle("menu-open", open);
}
const menuIsOpen = () => mobileMenu.classList.contains("is-open");

menuBtn.addEventListener("click", () => setMenu(!menuIsOpen()));

// any link inside the menu closes it (unlocking scroll before the anchor jump)
mobileMenu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuIsOpen()) { setMenu(false); menuBtn.focus(); }
});

// rotating a tablet or resizing to desktop width must not leave the page locked
window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});


// ===== role swap: transform + opacity only, one transition at a time =====
function initRoleSwap() {
  const root = document.querySelector("[data-swap]");
  if (!root) return;
  const words = [...root.querySelectorAll(".swap-word")];
  if (words.length < 2) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dist = reduce ? 0 : 100;   // reduced motion: crossfade only, no sliding
  const HOLD = 2.4;                // seconds each word stays on screen

  gsap.set(words, { yPercent: dist, opacity: 0, force3D: true });
  gsap.set(words[0], { yPercent: 0, opacity: 1 });
  words.slice(1).forEach((w) => w.setAttribute("aria-hidden", "true"));

  let i = 0, inView = true, timer;

  const step = () => {
    const cur = words[i];
    i = (i + 1) % words.length;
    const nxt = words[i];
    cur.setAttribute("aria-hidden", "true");
    nxt.removeAttribute("aria-hidden");

    // The next hold only starts when this transition finishes, so they can never overlap.
    gsap.timeline({ onComplete: schedule })
      .to(cur, { yPercent: -dist, opacity: 0, duration: 0.45, ease: "power2.in" }, 0)
      .fromTo(nxt,
        { yPercent: dist, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.2);
  };

  // delayedCall runs on GSAP's ticker, which stops in hidden tabs, so nothing piles up.
  const schedule = () => {
    timer = gsap.delayedCall(HOLD, step);
    timer.paused(!inView);
  };

  // Pause while the hero is scrolled out of view.
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    timer?.paused(!inView);
  }).observe(root);

  schedule();
}
initRoleSwap();


// ===== fixed navbar: scroll state, progress bar, scroll-spy, sliding pill =====
const siteNav = document.getElementById("site-nav");
const progress = document.getElementById("scroll-progress");
const desktopNav = document.getElementById("desktop-nav");
const pill = document.getElementById("nav-pill");
const navLinks = [...document.querySelectorAll("[data-nav]")];
const sectionIds = [...new Set(navLinks.map((l) => l.getAttribute("href").slice(1)))];
let activeId = "home";

function movePill(link) {
  if (!pill || !link || !desktopNav.offsetParent) return;
  const n = desktopNav.getBoundingClientRect();
  const r = link.getBoundingClientRect();
  pill.style.width = r.width + "px";
  pill.style.transform = `translateX(${r.left - n.left}px)`;
  pill.style.opacity = "1";
}

function setActive(id) {
  activeId = id;
  navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
  movePill(desktopNav.querySelector(`[href="#${id}"]`));
}

const spy = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
  { rootMargin: "-40% 0px -55% 0px" }
);
sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  siteNav.dataset.scrolled = y > 20;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  // short last section: force Contact active at the very bottom
  if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) setActive("contact");
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => setActive(activeId));
document.fonts.ready.then(() => { setActive(activeId); onScroll(); });

// Gsap Image on Hover Effect
//
document.addEventListener("DOMContentLoaded", () => {
  window.revealImage = (element) => {
    const img = element.querySelector(".preview-image");
    if (img) {
      gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  window.hideImage = (element) => {
    const img = element.querySelector(".preview-image");
    if (img) {
      gsap.to(img, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };
});

function initExperienceTimeline() {
  const wrap = document.getElementById('exp-timeline');
  const fill = document.getElementById('exp-line-fill');
  if (!wrap || !fill) return;

  const items = [...wrap.querySelectorAll('[data-tl-item]')];

  const update = () => {
    const rect = wrap.getBoundingClientRect();
    const trigger = window.innerHeight * 0.6; // where the "tip" of the line sits on screen

    const filled = Math.min(Math.max(trigger - rect.top, 0), rect.height);
    fill.style.height = filled + 'px';

    items.forEach((item) => {
      const dot = item.querySelector('[data-tl-dot]').getBoundingClientRect();
      item.classList.toggle('is-active', dot.top < trigger);
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

initExperienceTimeline();



/* ===================== PROJECTS: hover preview + case-study modal ===================== */
function initProjects() {
  const preview = document.getElementById('project-preview');
  const layers = new Map(
    preview ? [...preview.querySelectorAll('[data-for]')].map((img) => [img.dataset.for, img]) : []
  );
  layers.forEach((img) => img.addEventListener('error', () => img.classList.add('is-missing')));

  let hidePreview = () => {};
  if (preview && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hidePreview = initHoverPreview(preview, layers);
  }
  initCaseModal(layers, hidePreview);
}

function initHoverPreview(preview, layers) {
  const capIndex = preview.querySelector('[data-pv-index]');
  const capType = preview.querySelector('[data-pv-type]');

  const pointer = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let tilt = 0, raf = 0, current = null, visible = false, hiddenAt = -Infinity;
  let size = { w: 384, h: 240 };

  const measure = () => { size = { w: preview.offsetWidth, h: preview.offsetHeight }; };
  window.addEventListener('resize', measure);

  // Where the card wants to be: right of the cursor, flipped left near the edge, clamped vertically.
  const targetFor = () => {
    const gap = 28, pad = 16;
    let x = pointer.x + gap;
    if (x + size.w > window.innerWidth - pad) x = pointer.x - gap - size.w;
    const y = Math.max(pad, Math.min(pointer.y - size.h / 2, window.innerHeight - size.h - pad));
    return { x, y };
  };

  const paint = () => {
    preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`;
  };

  const tick = () => {
    const t = targetFor();
    const dx = t.x - pos.x, dy = t.y - pos.y;
    pos.x += dx * 0.14;
    pos.y += dy * 0.14;
    tilt += (Math.max(-7, Math.min(7, dx * 0.05)) - tilt) * 0.12;   // lean into the movement
    paint();
    const settled = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(tilt) < 0.05;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // The ONLY place state changes. No timers, no per-row tweens, so nothing can get stuck.
  const setActive = (row) => {
    if (row === current) return;
    current = row;

    if (!row) {                       // keep the last image on screen while the card fades out
      visible = false;
      hiddenAt = performance.now();
      preview.classList.remove('is-visible');
      return;
    }

    layers.forEach((img, id) => img.classList.toggle('is-active', id === row.dataset.preview));
    capIndex.textContent = row.dataset.index || '';
    capType.textContent = row.dataset.type || '';

    if (!visible) {
      measure();
      if (performance.now() - hiddenAt > 400) {   // fully gone: appear at the cursor instead of flying in
        const t = targetFor();
        pos.x = t.x; pos.y = t.y; tilt = 0;
        paint();
      }
      visible = true;
      preview.classList.add('is-visible');
    }
    kick();
  };

  // State is re-derived from where the pointer actually is on every move.
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    setActive(e.target.closest?.('.project-row') ?? null);
    if (visible) kick();
  }, { passive: true });

  // Content moves under a still pointer when scrolling, so re-check what is under it.
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued || !visible) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const el = document.elementFromPoint(pointer.x, pointer.y);
      setActive(el?.closest('.project-row') ?? null);
    });
  }, { passive: true });

  // Safety nets: pointer leaves the page, window loses focus, tab hidden.
  document.documentElement.addEventListener('pointerleave', () => setActive(null));
  window.addEventListener('blur', () => setActive(null));
  document.addEventListener('visibilitychange', () => document.hidden && setActive(null));

  return () => setActive(null);
}

function initCaseModal(layers, hidePreview) {
  const dlg = document.getElementById('case-modal');
  if (!dlg) return;

  const scroller = dlg.querySelector('[data-case-scroll]');
  const content = dlg.querySelector('[data-case-body]');
  const nextLabel = dlg.querySelector('[data-case-next-label]');
  const triggers = [...document.querySelectorAll('[data-case]')];
  let index = -1, lastTrigger = null, closeTimer = 0;

  const render = (i) => {
    const trigger = triggers[i];
    const tpl = trigger && document.getElementById(trigger.dataset.case);
    if (!tpl) return false;

    index = i;
    lastTrigger = trigger;
    content.replaceChildren(tpl.content.cloneNode(true));

    // Reuse the hover-preview screenshot as the banner (falls back to nothing if it's missing).
    const hero = content.querySelector('[data-case-hero]');
    const src = layers.get(trigger.dataset.preview)?.getAttribute('src');
    if (hero && src) {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.addEventListener('error', () => hero.remove(), { once: true });
      img.src = src;
      hero.append(img);
    } else {
      hero?.remove();
    }

    const next = triggers[(i + 1) % triggers.length];
    nextLabel.textContent = next.querySelector('[data-row-title]')?.textContent ?? 'next project';

    scroller.scrollTop = 0;
    content.classList.remove('is-swapping');
    void content.offsetWidth;                 // restart the entrance animation
    content.classList.add('is-swapping');
    return true;
  };

  const open = (i) => {
    clearTimeout(closeTimer);
    hidePreview();
    if (!render(i)) return;
    document.documentElement.classList.add('modal-open');
    if (!dlg.open) dlg.showModal();           // native dialog: focus trap, inert page, Esc
    requestAnimationFrame(() => dlg.classList.add('is-open'));
  };

  const close = () => {
    if (!dlg.open) return;
    dlg.classList.remove('is-open');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => dlg.close(), 300);   // wait for the exit animation
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-case]');
    if (trigger) open(triggers.indexOf(trigger));
  });

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-case-close]')) close();       // backdrop or X
    else if (e.target.closest('[data-case-next]')) render((index + 1) % triggers.length);
  });

  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });         // Esc
  dlg.addEventListener('close', () => {
    dlg.classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
    lastTrigger?.focus({ preventScroll: true });
  });
}

initProjects();

// ===========================
const lagosTime = document.getElementById('lagos-time');
if (lagosTime) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
  });
  const tick = () => { lagosTime.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 30000);
}



/* ===================== FUN NOTIFICATIONS ===================== */
function initNotifications() {
  const toast = document.getElementById('notify-toast');
  const bell = document.getElementById('notify-bell');
  if (!toast || !bell) return;

  const q = (s) => toast.querySelector(s);
  const el = {
    icon: q('[data-n-icon]'), label: q('[data-n-label]'), count: q('[data-n-count]'),
    title: q('[data-n-title]'), text: q('[data-n-text]'), action: q('[data-n-action]'), bar: q('[data-n-bar]'),
  };

  const lagosTime = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date());

  // ✏️ Edit, add or remove messages here. `text` can be a function for live content.
  const messages = [
    { icon: '👋', label: 'PLAYER 5 JOINED', title: 'Welcome, traveller',
      text: 'You found the notification corner. A few fun facts about the dev.' },

    { icon: '🎮', label: 'ACHIEVEMENT UNLOCKED', title: 'Professional bug hunter',
      text: 'Alexander enjoys testing games. Breaking things on purpose is officially a hobby.' },

    { icon: '📖', label: 'NOW WRITING', title: 'PLOT ARMOR: Legend Of Mamoru',
      text: 'A story in progress. No spoilers yet, but the plot armor is holding up nicely.' },

    { icon: '💬', label: 'NEW MESSAGE', title: 'Relationship status',
      text: 'Single as F***, Committed to VS Code. It\u2019s complicated.' },

    // {
    //   icon: '🧊', label: 'BEYOND THE CODE', title: 'Gaming & 3D art enthusiast',
    //   text: 'I’m fascinated by game development and 3D character design. Haven’t started the quest just yet, but if you’re in the gaming industry or know someone I should connect with, let’s talk!'
    // },

    {
      icon: '🧟', label: 'SIDE QUEST', title: 'Surviving Resident Evil: Village',
      text: 'Currently trying to survive Resident Evil: Village. Between the monsters and my questionable decisions, I still find myself fascinated by the creativity behind games. Know anyone in the gaming industry? Let’s connect!'
    },

    { icon: '🕐', label: 'LIVE FROM LAGOS', title: () => `It\u2019s ${lagosTime()} in Lagos`,
      text: 'Alexander is probably coding, writing, or testing a game. Possibly all three.' },

    { icon: '🏦', label: 'PATCH NOTES', title: 'The serious bit',
      text: 'Ships real banking software at LAPO, including a .NET back-office API he took over and kept running.',
      action: { label: 'See case studies', href: '#portfolio' } },

    { icon: '📜', label: 'NEW QUEST AVAILABLE', title: 'Open to new roles',
      text: 'Full-stack and frontend engineering roles, plus selected freelance projects. Accept this quest?',
      action: { label: 'Get in touch', href: '#contact' } },
  ];

  const SHOW_MS = 8000;   // time each message stays
  const GAP_MS = 2500;    // pause between messages
  const FIRST_MS = 4000;  // delay before the first one
  const KEY = 'notify-muted';

  let i = -1, timer = 0;

  const store = {
    get: () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } },
    set: (v) => { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch {} },
  };
  const val = (v) => (typeof v === 'function' ? v() : v);
  const blocked = () => document.hidden || document.querySelector('dialog[open]');

  const render = (m) => {
    el.icon.textContent = m.icon;
    el.label.textContent = m.label;
    el.count.textContent = `${i + 1}/${messages.length}`;
    el.title.textContent = val(m.title);
    el.text.textContent = val(m.text);

    if (m.action) {
      el.action.textContent = m.action.label + ' →';
      el.action.href = m.action.href;
      el.action.toggleAttribute('download', !!m.action.download);
      const external = /^https?:/.test(m.action.href);
      el.action.target = external ? '_blank' : '';
      el.action.rel = external ? 'noopener noreferrer' : '';
      el.action.hidden = false;
    } else {
      el.action.hidden = true;
    }
  };

  const show = () => {
    render(messages[i]);
    toast.hidden = false;
    void toast.offsetWidth;                    // let the browser register the hidden state first
    toast.classList.add('is-in');
    el.bar.style.setProperty('--dur', SHOW_MS + 'ms');
    el.bar.style.animation = 'none';           // restart the countdown
    void el.bar.offsetWidth;
    el.bar.style.animation = '';
  };

  const hideThen = (cb) => {
    clearTimeout(timer);
    toast.classList.remove('is-in');
    timer = setTimeout(() => { toast.hidden = true; cb?.(); }, 350);
  };

  const next = () => {
    if (store.get()) return;
    if (blocked()) { timer = setTimeout(next, 1500); return; }   // wait while the tab or a popup is in the way
    i += 1;
    if (i >= messages.length) { bell.hidden = false; return; }   // done: leave the replay bell
    show();
  };

  const dismiss = () => hideThen(() => { timer = setTimeout(next, GAP_MS); });

  const mute = () => {
    store.set(true);
    hideThen(() => { bell.hidden = false; });
  };

  const start = (delay) => {
    clearTimeout(timer);
    i = -1;
    bell.hidden = true;
    timer = setTimeout(next, delay);
  };

  el.bar.addEventListener('animationend', dismiss);
  q('[data-n-close]').addEventListener('click', dismiss);
  q('[data-n-mute]').addEventListener('click', mute);
  el.action.addEventListener('click', () => { if (!el.action.target) dismiss(); });
  bell.addEventListener('click', () => { store.set(false); start(200); });

  if (store.get()) bell.hidden = false;
  else start(FIRST_MS);
}
initNotifications();


// ===== preloader =====
function initPreloader() {
  const root = document.documentElement;
  const pre = document.getElementById("preloader");
  let released = false;

  // Unlocks scroll and tells AOS (and anything else) the page is ready to be seen
  const release = () => {
    if (released) return;
    released = true;
    root.classList.remove("is-loading");
    try { sessionStorage.setItem("pl-seen", "1"); } catch {}
    document.dispatchEvent(new Event("preloader:done"));
  };

  // Returning visitor or reduced motion: skip straight through
  if (!pre || !root.classList.contains("is-loading")) { pre?.remove(); release(); return; }

  const panel = pre.querySelector(".pl-panel");
  const ui = [...pre.querySelectorAll("[data-pl-ui]")];
  const num = pre.querySelector("[data-pl-count]");
  const bar = pre.querySelector("[data-pl-bar]");

  // Split the wordmark into masked letters so they can rise one by one
  const chars = [];
  pre.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch) => {
      const mask = document.createElement("span");
      const c = document.createElement("span");
      mask.className = "pl-mask";
      c.className = "pl-char";
      c.textContent = ch;
      mask.append(c);
      el.append(mask);
      chars.push(c);
    });
  });
  gsap.set(chars, { yPercent: 110 });
  pre.classList.add("is-ready");

  const state = { v: 0 };
  const render = () => {
    num.textContent = String(Math.round(state.v)).padStart(3, "0");
    gsap.set(bar, { scaleX: state.v / 100 });
  };

  // Safety net: never trap a visitor behind the loader
  const bail = setTimeout(() => { release(); pre.remove(); }, 8000);

  // Intro: letters rise, counter climbs to 85
  const intro = gsap.timeline()
    .to(chars, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "power4.out" }, 0.1)
    .from(ui, { opacity: 0, y: 12, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.3)
    .to(state, { v: 85, duration: 1.4, ease: "power2.out", onUpdate: render }, 0);

  // Exit: finish the count, letters leave, curtain lifts, hero animates in
  const exit = () => {
    gsap.timeline({ onComplete: () => { clearTimeout(bail); pre.remove(); } })
      .to(state, { v: 100, duration: 0.5, ease: "power2.inOut", onUpdate: render })
      .to(chars, { yPercent: -110, duration: 0.6, stagger: 0.03, ease: "power3.in" }, "+=0.2")
      .to(ui, { opacity: 0, duration: 0.35 }, "<")
      .to(panel, { yPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.15")
      .add(release, "-=0.6");   // hero starts animating while the curtain is still clearing
  };

  // Wait for: the intro, the page (capped at 3.5s), and fonts
  const loaded = new Promise((r) =>
    document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })
  );
  const cap = new Promise((r) => setTimeout(r, 3500));
  const introDone = new Promise((r) => intro.eventCallback("onComplete", r));
  Promise.all([Promise.race([loaded, cap]), document.fonts.ready, introDone]).then(exit);
}
initPreloader();