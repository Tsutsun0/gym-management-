/**
 * AKI Gym Management — Renderer Process
 *
 * ─────────────────────────────────────────────────────────
 *  MySQL integration points are marked with:  // TODO: MySQL
 *  When ready, replace each marked block with an
 *  electronAPI call (already declared in preload.js).
 * ─────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   AKI BOXING SERVICES  —  from akiboxingph.com/services
═══════════════════════════════════════════════════════════ */
const AKI_SERVICES = {
  'Gym Use': [
    { id: 'GU-01', name: 'Gym Use',         price: 120,  bestValue: false, desc: 'Single session, no coach, self-training.' },
    { id: 'GU-02', name: 'Monthly Gym Use', price: 999,  bestValue: false, desc: 'Unlimited gym use for 1 month, no coach, self-training.' },
  ],
  'Strength & Conditioning': [
    { id: 'SC-01', name: 'S&C Session', price: 150,  bestValue: false, desc: 'Get 1-on-1 coaching during your workout session.' },
    { id: 'SC-02', name: 'S&C 1 Month', price: 1400, bestValue: false, desc: 'Get 1 month coaching sessions with food guide and 4-week program included.' },
  ],
  'Boxing': [
    { id: 'BX-01', name: 'Boxing Session',          price: 300,  bestValue: false, desc: '1-on-1 session with coach. Full boxing area use included. Weightlifting area not included.' },
    { id: 'BX-02', name: 'Boxing 10 Session',       price: 2300, bestValue: false, desc: '10 boxing sessions with coach. Full boxing area use included.' },
    { id: 'BX-03', name: 'Boxing 10 Hybrid',        price: 3000, bestValue: false, desc: '10 boxing sessions with coach + unlimited full gym access for 1 month.' },
    { id: 'BX-04', name: 'Boxing Unlimited',        price: 3000, bestValue: false, desc: '1 month unlimited boxing sessions with coach. Full boxing area included.' },
    { id: 'BX-05', name: 'Boxing Hybrid Unlimited', price: 3500, bestValue: true,  desc: '1 month unlimited boxing + unlimited full gym access.' },
  ],
  'Muay Thai': [
    { id: 'MT-01', name: 'Muay Thai Session',          price: 380,  bestValue: false, desc: '1-on-1 session with coach. Full boxing area use included. Weightlifting area not included.' },
    { id: 'MT-02', name: 'Muay Thai 10 Session',       price: 3300, bestValue: false, desc: '10 Muay Thai sessions with coach. Full boxing area use included.' },
    { id: 'MT-03', name: 'Muay Thai 10 Hybrid',        price: 4000, bestValue: false, desc: '10 Muay Thai sessions with coach + unlimited full gym access for 1 month.' },
    { id: 'MT-04', name: 'Muay Thai Unlimited',        price: 4000, bestValue: false, desc: 'Unlimited Muay Thai sessions with coach. Full boxing area included.' },
    { id: 'MT-05', name: 'Muay Thai Hybrid Unlimited', price: 4500, bestValue: true,  desc: 'Unlimited Muay Thai + unlimited full gym access.' },
  ],
  'Body Transformation': [
    { id: 'BT-01', name: 'Body Recomposition Program', price: 3800, bestValue: true, desc: 'A complete transformation program that reshapes your body by burning fat and building muscle. A complete 1 month program will be personalized for you including meal plan and nutrition guide.' },
  ],
};

const ALL_SERVICES_FLAT = Object.values(AKI_SERVICES).flat();
function getServiceById(id) { return ALL_SERVICES_FLAT.find(s => s.id === id); }

/* ═══════════════════════════════════════════════════════════
   IN-MEMORY STORE
   Starts empty — admin adds all members manually.
   ─────────────────────────────────────────────────────────
   TODO: MySQL — remove these arrays and wire the adapter
   functions below to real IPC calls instead.
═══════════════════════════════════════════════════════════ */
let STORE_MEMBERS  = [];   // TODO: MySQL → SELECT * FROM members
let STORE_INVOICES = [];   // TODO: MySQL → SELECT * FROM invoices

