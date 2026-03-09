/* ============================================================
   NOVAMARK – Dashboard JavaScript
   ============================================================ */

// ── Auth Guard ───────────────────────────────────────────
(function () {
  const user = JSON.parse(localStorage.getItem('novamark_current_user') || 'null');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  // Set user info in sidebar
  const nameEl = document.getElementById('sidebarUserName');
  const emailEl = document.getElementById('sidebarUserEmail');
  const avatarEl = document.getElementById('sidebarUserAvatar');
  const topbarGreet = document.getElementById('topbarGreeting');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.avatar || user.name[0].toUpperCase();
  if (topbarGreet) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    topbarGreet.textContent = `${greeting}, ${user.name.split(' ')[0]} 👋`;
  }
})();

// ── Sidebar Toggle (mobile) ──────────────────────────────
(function () {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
})();

// ── Active Nav Link ──────────────────────────────────────
(function () {
  const links = document.querySelectorAll('.sidebar-link');
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes(page) || (page === 'dashboard.html' && href === 'dashboard.html')) {
      link.classList.add('active');
    }
  });
})();

// ── Logout ───────────────────────────────────────────────
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('novamark_current_user');
  window.location.href = 'login.html';
});

// ── Revenue Chart (Canvas) ───────────────────────────────
function drawRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.width = w;
  canvas.height = h;

  const dataRevenue = [45, 62, 55, 78, 90, 72, 88, 95, 80, 105, 98, 120];
  const dataLeads    = [30, 40, 35, 55, 65, 50, 70, 75, 60, 85, 78, 95];
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxVal = 130;
  const padTop = 20, padRight = 20, padBottom = 36, padLeft = 40;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padTop + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(163,163,184,0.5)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 5) * i) + 'K', padLeft - 6, y + 4);
  }

  function drawLine(data, color, fillColor) {
    ctx.save();
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padLeft + (i / (data.length - 1)) * chartW;
      const y = padTop + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.bezierCurveTo(
        padLeft + ((i - 0.5) / (data.length - 1)) * chartW, padTop + chartH - (data[i - 1] / maxVal) * chartH,
        padLeft + ((i - 0.5) / (data.length - 1)) * chartW, y,
        x, y
      );
    });

    // Fill
    const firstX = padLeft;
    const lastX  = padLeft + chartW;
    ctx.lineTo(lastX, padTop + chartH);
    ctx.lineTo(firstX, padTop + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padLeft + (i / (data.length - 1)) * chartW;
      const y = padTop + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.bezierCurveTo(
        padLeft + ((i - 0.5) / (data.length - 1)) * chartW, padTop + chartH - (data[i - 1] / maxVal) * chartH,
        padLeft + ((i - 0.5) / (data.length - 1)) * chartW, y,
        x, y
      );
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  drawLine(dataLeads,   '#a855f7', 'rgba(168,85,247,0.12)');
  drawLine(dataRevenue, '#6366f1', 'rgba(99,102,241,0.15)');

  // X labels
  ctx.fillStyle = 'rgba(163,163,184,0.5)';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    const x = padLeft + (i / (labels.length - 1)) * chartW;
    ctx.fillText(l, x, h - 10);
  });

  // Dot on last point of revenue
  const lastX = padLeft + chartW;
  const lastY = padTop + chartH - (dataRevenue[dataRevenue.length - 1] / maxVal) * chartH;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── Traffic Donut Chart ──────────────────────────────────
function drawDonutChart() {
  const canvas = document.getElementById('trafficChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 160;
  canvas.width = size;
  canvas.height = size;
  const cx = size / 2, cy = size / 2, r = 68, strokeW = 22;

  const segments = [
    { value: 42, color: '#6366f1' },
    { value: 28, color: '#a855f7' },
    { value: 18, color: '#3b82f6' },
    { value: 12, color: '#10b981' },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let startAngle = -Math.PI / 2;

  segments.forEach(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = strokeW;
    ctx.lineCap = 'butt';
    ctx.stroke();
    startAngle += angle;
  });

  // Gap between segments
  segments.forEach((seg, i) => {
    const angle = -Math.PI / 2 + segments.slice(0, i).reduce((s, s2) => s + (s2.value / total) * Math.PI * 2, 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#060612';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r - strokeW / 2, 0);
    ctx.lineTo(r + strokeW / 2, 0);
    ctx.stroke();
    ctx.restore();
  });
}

// ── Fake Live Metrics ────────────────────────────────────
function startLiveMetrics() {
  const liveEl = document.querySelector('.live-metric-value');
  if (!liveEl) return;
  let base = 1247;
  setInterval(() => {
    base += Math.floor(Math.random() * 5) - 2;
    if (base < 1200) base = 1200;
    liveEl.textContent = base.toLocaleString();
  }, 2500);
}

// ── Progress Bar Animation ───────────────────────────────
function animateProgressBars() {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const target = bar.dataset.width || bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 300);
  });
}

