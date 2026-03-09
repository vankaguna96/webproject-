/* ============================================================
   NOVAMARK – Main JavaScript
   ============================================================ */

// ── Navbar Scroll Effect ─────────────────────────────────
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
})();

// ── Hamburger Menu ───────────────────────────────────────
(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(13,13,26,0.95)';
    navLinks.style.backdropFilter = 'blur(20px)';
    navLinks.style.padding = '16px';
    navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    if (!isOpen) navLinks.style.display = 'flex';
    else navLinks.style.display = 'none';
  });
})();

// ── Pricing Toggle ───────────────────────────────────────
(function () {
  const toggle = document.getElementById('billingToggle');
  if (!toggle) return;
  toggle.addEventListener('change', () => {
    const isYearly = toggle.checked;
    document.querySelectorAll('.amount').forEach(el => {
      const target = isYearly
        ? parseInt(el.dataset.yearly)
        : parseInt(el.dataset.monthly);
      animateCount(el, target);
    });
  });

  function animateCount(el, target) {
    const start = parseInt(el.textContent) || 0;
    const duration = 400;
    const startTime = performance.now();
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
})();

// ── Intersection Observer Animations ─────────────────────
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
})();

// ── Toast Notification ───────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Smooth Anchor Scrolling ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Number Counter Animation ─────────────────────────────
function animateNumbers() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const text = el.textContent;
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;

    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (num * eased).toFixed(num % 1 !== 0 ? 1 : 0) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

const heroSection = document.querySelector('.hero');
if (heroSection) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateNumbers();
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(heroSection);
}