// Counters ensure IDs never collide even after deletes
let _memberCounter  = 1;
let _invoiceCounter = 1;

/* ═══════════════════════════════════════════════════════════
   BACKEND ADAPTERS
   Replace each function body with the matching electronAPI
   call when MySQL is ready. The rest of the app never needs
   to change — only these functions.
═══════════════════════════════════════════════════════════ */

// TODO: MySQL → return window.electronAPI.getMembers()
async function getMembers() { return STORE_MEMBERS; }

// TODO: MySQL → return window.electronAPI.getInvoices()
async function getInvoices() { return STORE_INVOICES; }

// TODO: MySQL → return window.electronAPI.addMember(data)
//              or window.electronAPI.updateMember(data.id, data)
async function saveMember(data) {
  if (data.id) {
    // UPDATE existing
    const i = STORE_MEMBERS.findIndex(m => m.id === data.id);
    if (i !== -1) STORE_MEMBERS[i] = data;
  } else {
    // INSERT new — use counter, never array length
    data.id = 'M' + String(_memberCounter).padStart(3, '0');
    _memberCounter++;
    STORE_MEMBERS.push(data);
  }
  return data;
}

// TODO: MySQL → return window.electronAPI.deleteMember(id)
async function deleteMember(id) {
  STORE_MEMBERS = STORE_MEMBERS.filter(m => m.id !== id);
  return true;
}

// TODO: MySQL → return window.electronAPI.addInvoice(data)
async function saveInvoice(data) {
  data.id     = 'INV-' + String(_invoiceCounter).padStart(3, '0');
  data.status = 'pending';
  _invoiceCounter++;
  STORE_INVOICES.push(data);
  return data;
}

// TODO: MySQL → return window.electronAPI.markPaid(id)
async function markInvoicePaid(id) {
  const inv = STORE_INVOICES.find(i => i.id === id);
  if (inv) inv.status = 'paid';
  return true;
}

/* ═══════════════════════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════════════════════ */
Chart.defaults.color = '#8892a4';
Chart.defaults.font.family = 'DM Sans';
let charts = {};

function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

function makeBarChart(id, labels, data) {
  destroyChart(id);
  const ctx = document.getElementById(id).getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, 'rgba(224,32,32,0.9)');
  g.addColorStop(1, 'rgba(224,32,32,0.2)');
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: g, borderRadius: 6, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1e2a', titleColor: '#f0f2f8', bodyColor: '#8892a4', borderColor: '#ffffff11', borderWidth: 1 } },
      scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4e5668' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4e5668' } } },
    },
  });
}

function makeLineChart(id, labels, data) {
  destroyChart(id);
  const ctx = document.getElementById(id).getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, 'rgba(224,32,32,0.25)');
  g.addColorStop(1, 'rgba(224,32,32,0)');
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: '#e02020', borderWidth: 2.5, pointBackgroundColor: '#e02020', pointRadius: 4, pointHoverRadius: 6, fill: true, backgroundColor: g, tension: 0.45 }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1e2a', titleColor: '#f0f2f8', bodyColor: '#8892a4', borderColor: '#ffffff11', borderWidth: 1 } },
      scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4e5668' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4e5668' } } },
    },
  });
}