// ── Campaign Filter / Search ─────────────────────────────
function initCampaignFilter() {
  const searchInput = document.getElementById('campaignSearch');
  const filterSelect = document.getElementById('statusFilter');
  const cards = document.querySelectorAll('.campaign-card');
  if (!cards.length) return;

  function filterCards() {
    const query = (searchInput?.value || '').toLowerCase();
    const status = (filterSelect?.value || '').toLowerCase();
    cards.forEach(card => {
      const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const cardStatus = (card.dataset.status || '').toLowerCase();
      const matchSearch = !query || name.includes(query);
      const matchStatus = !status || cardStatus === status;
      card.style.display = matchSearch && matchStatus ? '' : 'none';
    });
  }

  searchInput?.addEventListener('input', filterCards);
  filterSelect?.addEventListener('change', filterCards);
}

// ── Countdown Timer ──────────────────────────────────────
function updateClock() {
  const el = document.getElementById('currentTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── Init ─────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    drawRevenueChart();
    drawDonutChart();
  }, 100);
  animateProgressBars();
  startLiveMetrics();
  initCampaignFilter();
  updateClock();
  setInterval(updateClock, 60000);
});

window.addEventListener('resize', () => {
  drawRevenueChart();
});

// ── Filter Buttons ───────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.chart-filters')?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // In a real app, would reload chart data
  });
});

// ── Tooltip on metrics ───────────────────────────────────
document.querySelectorAll('.metric-card').forEach(card => {
  card.addEventListener('mouseenter', (e) => {
    card.style.borderColor = 'rgba(99,102,241,0.4)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.borderColor = '';
  });
});