function makeDoughnutChart(id, labels, data, colors) {
  destroyChart(id);
  const ctx = document.getElementById(id).getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '68%',
      plugins: { legend: { position: 'right', labels: { color: '#8892a4', padding: 16, usePointStyle: true, pointStyleWidth: 10 } }, tooltip: { backgroundColor: '#1a1e2a', titleColor: '#f0f2f8', bodyColor: '#8892a4', borderColor: '#ffffff11', borderWidth: 1 } },
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function initials(f, l)     { return (f[0] + (l[0] || '')).toUpperCase(); }
function fmtPrice(p)        { return '₱' + p.toLocaleString(); }
function fmtDate(str)       { if (!str || str === '—') return '—'; try { return new Date(str).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return str; } }
function memberPlanLabel(m) { const s = getServiceById(m.serviceId); return s ? s.name : (m.serviceId || '—'); }
function statusBadge(s)     { const map = { active: 'Active', inactive: 'Inactive', 'on-hold': 'On Hold', paid: 'Paid', pending: 'Pending', overdue: 'Overdue' }; return `<span class="badge ${s}">${map[s] || s}</span>`; }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function buildServiceOptions(selectEl, selectedId = '') {
  selectEl.innerHTML = '';
  Object.entries(AKI_SERVICES).forEach(([cat, plans]) => {
    const g = document.createElement('optgroup');
    g.label = cat;
    plans.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = `${p.name} — ${fmtPrice(p.price)}`;
      if (p.id === selectedId) o.selected = true;
      g.appendChild(o);
    });
    selectEl.appendChild(g);
  });
}

/* ── Empty state helper ── */
function emptyState(icon, title, subtitle, actionLabel, actionFn) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-sub">${subtitle}</div>
      ${actionLabel ? `<button class="btn-primary" onclick="${actionFn}">${actionLabel}</button>` : ''}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el.id === `page-${page}`));
  if (page === 'dashboard') renderDashboard();
  if (page === 'members')   renderMembers();
  if (page === 'billing')   renderBilling();
  if (page === 'services')  renderServices();
  if (page === 'reports')   renderReports();
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
async function renderDashboard() {
  const members = await getMembers();
  const invoices = await getInvoices();

  const total    = members.length;
  const active   = members.filter(m => m.status === 'active').length;
  const inactive = members.filter(m => m.status === 'inactive').length;
  const onHold   = members.filter(m => m.status === 'on-hold').length;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-active').textContent   = active;
  document.getElementById('stat-inactive').textContent = inactive;
  document.getElementById('stat-hold').textContent     = onHold;

  // Revenue from paid invoices
  const todayRevenue = invoices
    .filter(i => i.status === 'paid' && i.due === new Date().toISOString().split('T')[0])
    .reduce((s, i) => s + i.amount, 0);
  document.getElementById('sidebar-revenue').textContent = fmtPrice(todayRevenue);

  // Charts — show placeholder axes if no data yet
  const hasRevData = invoices.length > 0;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const revenueByDay = days.map(() => 0);
  // TODO: MySQL → aggregate real daily revenue per weekday
  makeBarChart('chart-daily', days, revenueByDay);
  makeLineChart('chart-trend', days, revenueByDay);

  // Recent members table
  const recentBody = document.getElementById('dash-members-body');
  const recent = [...members].reverse().slice(0, 5);
  if (recent.length === 0) {
    recentBody.innerHTML = `<tr><td colspan="5">${emptyState('👤', 'No members yet', 'Add your first member to get started.', null, null)}</td></tr>`;
  } else {
    recentBody.innerHTML = recent.map(m => `
      <tr>
        <td><div class="member-cell">
          <div class="avatar">${initials(m.fname, m.lname)}</div>
          <div><div class="member-cell-name">${m.fname} ${m.lname}</div><div class="member-cell-id">${m.id}</div></div>
        </div></td>
        <td><span class="plan-tag">${memberPlanLabel(m)}</span></td>
        <td>${statusBadge(m.status)}</td>
        <td>${fmtDate(m.joined)}</td>
        <td>${fmtDate(m.nextBilling)}</td>
      </tr>`).join('');
  }
}

/* ═══════════════════════════════════════════════════════════
   SERVICES PAGE
═══════════════════════════════════════════════════════════ */
function renderServices() {
  const container = document.getElementById('services-container');
  container.innerHTML = '';
  Object.entries(AKI_SERVICES).forEach(([category, plans]) => {
    const section = document.createElement('div');
    section.className = 'services-category';
    section.innerHTML = `
      <div class="services-cat-header">
        <h2 class="services-cat-title">${category.toUpperCase()}</h2>
        <span class="services-cat-count">${plans.length} plan${plans.length > 1 ? 's' : ''}</span>
      </div>
      <div class="services-grid"></div>`;
    const grid = section.querySelector('.services-grid');
    plans.forEach(plan => {
      const card = document.createElement('div');
      card.className = `service-card${plan.bestValue ? ' best-value' : ''}`;
      card.innerHTML = `
        ${plan.bestValue ? `<div class="best-value-badge">BEST VALUE</div>` : ''}
        <div class="service-card-name">${plan.name.toUpperCase()}</div>
        <div class="service-card-price">${fmtPrice(plan.price)}</div>
        <div class="service-card-desc">${plan.desc}</div>
        <button class="service-enroll-btn" onclick="enrollService('${plan.id}')">+ Enroll Member</button>`;
      grid.appendChild(card);
    });
    container.appendChild(section);
  });
}