// ── Notification Bell Dropdown ───────────────────────────
(function () {
  const bellLink = document.querySelector('.icon-btn[href="#"]');
  if (!bellLink) return;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .notif-panel {
      position:absolute; top:calc(100% + 10px); right:0;
      width:340px; background:var(--bg-card);
      border:1px solid var(--border); border-radius:var(--radius-lg);
      box-shadow:0 20px 60px rgba(0,0,0,0.5);
      z-index:800; opacity:0; pointer-events:none;
      transform:translateY(-8px); transition:all 0.2s ease;
      overflow:hidden;
    }
    .notif-panel.open { opacity:1; pointer-events:all; transform:translateY(0); }
    .notif-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 16px; border-bottom:1px solid var(--border);
    }
    .notif-header strong { font-size:0.88rem; font-weight:700; }
    .notif-mark-all {
      font-size:0.72rem; color:var(--primary-light); cursor:pointer;
      font-weight:600; border:none; background:none; padding:0;
    }
    .notif-mark-all:hover { text-decoration:underline; }
    .notif-list { max-height:340px; overflow-y:auto; }
    .notif-item {
      display:flex; gap:12px; align-items:flex-start;
      padding:13px 16px; border-bottom:1px solid rgba(255,255,255,0.04);
      transition:background 0.15s; cursor:pointer; position:relative;
    }
    .notif-item:hover { background:var(--bg-glass); }
    .notif-item.unread { background:rgba(99,102,241,0.05); }
    .notif-item.unread::before {
      content:''; position:absolute; left:0; top:0; bottom:0;
      width:3px; background:var(--gradient-primary); border-radius:0 2px 2px 0;
    }
    .notif-icon {
      width:36px; height:36px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center; font-size:1rem;
    }
    .notif-body { flex:1; min-width:0; }
    .notif-body p { font-size:0.82rem; color:var(--text-secondary); margin:2px 0 0; line-height:1.4; }
    .notif-body strong { font-size:0.85rem; font-weight:600; color:var(--text-primary); }
    .notif-time { font-size:0.7rem; color:var(--text-muted); white-space:nowrap; }
    .notif-empty { text-align:center; padding:32px 16px; color:var(--text-muted); font-size:0.85rem; }
    .notif-footer {
      padding:10px 16px; text-align:center; border-top:1px solid var(--border);
      font-size:0.78rem; color:var(--primary-light); cursor:pointer; font-weight:600;
    }
    .notif-footer:hover { background:var(--bg-glass); }
    .topbar-actions { position:relative; }
  `;
  document.head.appendChild(style);

  // Sample notifications
  const NOTIFS_KEY = 'novamark_notifs_read';
  const notifications = [
    { id:'n1', icon:'🚀', iconBg:'rgba(99,102,241,0.15)', title:'Campaign "Summer Sale" is live', body:'Your campaign started delivering to 245K users.', time:'2m ago' },
    { id:'n2', icon:'🎯', iconBg:'rgba(59,130,246,0.15)',  title:'Budget alert: Product Launch Q2', body:'You\'ve used 80% of your $7,000 budget.', time:'18m ago' },
    { id:'n3', icon:'👥', iconBg:'rgba(16,185,129,0.15)', title:'1,293 new contacts this month', body:'12% increase compared to last month.', time:'1h ago' },
    { id:'n4', icon:'📈', iconBg:'rgba(168,85,247,0.15)', title:'AI insight available', body:'NovaMark detected an optimisation opportunity in Email Retargeting.', time:'3h ago' },
    { id:'n5', icon:'✉️', iconBg:'rgba(245,158,11,0.15)', title:'Weekly report ready', body:'Your performance digest for W9 is ready to view.', time:'Yesterday' },
  ];

  function getReadSet() {
    return new Set(JSON.parse(localStorage.getItem(NOTIFS_KEY) || '[]'));
  }
  function saveReadSet(set) {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify([...set]));
  }
  function getUnreadCount() {
    const read = getReadSet();
    return notifications.filter(n => !read.has(n.id)).length;
  }
  function updateDot() {
    const dot = bellLink.querySelector('.notif-dot');
    if (!dot) return;
    dot.style.display = getUnreadCount() > 0 ? '' : 'none';
  }

  // Build panel
  const panel = document.createElement('div');
  panel.className = 'notif-panel';
  panel.id = 'notifPanel';

  function renderPanel() {
    const read = getReadSet();
    panel.innerHTML = `
      <div class="notif-header">
        <strong>🔔 Notifications <span style="font-size:0.72rem;color:var(--text-muted);font-weight:400">(${getUnreadCount()} new)</span></strong>
        <button class="notif-mark-all" id="markAllRead">Mark all read</button>
      </div>
      <div class="notif-list">
        ${notifications.map(n => `
          <div class="notif-item ${read.has(n.id) ? '' : 'unread'}" data-id="${n.id}">
            <div class="notif-icon" style="background:${n.iconBg}">${n.icon}</div>
            <div class="notif-body">
              <strong>${n.title}</strong>
              <p>${n.body}</p>
            </div>
            <span class="notif-time">${n.time}</span>
          </div>
        `).join('')}
      </div>
      <div class="notif-footer" onclick="window.location.href='settings.html'">View notification settings →</div>
    `;

    panel.querySelector('#markAllRead').addEventListener('click', (e) => {
      e.stopPropagation();
      const all = new Set(notifications.map(n => n.id));
      saveReadSet(all);
      renderPanel();
      updateDot();
    });

    panel.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const read = getReadSet();
        read.add(item.dataset.id);
        saveReadSet(read);
        item.classList.remove('unread');
        item.querySelector('.notif-icon') && renderPanel();
        updateDot();
      });
    });
  }

  // Wrap bell in relative container if needed
  const topbarActions = document.querySelector('.topbar-actions');
  if (topbarActions && !topbarActions.style.position) {
    topbarActions.style.position = 'relative';
  }
  bellLink.parentElement?.appendChild(panel);

  // Toggle open/close
  bellLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    if (!isOpen) renderPanel();
    panel.classList.toggle('open', !isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== bellLink) {
      panel.classList.remove('open');
    }
  });

  updateDot();
})();