function enrollService(serviceId) {
  editingMember = null;
  document.getElementById('modal-member-title').textContent = 'Add New Member';
  ['m-fname', 'm-lname', 'm-email', 'm-phone', 'm-emergency'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('m-status').value   = 'active';
  document.getElementById('m-joindate').value = new Date().toISOString().split('T')[0];
  buildServiceOptions(document.getElementById('m-service'), serviceId);
  openModal('modal-member');
}

/* ═══════════════════════════════════════════════════════════
   MEMBERS
═══════════════════════════════════════════════════════════ */
let currentFilter = 'all';
let searchQuery   = '';
let editingMember = null;

async function renderMembers() {
  const members = await getMembers();

  const filtered = members.filter(m => {
    const fOk = currentFilter === 'all' || m.status === currentFilter;
    const q   = searchQuery.toLowerCase();
    const sOk = !q
      || `${m.fname} ${m.lname}`.toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
      || m.id.toLowerCase().includes(q)
      || memberPlanLabel(m).toLowerCase().includes(q);
    return fOk && sOk;
  });

  const tbody = document.getElementById('members-body');

  if (members.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState(
      '🥊',
      'No members yet',
      'Start by adding your first gym member.',
      '+ Add First Member',
      "document.getElementById('add-member-btn').click()"
    )}</td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState('🔍', 'No results found', 'Try a different search or filter.', null, null)}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => `
    <tr>
      <td><div class="member-cell">
        <div class="avatar">${initials(m.fname, m.lname)}</div>
        <div><div class="member-cell-name">${m.fname} ${m.lname}</div><div class="member-cell-id">${m.id}</div></div>
      </div></td>
      <td style="color:var(--text-secondary)">${m.email}</td>
      <td style="color:var(--text-secondary)">${m.phone}</td>
      <td><span class="plan-tag">${memberPlanLabel(m)}</span></td>
      <td>${statusBadge(m.status)}</td>
      <td>${fmtDate(m.joined)}</td>
      <td><div style="display:flex;gap:6px">
        <button class="btn-icon" onclick="editMember('${m.id}')" title="Edit">✏️</button>
        <button class="btn-icon danger" onclick="removeMember('${m.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join('');
}

async function editMember(id) {
  const m = (await getMembers()).find(x => x.id === id);
  if (!m) return;
  editingMember = m;
  document.getElementById('modal-member-title').textContent = 'Edit Member';
  document.getElementById('m-fname').value     = m.fname;
  document.getElementById('m-lname').value     = m.lname;
  document.getElementById('m-email').value     = m.email;
  document.getElementById('m-phone').value     = m.phone;
  document.getElementById('m-status').value    = m.status;
  document.getElementById('m-joindate').value  = m.joined;
  document.getElementById('m-emergency').value = m.emergency || '';
  buildServiceOptions(document.getElementById('m-service'), m.serviceId);
  openModal('modal-member');
}

async function removeMember(id) {
  if (!confirm('Remove this member? This cannot be undone.')) return;
  await deleteMember(id);
  showToast('Member removed.', 'success');
  renderMembers();
  renderDashboard();
}

/* ═══════════════════════════════════════════════════════════
   BILLING
═══════════════════════════════════════════════════════════ */
async function renderBilling() {
  const invoices = await getInvoices();

  document.getElementById('billing-paid').textContent    = fmtPrice(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0));
  document.getElementById('billing-pending').textContent = fmtPrice(invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0));
  document.getElementById('billing-overdue').textContent = fmtPrice(invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0));

  const tbody = document.getElementById('billing-body');

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState(
      '🧾',
      'No invoices yet',
      'Create your first invoice once a member is enrolled.',
      '+ New Invoice',
      "document.getElementById('add-invoice-btn').click()"
    )}</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const svc = getServiceById(inv.serviceId);
    return `<tr>
      <td><code style="font-size:12px;color:var(--text-muted)">${inv.id}</code></td>
      <td>${inv.member}</td>
      <td><span class="plan-tag">${svc ? svc.name : '—'}</span></td>
      <td style="font-weight:600">${fmtPrice(inv.amount)}</td>
      <td>${fmtDate(inv.due)}</td>
      <td>${statusBadge(inv.status)}</td>
      <td>${inv.status !== 'paid'
        ? `<button class="btn-icon" onclick="payInvoice('${inv.id}')" title="Mark Paid" style="color:var(--green)">✓</button>`
        : `<span style="color:var(--text-muted);font-size:12px">—</span>`
      }</td>
    </tr>`;
  }).join('');
}

async function payInvoice(id) {
  await markInvoicePaid(id);
  showToast('Invoice marked as paid!', 'success');
  renderBilling();
  renderDashboard();
}

/* ═══════════════════════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════════════════════ */
async function renderReports() {
  const members  = await getMembers();
  const invoices = await getInvoices();

  // Monthly revenue — zero-filled until MySQL provides real data
  // TODO: MySQL → aggregate invoices by month from DB
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = new Array(12).fill(0);
  invoices.filter(i => i.status === 'paid').forEach(i => {
    const m = new Date(i.due).getMonth();
    if (!isNaN(m)) monthlyData[m] += i.amount;
  });
  makeBarChart('chart-monthly', months, monthlyData);

  // New members per month
  const newMemberData = new Array(6).fill(0);
  members.forEach(m => {
    const monthsAgo = (new Date() - new Date(m.joined)) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo >= 0 && monthsAgo < 6) newMemberData[5 - Math.floor(monthsAgo)]++;
  });
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('en-PH', { month: 'short' });
  });
  makeBarChart('chart-new-members', last6, newMemberData);

  // Membership breakdown doughnut
  const active   = members.filter(m => m.status === 'active').length;
  const inactive = members.filter(m => m.status === 'inactive').length;
  const onHold   = members.filter(m => m.status === 'on-hold').length;
  makeDoughnutChart('chart-doughnut',
    ['Active', 'Inactive', 'On Hold'],
    [active || 0, inactive || 0, onHold || 0],
    ['#22c55e', '#e02020', '#eab308']
  );

  // Popular services
  const svcCount = {};
  members.forEach(m => { const s = getServiceById(m.serviceId); if (s) svcCount[s.name] = (svcCount[s.name] || 0) + 1; });
  const sorted = Object.entries(svcCount).sort((a, b) => b[1] - a[1]);
  const maxC   = sorted[0]?.[1] || 1;
  const popEl  = document.getElementById('popular-services');
  if (popEl) {
    popEl.innerHTML = sorted.length
      ? sorted.map(([name, count]) => `
          <div class="pop-row">
            <div class="pop-label">${name}</div>
            <div class="pop-bar-wrap"><div class="pop-bar" style="width:${(count / maxC * 100).toFixed(0)}%"></div></div>
            <div class="pop-count">${count}</div>
          </div>`).join('')
      : `<div style="color:var(--text-muted);font-size:13px;padding:16px 0;text-align:center">No data yet — enroll members to see service popularity.</div>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  // Date badge
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  // Sidebar revenue starts at ₱0 — updates dynamically
  document.getElementById('sidebar-revenue').textContent = '₱0.00';
  document.getElementById('sidebar-delta').textContent   = 'No transactions today';

  // Titlebar controls
  document.getElementById('btn-min').addEventListener('click',   () => window.electronAPI?.minimize());
  document.getElementById('btn-max').addEventListener('click',   () => window.electronAPI?.maximize());
  document.getElementById('btn-close').addEventListener('click', () => window.electronAPI?.close());

  // Navigation
  document.querySelectorAll('.nav-item').forEach(el => el.addEventListener('click', () => navigate(el.dataset.page)));

  // Filter tabs (members)
  document.querySelectorAll('.ftab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderMembers();
  }));

  // Member search
  document.getElementById('member-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderMembers();
  });

  // ── Add Member ──
  document.getElementById('add-member-btn').addEventListener('click', () => {
    editingMember = null;
    document.getElementById('modal-member-title').textContent = 'Add New Member';
    ['m-fname', 'm-lname', 'm-email', 'm-phone', 'm-emergency'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('m-status').value   = 'active';
    document.getElementById('m-joindate').value = new Date().toISOString().split('T')[0];
    buildServiceOptions(document.getElementById('m-service'), 'GU-02');
    openModal('modal-member');
  });

  // ── Save Member ──
  document.getElementById('save-member-btn').addEventListener('click', async () => {
    const fname = document.getElementById('m-fname').value.trim();
    const lname = document.getElementById('m-lname').value.trim();
    if (!fname || !lname) { showToast('First and last name are required.', 'error'); return; }

    const data = {
      id:          editingMember?.id || null,
      fname,
      lname,
      email:       document.getElementById('m-email').value.trim(),
      phone:       document.getElementById('m-phone').value.trim(),
      serviceId:   document.getElementById('m-service').value,
      status:      document.getElementById('m-status').value,
      joined:      document.getElementById('m-joindate').value,
      nextBilling: '—',
      emergency:   document.getElementById('m-emergency').value.trim(),
    };

    await saveMember(data);
    closeModal('modal-member');
    showToast(editingMember ? 'Member updated!' : 'Member added!', 'success');
    editingMember = null;
    renderMembers();
    renderDashboard();
  });

  // ── Add Invoice ──
  document.getElementById('add-invoice-btn').addEventListener('click', async () => {
    const members = await getMembers();
    if (members.length === 0) {
      showToast('Add a member first before creating an invoice.', 'error');
      return;
    }
    const memSel = document.getElementById('inv-member');
    memSel.innerHTML = members.map(m => `<option value="${m.id}">${m.fname} ${m.lname}</option>`).join('');
    const svcSel = document.getElementById('inv-service');
    buildServiceOptions(svcSel, members[0]?.serviceId || '');
    const fillAmt = () => { const s = getServiceById(svcSel.value); if (s) document.getElementById('inv-amount').value = s.price; };
    svcSel.onchange = fillAmt;
    fillAmt();
    document.getElementById('inv-due').value = new Date().toISOString().split('T')[0];
    openModal('modal-invoice');
  });

  // ── Save Invoice ──
  document.getElementById('save-invoice-btn').addEventListener('click', async () => {
    const memberId  = document.getElementById('inv-member').value;
    const member    = (await getMembers()).find(m => m.id === memberId);
    const serviceId = document.getElementById('inv-service').value;
    const amount    = parseFloat(document.getElementById('inv-amount').value);
    if (!member || isNaN(amount)) { showToast('Fill in all fields.', 'error'); return; }
    await saveInvoice({ memberId, member: `${member.fname} ${member.lname}`, serviceId, amount, due: document.getElementById('inv-due').value });
    closeModal('modal-invoice');
    showToast('Invoice created!', 'success');
    renderBilling();
    renderDashboard();
  });

  // ── Modal close handlers ──
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); }));

  // Initial render
  await renderDashboard();
});

// Expose for inline onclick
window.navigate      = navigate;
window.editMember    = editMember;
window.removeMember  = removeMember;
window.payInvoice    = payInvoice;
window.enrollService = enrollService;
