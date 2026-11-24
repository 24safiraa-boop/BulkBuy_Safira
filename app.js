/* ==========================================================
   BulkBuy — state, interaksi, dan routing prototype
   ========================================================== */
'use strict';

const D = window.BB_DATA;
const STORAGE_KEY = 'bulkbuy.prototype.v1';
const TODAY = new Date('2026-11-24T10:00:00');
const TODAY_ISO = '2026-11-24';

/* ---------- utilitas ---------- */
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function rp(n) {
  return 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
}
function progressPct(item) {
  const target = Number(item.target) || 0;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Number(item.collected) || 0) / target * 100));
}
function isReached(item) {
  return Number(item.collected) >= Number(item.target) && Number(item.target) > 0;
}
function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function deadlineInfo(iso) {
  if (!iso) return { days: null, label: 'Tanpa batas', ended: false, urgent: false };
  const end = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  const start = new Date(TODAY_ISO + 'T00:00:00');
  if (Number.isNaN(end.getTime())) return { days: null, label: 'Tanpa batas', ended: false, urgent: false };
  const days = Math.round((end - start) / 86400000);
  if (days < 0) return { days, label: 'Berakhir', ended: true, urgent: true };
  if (days === 0) return { days, label: 'Berakhir hari ini', ended: false, urgent: true };
  if (days === 1) return { days, label: 'Besok terakhir', ended: false, urgent: true };
  return { days, label: days + ' hari lagi', ended: false, urgent: days <= 2 };
}
function groupState(item) {
  const pct = progressPct(item);
  const dl = deadlineInfo(item.deadline);
  if (isReached(item)) return { key: 'reached', label: 'Target Tercapai', badgeText: 'Target Tercapai', badge: 'badge-green' };
  if (dl.ended) return { key: 'ended', label: 'Ditutup', badgeText: 'Grup Ditutup', badge: 'badge-gray' };
  if (pct >= 80) return { key: 'almost', label: 'Hampir Penuh', badgeText: 'Grup Hampir Penuh', badge: 'badge-amber' };
  return { key: 'running', label: 'Berjalan', badgeText: 'Harga Kolektif', badge: 'badge-blue' };
}
function initialsOf(name) {
  return String(name || 'SR').trim().split(/\s+/).map((x) => x[0] || '').join('').slice(0, 2).toUpperCase();
}
function selectedIf(a, b) { return String(a) === String(b) ? ' selected' : ''; }

const ORDER_STATUS = {
  target: { label: 'Menunggu Target', cls: 'badge-amber' },
  payment: { label: 'Menunggu Pembayaran', cls: 'badge-violet' },
  process: { label: 'Diproses', cls: 'badge-blue' },
  shipped: { label: 'Dikirim', cls: 'badge-teal' },
  done: { label: 'Selesai', cls: 'badge-green' },
  cancelled: { label: 'Dibatalkan', cls: 'badge-red' }
};
function statusMeta(order) {
  return ORDER_STATUS[order.status] || ORDER_STATUS.target;
}

/* ---------- state ---------- */
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function defaultState() {
  return {
    products: clone(D.products),
    orders: clone(D.orders),
    wishlist: ['p3', 'p6', 'p9'],
    profile: clone(D.profile),
    customGroups: [],
    draft: null
  };
}
function loadState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return base;
    if (Array.isArray(saved.products)) {
      base.products = base.products.map((p) => {
        const found = saved.products.find((x) => x && x.id === p.id);
        return found && Number.isFinite(Number(found.collected)) ? { ...p, collected: Math.max(0, Number(found.collected)) } : p;
      });
    }
    if (Array.isArray(saved.orders)) base.orders = saved.orders;
    if (Array.isArray(saved.wishlist)) base.wishlist = saved.wishlist.filter((x) => typeof x === 'string');
    if (saved.profile && typeof saved.profile === 'object') base.profile = { ...base.profile, ...saved.profile };
    if (Array.isArray(saved.customGroups)) base.customGroups = saved.customGroups;
    if (saved.draft && typeof saved.draft === 'object') base.draft = saved.draft;
  } catch (err) { /* gunakan data default */ }
  return base;
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...state })); } catch (err) { /* storage penuh */ }
}
let state = loadState();

/* ---------- filter & UI state ---------- */
const catalogFilters = { q: '', category: '', supplier: '', price: 'all', status: 'all', sort: 'default' };
const groupFilters = { q: '', status: 'all', category: '', sort: 'popular' };
const wishlistFilters = { q: '', category: '', status: 'all' };
const orderFilters = { tab: 'all', q: '' };
const helpFilters = { q: '', category: 'all' };
let paymentUI = { orderId: null, method: 'Transfer Bank' };
let profileEditing = false;
let flashOrderId = null;
let joinIntent = { id: null, qty: 1 };
let toastTimer = null;

/* ---------- data turunan ---------- */
function findItem(id) {
  return state.products.find((p) => p.id === id) || state.customGroups.find((g) => g.id === id) || null;
}
function findOrder(id) { return state.orders.find((o) => o.id === id) || null; }
function allGroups() { return state.products.concat(state.customGroups); }
function joinedGroupIds() {
  const set = new Set();
  state.orders.forEach((o) => {
    if (['target', 'payment', 'process', 'shipped'].includes(o.status)) set.add(o.productId);
  });
  return set;
}
function orderProduct(order) {
  const p = findItem(order.productId);
  if (p) return p;
  return {
    id: order.productId || 'unknown',
    name: order.productName || 'Produk',
    emoji: '📦',
    supplier: order.supplier || 'Supplier',
    category: order.category || 'Lainnya',
    price: Number(order.unitPrice) || 0,
    unit: order.unit || 'unit',
    target: Number(order.groupTarget) || 0,
    collected: Number(order.groupCollected) || 0,
    deadline: order.groupDeadline || null
  };
}
function orderGroup(order) {
  const p = findItem(order.productId);
  if (order.status === 'target' && p) {
    return { target: p.target, collected: p.collected, deadline: p.deadline, unit: p.unit };
  }
  return {
    target: Number(order.groupTarget ?? p?.target ?? 0),
    collected: Number(order.groupCollected ?? p?.collected ?? 0),
    deadline: order.groupDeadline ?? p?.deadline ?? null,
    unit: p?.unit || order.unit || 'unit'
  };
}
function orderTotals(order) {
  const p = findItem(order.productId);
  const unitPrice = Number(order.unitPrice ?? p?.price ?? 0);
  const subtotal = unitPrice * Number(order.qty || 0);
  const charged = ['payment', 'process', 'shipped', 'done'].includes(order.status);
  const shipping = charged ? Number(order.shipping ?? 25000) : Number(order.shipping || 0);
  const fee = charged ? Number(order.fee ?? 2500) : Number(order.fee || 0);
  return { unitPrice, subtotal, shipping, fee, total: subtotal + shipping + fee, charged };
}
function orderNote(order) {
  const group = orderGroup(order);
  switch (order.status) {
    case 'target': {
      const dl = deadlineInfo(group.deadline);
      const pct = group.target ? Math.min(100, Math.round(group.collected / group.target * 100)) : 0;
      return `⏳ Menunggu target · ${pct}% tercapai${dl.ended ? '' : ' · ' + dl.label.toLowerCase()}`;
    }
    case 'payment': return '🎯 Target tercapai · segera lakukan pembayaran';
    case 'process': return '📦 Supplier sedang menyiapkan barang';
    case 'shipped': return order.tracking ? `🚚 Dikirim · estimasi tiba ${order.tracking.eta}` : '🚚 Pesanan dalam pengiriman';
    case 'done': return '✓ Pesanan diterima dan selesai';
    case 'cancelled': return '✕ Pesanan dibatalkan';
    default: return '';
  }
}
function nextOrderId() {
  const nums = state.orders
    .map((o) => parseInt(String(o.id).replace(/\D/g, ''), 10))
    .filter((n) => Number.isFinite(n));
  return 'BB-' + (Math.max(2401, ...nums) + 1);
}

/* ---------- toast & modal ---------- */
const modalRoot = document.getElementById('modalRoot');
let lastFocus = null;

function toast(message, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast' + (type ? ' ' + type : ''); }, 2800);
}
function openModal(inner, label = 'Dialog') {
  if (!modalRoot) return;
  lastFocus = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(label)}">${inner}</div>`;
  modalRoot.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const focusable = modalRoot.querySelector('.modal-close, input, button, a');
    if (focusable) focusable.focus();
  }, 40);
}
function closeModal() {
  if (!modalRoot) return;
  modalRoot.classList.remove('open');
  modalRoot.innerHTML = '';
  document.body.style.overflow = '';
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  lastFocus = null;
}
function markField(form, name, message) {
  if (!form) return;
  const input = form.elements.namedItem ? form.elements.namedItem(name) : null;
  if (!input || !input.closest) return;
  const field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('invalid', Boolean(message));
  const err = field.querySelector('.field-error');
  if (err) err.textContent = message || '';
}
function clearFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('.field.invalid').forEach((f) => f.classList.remove('invalid'));
  form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && /^(0|62|8)/.test(digits);
}

/* ---------- chrome / navigasi ---------- */
const view = document.getElementById('view');

function updateChrome(nav) {
  const profile = state.profile;
  const avatar = document.getElementById('topAvatar');
  const business = document.getElementById('topBusinessName');
  const role = document.getElementById('topRole');
  const count = document.getElementById('wishCount');
  if (avatar) avatar.innerHTML = profile.avatar ? `<img src="${esc(profile.avatar)}" alt="">` : esc(initialsOf(profile.owner));
  if (business) business.textContent = profile.business;
  if (role) role.textContent = 'Akun Pembeli UMKM';
  if (count) count.textContent = String(state.wishlist.length);
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === nav);
  });
}
function syncWishlistButtons() {
  document.querySelectorAll('[data-action="wishlist"]').forEach((btn) => {
    const active = state.wishlist.includes(btn.dataset.id);
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
    if (btn.classList.contains('fav-btn')) {
      btn.innerHTML = active ? HEART_FILLED : HEART_ICON;
      btn.setAttribute('aria-label', active ? 'Hapus dari wishlist' : 'Simpan ke wishlist');
      return;
    }
    const label = btn.querySelector('.wish-label');
    if (label) {
      const icon = btn.querySelector('svg');
      if (icon) icon.outerHTML = active ? HEART_FILLED : HEART_ICON;
      label.textContent = active ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist';
    }
  });
}
function rootOf() {
  const [path] = (location.hash || '#/beranda').replace(/^#\/?/, '').split('?');
  return path.split('/').filter(Boolean)[0] || 'beranda';
}
function go(hash) {
  closeModal();
  if (location.hash === hash) renderCurrent(false);
  else location.hash = hash;
}
function openSidebar() {
  document.body.classList.add('sidebar-open');
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.hidden = false;
  const btn = document.getElementById('menuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.hidden = true;
  const btn = document.getElementById('menuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* ---------- routing ---------- */
const PAGE_TITLES = {
  beranda: 'Beranda',
  produk: 'Produk Grosir',
  grup: 'Pembelian Bersama',
  gabung: 'Gabung Grup',
  wishlist: 'Wishlist',
  pesanan: 'Pesanan Saya',
  pembayaran: 'Pembayaran',
  profil: 'Profil UMKM',
  bantuan: 'Pusat Bantuan'
};

function renderCurrent(scroll = true) {
  const raw = (location.hash || '#/beranda').replace(/^#/, '');
  const [pathPart, queryPart] = raw.split('?');
  const seg = pathPart.split('/').filter(Boolean);
  const root = seg[0] || 'beranda';
  const id = seg[1] ? decodeURIComponent(seg[1]) : '';
  const id2 = seg[2] ? decodeURIComponent(seg[2]) : '';

  if (root !== 'profil') profileEditing = false;
  if (root === 'pembayaran' && id && id !== 'berhasil' && paymentUI.orderId !== id) {
    paymentUI = { orderId: id, method: 'Transfer Bank' };
  }

  let nav = root;
  let html = '';

  if (root === 'beranda') html = homeView();
  else if (root === 'produk') html = id ? productDetailView(id) : catalogView();
  else if (root === 'grup') { nav = 'grup'; html = id === 'baru' ? createGroupView() : groupsView(); }
  else if (root === 'gabung') { nav = 'produk'; html = joinView(id); }
  else if (root === 'wishlist') html = wishlistView();
  else if (root === 'pesanan') html = id ? orderDetailView(id) : ordersView();
  else if (root === 'pembayaran') {
    nav = 'pesanan';
    html = id === 'berhasil' ? paymentSuccessView(id2) : paymentView(id);
  } else if (root === 'profil') html = profileView();
  else if (root === 'bantuan') html = helpView();
  else html = notFoundView('Halaman tidak ditemukan', 'Halaman yang Anda tuju tidak tersedia pada prototype ini.', '#/beranda', 'Kembali ke Beranda');

  view.innerHTML = html;
  document.title = buildTitle(root, id, id2);
  updateChrome(nav);
  bindCurrent(root, id);
  syncWishlistButtons();
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
  closeSidebar();
}
function buildTitle(root, id, id2) {
  if (root === 'produk' && id) {
    const p = findItem(id);
    if (p) return p.name + ' | BulkBuy';
  }
  if (root === 'pesanan' && id) return 'Detail Pesanan #' + id + ' | BulkBuy';
  if (root === 'pembayaran' && id === 'berhasil') return 'Pembayaran Berhasil | BulkBuy';
  return (PAGE_TITLES[root] || 'BulkBuy') + ' | BulkBuy';
}
function bindCurrent(root, id) {
  if (root === 'produk') {
    if (id) bindProductDetail(id);
    else bindCatalog();
  } else if (root === 'grup') {
    if (id === 'baru') bindCreateGroup();
    else bindGroups();
  } else if (root === 'gabung') bindJoin(id);
  else if (root === 'wishlist') bindWishlist();
  else if (root === 'pesanan') {
    if (id) { /* tidak ada form */ } else bindOrders();
  } else if (root === 'pembayaran') {
    if (id !== 'berhasil') bindPayment(id);
  } else if (root === 'profil') bindProfile();
  else if (root === 'bantuan') bindHelp();
}

/* ---------- binder: katalog ---------- */
function updateCatalogUI() {
  const grid = document.getElementById('catalogGrid');
  if (grid) grid.innerHTML = catalogGridHTML();
  const result = document.getElementById('catalogResult');
  if (result) {
    const count = filteredProducts().length;
    result.innerHTML = `<b>${count}</b> produk ditemukan${activeCatalogFilters() ? ' · filter aktif' : ''}`;
  }
  document.querySelectorAll('[data-action="catalog-cat"]').forEach((chip) => {
    const value = chip.dataset.cat === 'Semua' ? '' : chip.dataset.cat;
    chip.classList.toggle('active', catalogFilters.category === value);
  });
  syncWishlistButtons();
}
function bindCatalog() {
  const search = document.getElementById('catSearch');
  if (search) search.addEventListener('input', () => { catalogFilters.q = search.value; updateCatalogUI(); });
  const bindSelect = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { catalogFilters[key] = el.value; updateCatalogUI(); });
  };
  bindSelect('catSupplier', 'supplier');
  bindSelect('catPrice', 'price');
  bindSelect('catStatus', 'status');
  bindSelect('catSort', 'sort');
}
function resetCatalogFilters() {
  Object.assign(catalogFilters, { q: '', category: '', supplier: '', price: 'all', status: 'all', sort: 'default' });
}

/* ---------- binder: detail produk ---------- */
function bindProductDetail(id) {
  const p = findItem(id);
  if (!p) return;
  const input = document.getElementById('detailQty');
  const summary = document.getElementById('detailSummary');
  const joinBtn = document.getElementById('detailJoin');
  if (!input || !summary) return;

  const update = () => {
    let qty = parseInt(input.value, 10);
    if (!Number.isFinite(qty)) qty = 1;
    qty = Math.max(1, Math.min(9999, qty));
    input.value = String(qty);
    joinIntent = { id: p.id, qty };
    const subtotal = p.price * qty;
    const saving = (p.retailPrice ? Math.max(0, p.retailPrice - p.price) : 0) * qty;
    summary.innerHTML = `
      <div class="summary-row"><span>Harga per ${esc(p.unit)}</span><b>${rp(p.price)}</b></div>
      <div class="summary-row"><span>Jumlah pesanan</span><b>${qty} ${esc(p.unit)}</b></div>
      ${saving > 0 ? `<div class="summary-row"><span>Potensi penghematan</span><b>${rp(saving)}</b></div>` : ''}
      <div class="summary-total"><span>Estimasi subtotal</span><b>${rp(subtotal)}</b></div>
      <div class="field-hint">Belum termasuk biaya pengiriman. Pembayaran dilakukan setelah grup mencapai target.</div>`;
    if (joinBtn) joinBtn.href = '#/gabung/' + encodeURIComponent(p.id);
  };

  const minus = document.getElementById('detailMinus');
  const plus = document.getElementById('detailPlus');
  if (minus) minus.addEventListener('click', () => {
    input.value = String(Math.max(1, (parseInt(input.value, 10) || 1) - 1));
    update();
  });
  if (plus) plus.addEventListener('click', () => {
    input.value = String(Math.min(9999, (parseInt(input.value, 10) || 1) + 1));
    update();
  });
  input.addEventListener('input', update);
  input.addEventListener('change', update);

  if (joinIntent.id === p.id && joinIntent.qty > 1) input.value = String(joinIntent.qty);
  update();
}

/* ---------- binder: grup ---------- */
function updateGroupsUI() {
  const container = document.getElementById('groupsResults');
  if (container) container.innerHTML = groupsResultsHTML();
}
function bindGroups() {
  const search = document.getElementById('groupSearch');
  if (search) search.addEventListener('input', () => { groupFilters.q = search.value; updateGroupsUI(); });
  const bindSelect = (elId, key) => {
    const el = document.getElementById(elId);
    if (el) el.addEventListener('change', () => { groupFilters[key] = el.value; updateGroupsUI(); });
  };
  bindSelect('groupStatus', 'status');
  bindSelect('groupCategory', 'category');
  bindSelect('groupSort', 'sort');
}
function resetGroupFilters() {
  Object.assign(groupFilters, { q: '', status: 'all', category: '', sort: 'popular' });
}

/* ---------- binder: buat grup ---------- */
function createSummaryHTML(form) {
  const data = new FormData(form);
  const num = (key) => parseInt(data.get(key), 10);
  const price = Number(data.get('price'));
  const own = num('ownQty');
  const target = num('target');
  const deadline = String(data.get('deadline') || '');
  const category = String(data.get('category') || '');
  const ownSafe = Number.isFinite(own) ? own : 0;
  const targetSafe = Number.isFinite(target) ? target : 0;
  const priceSafe = Number.isFinite(price) ? price : 0;
  const remaining = Math.max(0, targetSafe - ownSafe);

  return `
    <div class="summary-row"><span>Kategori</span><b>${esc(category || '-')}</b></div>
    <div class="summary-row"><span>Target total grup</span><b>${targetSafe} unit</b></div>
    <div class="summary-row"><span>Kebutuhan pribadi</span><b>${ownSafe} unit</b></div>
    <div class="summary-row"><span>Sisa menuju target</span><b>${remaining} unit</b></div>
    <div class="summary-row"><span>Batas waktu</span><b>${deadline ? fmtDate(deadline) : '-'}</b></div>
    <div class="summary-row"><span>Estimasi nilai grup</span><b>${rp(priceSafe * targetSafe)}</b></div>
    <div class="summary-total"><span>Estimasi biaya Anda</span><b>${rp(priceSafe * ownSafe)}</b></div>`;
}
function bindCreateGroup() {
  const form = document.getElementById('createGroupForm');
  if (!form) return;
  const summary = document.getElementById('createSummary');
  const update = () => { if (summary) summary.innerHTML = createSummaryHTML(form); };
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('invalid');
    update();
  });
  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const value = (name) => String(form.elements[name] ? form.elements[name].value : '').trim();
    const own = parseInt(value('ownQty'), 10);
    const target = parseInt(value('target'), 10);
    const price = parseInt(value('price'), 10);
    const deadline = value('deadline');
    let valid = true;
    const fail = (name, message) => { markField(form, name, message); valid = false; };

    if (value('product').length < 3) fail('product', 'Nama produk minimal 3 karakter.');
    if (!value('category')) fail('category', 'Pilih kategori produk.');
    if (!Number.isFinite(own) || own < 1) fail('ownQty', 'Jumlah kebutuhan minimal 1.');
    if (!Number.isFinite(target) || target < 1) fail('target', 'Target grup minimal 1.');
    else if (Number.isFinite(own) && target < own) fail('target', 'Target grup harus sama atau lebih besar dari kebutuhan pribadi.');
    if (!Number.isFinite(price) || price < 1) fail('price', 'Harga estimasi harus lebih dari 0.');
    if (!deadline) fail('deadline', 'Batas waktu wajib diisi.');
    else if (deadline < TODAY_ISO) fail('deadline', 'Batas waktu tidak boleh sebelum hari ini.');
    if (!value('location')) fail('location', 'Lokasi pengiriman wajib diisi.');

    if (!valid) {
      toast('Periksa kembali isian yang ditandai.', 'error');
      const first = form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea');
      if (first) first.focus();
      return;
    }

    const group = {
      id: 'g' + Date.now(),
      name: value('product'),
      emoji: D.categoryEmoji[value('category')] || '📦',
      category: value('category'),
      supplier: value('supplier') || 'Supplier belum ditentukan',
      price,
      retailPrice: null,
      unit: 'unit',
      target,
      collected: own,
      deadline,
      description: value('description') || 'Grup pembelian bersama untuk kebutuhan usaha.',
      specs: {
        'Kebutuhan': value('description') || '-',
        'Target grup': target + ' unit',
        'Kebutuhan pembuat grup': own + ' unit',
        'Lokasi pengiriman': value('location'),
        'Catatan tambahan': value('notes') || '-'
      },
      shipping: 'Pengiriman diatur bersama peserta grup setelah target tercapai.',
      location: value('location'),
      isCustom: true,
      owner: state.profile.business,
      createdAt: TODAY_ISO
    };

    state.customGroups.push(group);
    state.draft = null;
    saveState();
    toast('Grup pembelian berhasil dibuat (simulasi).', 'success');
    form.reset();
    update();
    openModal(`
      <div class="modal-head"><h3>Grup berhasil dibuat 🎉</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
      <div class="modal-body">
        <div class="modal-icon" aria-hidden="true">✓</div>
        <div class="modal-product"><div class="order-thumb" aria-hidden="true">${group.emoji}</div><div><h4>${esc(group.name)}</h4><p>${esc(group.category)} · ${esc(group.supplier)}</p></div></div>
        <div class="summary-box" style="margin-top:6px">
          <div class="summary-row"><span>Target grup</span><b>${group.target} unit</b></div>
          <div class="summary-row"><span>Kebutuhan Anda</span><b>${group.collected} unit</b></div>
          <div class="summary-row"><span>Harga estimasi</span><b>${rp(group.price)} / unit</b></div>
          <div class="summary-row"><span>Batas waktu</span><b>${fmtDate(group.deadline)}</b></div>
          <div class="summary-total"><span>Estimasi nilai grup</span><b>${rp(group.price * group.target)}</b></div>
        </div>
        <p class="muted" style="margin-top:10px">Grup Anda sudah tampil di halaman Pembelian Bersama dan dapat diikuti UMKM lain.</p>
      </div>
      <div class="modal-actions">
        <a class="btn btn-outline" href="#/grup" data-close>Kembali ke Pembelian Bersama</a>
        <a class="btn" href="#/produk/${encodeURIComponent(group.id)}" data-close>Lihat Detail Grup</a>
      </div>`, 'Grup berhasil dibuat');
  });
}
function saveDraft() {
  const form = document.getElementById('createGroupForm');
  if (!form) return;
  const data = {};
  new FormData(form).forEach((value, key) => { data[key] = String(value); });
  state.draft = data;
  saveState();
  toast('Draft pembelian bersama berhasil disimpan.', 'success');
}

/* ---------- binder: gabung ---------- */
function bindJoin(id) {
  const p = findItem(id);
  if (!p) return;
  const input = document.getElementById('joinQty');
  const summary = document.getElementById('joinSummary');
  const errorBox = document.getElementById('joinError');
  const confirm = document.getElementById('joinConfirm');
  if (!input || !summary || !confirm) return;

  const showError = (message) => {
    if (!errorBox) return;
    errorBox.hidden = !message;
    errorBox.textContent = message || '';
  };
  const update = () => {
    let qty = parseInt(input.value, 10);
    if (!Number.isFinite(qty)) qty = 1;
    qty = Math.max(1, Math.min(9999, qty));
    input.value = String(qty);
    const subtotal = p.price * qty;
    summary.innerHTML = `
      <div class="summary-row"><span>Harga per ${esc(p.unit)}</span><b>${rp(p.price)}</b></div>
      <div class="summary-row"><span>Jumlah pesanan Anda</span><b>${qty} ${esc(p.unit)}</b></div>
      <div class="summary-row"><span>Digabungkan dengan grup</span><b>${p.collected} ${esc(p.unit)}</b></div>
      <div class="summary-total"><span>Estimasi subtotal</span><b>${rp(subtotal)}</b></div>
      <div class="field-hint">Biaya pengiriman dan layanan dihitung pada halaman pembayaran setelah target grup tercapai.</div>`;
    showError('');
  };

  const minus = document.getElementById('joinMinus');
  const plus = document.getElementById('joinPlus');
  if (minus) minus.addEventListener('click', () => { input.value = String(Math.max(1, (parseInt(input.value, 10) || 1) - 1)); update(); });
  if (plus) plus.addEventListener('click', () => { input.value = String(Math.min(9999, (parseInt(input.value, 10) || 1) + 1)); update(); });
  input.addEventListener('input', update);
  input.addEventListener('change', update);
  update();

  confirm.addEventListener('click', () => {
    const qty = parseInt(input.value, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      showError('Jumlah pesanan minimal 1 ' + p.unit + '.');
      input.focus();
      return;
    }
    if (qty > 9999) {
      showError('Jumlah pesanan terlalu besar. Maksimal 9.999 ' + p.unit + '.');
      return;
    }
    if (deadlineInfo(p.deadline).ended) {
      showError('Grup sudah berakhir dan tidak dapat diikuti.');
      return;
    }
    const duplicate = state.orders.find((o) => o.productId === p.id && ['target', 'payment', 'process', 'shipped'].includes(o.status));
    if (duplicate) {
      showError('Anda sudah bergabung di grup ini. Buka detail pesanan #' + duplicate.id + '.');
      return;
    }

    p.collected = Number(p.collected) + qty;
    const reached = isReached(p);
    const order = {
      id: nextOrderId(),
      productId: p.id,
      qty,
      status: reached ? 'payment' : 'target',
      date: TODAY_ISO,
      unitPrice: p.price,
      groupTarget: p.target,
      groupCollected: p.collected,
      groupDeadline: p.deadline,
      shipping: 25000,
      fee: 2500
    };
    state.orders.unshift(order);
    flashOrderId = order.id;
    saveState();
    joinIntent = { id: null, qty: 1 };
    toast('Berhasil bergabung dengan grup pembelian!', 'success');

    openModal(`
      <div class="modal-head"><h3>Berhasil bergabung! 🎉</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
      <div class="modal-body">
        <div class="modal-icon" aria-hidden="true">✓</div>
        <div class="modal-product"><div class="order-thumb" aria-hidden="true">${p.emoji || '📦'}</div><div><h4>${esc(p.name)}</h4><p>${esc(p.supplier)}</p></div></div>
        <div class="summary-box" style="margin-top:6px">
          <div class="summary-row"><span>Jumlah pesanan</span><b>${qty} ${esc(p.unit)}</b></div>
          <div class="summary-row"><span>Harga per satuan</span><b>${rp(p.price)}</b></div>
          <div class="summary-row"><span>Estimasi subtotal</span><b>${rp(p.price * qty)}</b></div>
          <div class="summary-row"><span>Status pesanan</span><b>${reached ? 'Menunggu Pembayaran' : 'Menunggu Target'}</b></div>
          <div class="summary-total"><span>Progres grup</span><b>${p.collected} / ${p.target} ${esc(p.unit)}</b></div>
        </div>
        <p class="muted" style="margin-top:10px">${reached ? 'Target grup telah tercapai. Lanjutkan pembayaran dari detail pesanan agar supplier dapat memproses pesanan.' : 'Pesanan Anda sudah digabungkan dengan peserta lain. Kami akan memberi tahu ketika target grup tercapai.'}</p>
      </div>
      <div class="modal-actions">
        <a class="btn btn-outline" href="#/produk/${encodeURIComponent(p.id)}" data-close>Kembali ke Produk</a>
        <a class="btn" href="#/pesanan" data-close>Lihat Pesanan Saya</a>
      </div>`, 'Berhasil bergabung dengan grup');
  });
}

/* ---------- binder: wishlist ---------- */
function updateWishlistUI() {
  const container = document.getElementById('wishlistResults');
  if (container) container.innerHTML = wishlistResultsHTML();
  syncWishlistButtons();
}
function bindWishlist() {
  const search = document.getElementById('wishSearch');
  if (search) search.addEventListener('input', () => { wishlistFilters.q = search.value; updateWishlistUI(); });
  const category = document.getElementById('wishCategory');
  if (category) category.addEventListener('change', () => { wishlistFilters.category = category.value; updateWishlistUI(); });
  const status = document.getElementById('wishStatus');
  if (status) status.addEventListener('change', () => { wishlistFilters.status = status.value; updateWishlistUI(); });
}
function resetWishlistFilters() {
  Object.assign(wishlistFilters, { q: '', category: '', status: 'all' });
}
function toggleWishlist(id) {
  if (!findItem(id)) return;
  const exists = state.wishlist.includes(id);
  state.wishlist = exists ? state.wishlist.filter((x) => x !== id) : [...state.wishlist, id];
  saveState();
  updateChrome(rootNav());
  syncWishlistButtons();
  toast(exists ? 'Produk dihapus dari wishlist.' : 'Produk ditambahkan ke wishlist.', exists ? '' : 'success');
  if (rootOf() === 'wishlist') renderCurrent(false);
}
function removeWishlist(id) {
  if (!state.wishlist.includes(id)) return;
  state.wishlist = state.wishlist.filter((x) => x !== id);
  saveState();
  updateChrome(rootNav());
  toast('Produk dihapus dari wishlist.');
  renderCurrent(false);
}
function rootNav() {
  const root = rootOf();
  if (root === 'gabung') return 'produk';
  if (root === 'pembayaran') return 'pesanan';
  return root;
}

/* ---------- binder: pesanan ---------- */
function updateOrdersUI() {
  const list = document.getElementById('ordersList');
  if (list) list.innerHTML = ordersListHTML();
  document.querySelectorAll('[data-action="order-tab"]').forEach((tab) => {
    const active = tab.dataset.tab === orderFilters.tab;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  syncWishlistButtons();
}
function bindOrders() {
  const search = document.getElementById('orderSearch');
  if (search) search.addEventListener('input', () => { orderFilters.q = search.value; updateOrdersUI(); });
  flashOrderId = null;
}

/* ---------- binder: pembayaran ---------- */
function applyPaymentMethodUI(order) {
  document.querySelectorAll('.pay-method').forEach((label) => {
    const radio = label.querySelector('input[type="radio"]');
    label.classList.toggle('selected', Boolean(radio && radio.checked));
  });
  const detail = document.getElementById('payDetail');
  if (detail) detail.innerHTML = paymentDetailHTML(paymentUI.method, order);
}
function doPayment(order) {
  const totals = orderTotals(order);
  order.shipping = totals.shipping;
  order.fee = totals.fee;
  order.status = 'process';
  order.payment = {
    method: paymentUI.method,
    trx: 'TRX-20261124-' + String(order.id).replace(/\D/g, ''),
    date: TODAY_ISO,
    total: totals.total
  };
  saveState();
  toast('Pembayaran berhasil disimulasikan.', 'success');
  go('#/pembayaran/berhasil/' + encodeURIComponent(order.id));
}
function bindPayment(id) {
  const order = findOrder(id);
  if (!order || order.status !== 'payment') return;

  document.querySelectorAll('input[name="payMethod"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      paymentUI.method = radio.value;
      applyPaymentMethodUI(order);
    });
  });

  const payBtn = document.getElementById('payNow');
  if (payBtn) payBtn.addEventListener('click', () => {
    if (payBtn.dataset.busy === '1') return;
    payBtn.dataset.busy = '1';
    payBtn.disabled = true;
    payBtn.textContent = 'Memproses pembayaran...';
    setTimeout(() => doPayment(order), 750);
  });
}

/* ---------- binder: profil ---------- */
function resetProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;
  ['business', 'type', 'owner', 'phone', 'email', 'city', 'address', 'description'].forEach((key) => {
    if (form.elements[key]) form.elements[key].value = state.profile[key] || '';
  });
  clearFieldErrors(form);
  toast('Form dikembalikan ke data tersimpan.');
}
function bindProfile() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const value = (name) => String(form.elements[name] ? form.elements[name].value : '').trim();
    let valid = true;
    const fail = (name, message) => { markField(form, name, message); valid = false; };

    if (!value('business')) fail('business', 'Nama UMKM wajib diisi.');
    if (!value('owner')) fail('owner', 'Nama pemilik wajib diisi.');
    if (!validPhone(value('phone'))) fail('phone', 'Nomor telepon tidak valid. Contoh: 0812-3456-7890.');
    if (!EMAIL_RE.test(value('email'))) fail('email', 'Format email tidak valid. Contoh: nama@email.com.');
    if (!value('city')) fail('city', 'Kota wajib diisi.');
    if (!value('address')) fail('address', 'Alamat usaha wajib diisi.');
    if (value('description').length > 300) fail('description', 'Deskripsi maksimal 300 karakter.');

    if (!valid) {
      toast('Periksa kembali data profil Anda.', 'error');
      const first = form.querySelector('.field.invalid input, .field.invalid textarea');
      if (first) first.focus();
      return;
    }

    state.profile = {
      ...state.profile,
      business: value('business'),
      type: value('type'),
      owner: value('owner'),
      phone: value('phone'),
      email: value('email'),
      city: value('city'),
      address: value('address'),
      description: value('description')
    };
    profileEditing = false;
    saveState();
    updateChrome('profil');
    renderCurrent(false);
    toast('Perubahan profil berhasil disimpan.', 'success');
  });

  const upload = document.getElementById('avatarInput');
  if (upload) upload.addEventListener('change', () => {
    const file = upload.files && upload.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast('Pilih file gambar (JPG, PNG, atau WEBP).', 'error');
      upload.value = '';
      return;
    }
    if (file.size > 800 * 1024) {
      toast('Ukuran foto maksimal 800 KB.', 'error');
      upload.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.profile.avatar = String(reader.result || '');
      saveState();
      updateChrome('profil');
      renderCurrent(false);
      toast('Foto profil berhasil diperbarui.', 'success');
    };
    reader.readAsDataURL(file);
  });
}
function openPasswordModal() {
  openModal(`
    <div class="modal-head"><h3>Ubah Kata Sandi</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
    <form id="passwordForm" novalidate>
      <div class="modal-body">
        <div class="field"><label for="pwCurrent">Kata sandi saat ini</label><input id="pwCurrent" name="current" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi saat ini"><span class="field-error"></span></div>
        <div class="field" style="margin-top:10px"><label for="pwNew">Kata sandi baru</label><input id="pwNew" name="next" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter"><span class="field-error"></span></div>
        <div class="field" style="margin-top:10px"><label for="pwConfirm">Konfirmasi kata sandi baru</label><input id="pwConfirm" name="confirm" type="password" autocomplete="new-password" placeholder="Ulangi kata sandi baru"><span class="field-error"></span></div>
        <div class="notice" style="margin-top:12px">Simulasi prototype — kata sandi tidak benar-benar diubah.</div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" type="button" data-close>Batal</button>
        <button class="btn" type="submit">Simpan Kata Sandi</button>
      </div>
    </form>`, 'Ubah kata sandi');

  const form = document.getElementById('passwordForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const current = String(form.elements.current.value || '');
    const next = String(form.elements.next.value || '');
    const confirm = String(form.elements.confirm.value || '');
    let valid = true;
    const fail = (name, message) => { markField(form, name, message); valid = false; };
    if (!current) fail('current', 'Kata sandi saat ini wajib diisi.');
    if (next.length < 8) fail('next', 'Kata sandi baru minimal 8 karakter.');
    if (!confirm) fail('confirm', 'Konfirmasi kata sandi wajib diisi.');
    else if (next && confirm !== next) fail('confirm', 'Konfirmasi kata sandi tidak sama.');
    if (next && current && next === current) fail('next', 'Kata sandi baru harus berbeda dari kata sandi saat ini.');
    if (!valid) return;
    closeModal();
    toast('Kata sandi berhasil diubah (simulasi).', 'success');
  });
}
function openLogoutModal() {
  openModal(`
    <div class="modal-head"><h3>Keluar dari akun?</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
    <div class="modal-body"><p>Anda akan keluar dari akun <b>${esc(state.profile.business)}</b>. Data prototype tetap tersimpan di perangkat ini.</p></div>
    <div class="modal-actions">
      <button class="btn btn-outline" type="button" data-close>Batal</button>
      <button class="btn btn-danger" type="button" data-action="logout-confirm">Ya, Keluar</button>
    </div>`, 'Konfirmasi keluar');
}

/* ---------- binder: pesanan detail ---------- */
function openReceiveModal(id) {
  const order = findOrder(id);
  if (!order) return;
  openModal(`
    <div class="modal-head"><h3>Konfirmasi pesanan diterima</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
    <div class="modal-body">
      <p>Pastikan pesanan <b>#${esc(order.id)}</b> — ${esc(orderProduct(order).name)} sudah diterima dalam kondisi baik.</p>
      <div class="notice">Setelah dikonfirmasi, status pesanan akan berubah menjadi <b>Selesai</b>.</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" type="button" data-close>Nanti Saja</button>
      <button class="btn" type="button" data-action="receive-confirm" data-id="${esc(order.id)}">Ya, Pesanan Diterima</button>
    </div>`, 'Konfirmasi pesanan diterima');
}
function confirmReceive(id) {
  const order = findOrder(id);
  if (!order) return;
  order.status = 'done';
  order.completedDate = TODAY_ISO;
  saveState();
  closeModal();
  toast('Pesanan ditandai diterima. Terima kasih!', 'success');
  renderCurrent(false);
}
function scrollToShipping() {
  const el = document.getElementById('shippingInfo');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'box-shadow .3s';
    el.style.boxShadow = '0 0 0 3px rgba(22,128,79,.18)';
    setTimeout(() => { el.style.boxShadow = ''; }, 1600);
  }
}

/* ---------- binder: bantuan ---------- */
function updateHelpUI() {
  const list = document.getElementById('faqList');
  if (list) list.innerHTML = helpFaqHTML();
  const count = document.getElementById('faqCount');
  if (count) count.textContent = filteredFaqs().length + ' pertanyaan';
  document.querySelectorAll('[data-action="help-cat"]').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.cat === helpFilters.category);
  });
}
function bindHelp() {
  const search = document.getElementById('helpSearch');
  if (search) search.addEventListener('input', () => { helpFilters.q = search.value; updateHelpUI(); });

  const form = document.getElementById('helpContactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const value = (name) => String(form.elements[name] ? form.elements[name].value : '').trim();
    let valid = true;
    const fail = (name, message) => { markField(form, name, message); valid = false; };
    if (value('name').length < 2) fail('name', 'Nama minimal 2 karakter.');
    if (!EMAIL_RE.test(value('email'))) fail('email', 'Format email tidak valid.');
    if (!value('category')) fail('category', 'Pilih kategori kendala.');
    if (value('message').length < 10) fail('message', 'Deskripsi masalah minimal 10 karakter.');
    if (!valid) {
      toast('Periksa kembali formulir bantuan Anda.', 'error');
      return;
    }
    form.reset();
    clearFieldErrors(form);
    toast('Pesan berhasil dikirim. Tim support akan menghubungi Anda (simulasi).', 'success');
  });
}

/* ---------- modal pembayaran ---------- */
function openMethodModal(orderId) {
  openModal(`
    <div class="modal-head"><h3>Ganti Metode Pembayaran</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
    <div class="modal-body">
      <div class="pay-methods">
        ${PAY_METHODS.map((m) => `<label class="pay-method ${paymentUI.method === m.name ? 'selected' : ''}">
          <input type="radio" name="modalMethod" value="${esc(m.name)}" ${paymentUI.method === m.name ? 'checked' : ''}>
          <span class="pm-info"><b>${esc(m.name)}</b><small>${esc(m.sub)}</small></span>
          <span class="pm-logo" aria-hidden="true">${m.icon}</span>
        </label>`).join('')}
      </div>
      <div class="notice" style="margin-top:12px">Instruksi pembayaran akan diperbarui sesuai metode yang dipilih.</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" type="button" data-close>Batal</button>
      <button class="btn" type="button" data-action="apply-method" data-order="${esc(orderId)}">Gunakan Metode Ini</button>
    </div>`, 'Ganti metode pembayaran');
}
function applyModalMethod() {
  const checked = document.querySelector('input[name="modalMethod"]:checked');
  if (!checked) return;
  paymentUI.method = checked.value;
  closeModal();
  toast('Metode pembayaran diubah ke ' + checked.value + '.', 'success');
  renderCurrent(false);
}
function openWhatsappModal() {
  openModal(`
    <div class="modal-head"><h3>WhatsApp Customer Support</h3><button class="modal-close" type="button" data-close aria-label="Tutup">×</button></div>
    <div class="modal-body">
      <div class="modal-icon" aria-hidden="true">💬</div>
      <p>Hubungi tim BulkBuy melalui WhatsApp pada hari kerja <b>08.00–17.00 WIB</b>.</p>
      <div class="notice" style="text-align:center;font-size:15px"><b>+62 812-0000-8888</b></div>
      <p class="muted" style="margin-top:10px">Nomor ini hanya simulasi prototype dan tidak terhubung ke WhatsApp sungguhan.</p>
    </div>
    <div class="modal-actions"><button class="btn" type="button" data-close>Mengerti</button></div>`, 'WhatsApp customer support');
}
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('Nomor berhasil disalin.', 'success')).catch(() => toast('Nomor: ' + text));
  } else {
    toast('Nomor: ' + text);
  }
}

/* ---------- aksi terpusat ---------- */
function handleAction(action, el) {
  switch (action) {
    case 'pick-category':
      resetCatalogFilters();
      catalogFilters.category = el.dataset.category === 'Semua' ? '' : el.dataset.category;
      go('#/produk');
      break;
    case 'catalog-cat':
      catalogFilters.category = el.dataset.cat === 'Semua' ? '' : el.dataset.cat;
      updateCatalogUI();
      break;
    case 'wishlist':
      toggleWishlist(el.dataset.id);
      break;
    case 'remove-wishlist':
      removeWishlist(el.dataset.id);
      break;
    case 'reset-catalog':
      resetCatalogFilters();
      renderCurrent(false);
      break;
    case 'reset-groups':
      resetGroupFilters();
      renderCurrent(false);
      break;
    case 'reset-wishlist':
      resetWishlistFilters();
      renderCurrent(false);
      break;
    case 'reset-orders':
      orderFilters.q = '';
      orderFilters.tab = 'all';
      renderCurrent(false);
      break;
    case 'reset-help':
      helpFilters.q = '';
      helpFilters.category = 'all';
      renderCurrent(false);
      break;
    case 'order-tab':
      orderFilters.tab = el.dataset.tab;
      updateOrdersUI();
      break;
    case 'help-cat':
      helpFilters.category = el.dataset.cat;
      updateHelpUI();
      break;
    case 'profile-edit':
      profileEditing = true;
      renderCurrent(false);
      break;
    case 'profile-reset':
      resetProfileForm();
      break;
    case 'remove-avatar':
      state.profile.avatar = '';
      saveState();
      updateChrome('profil');
      renderCurrent(false);
      toast('Foto profil dihapus.');
      break;
    case 'change-password':
      openPasswordModal();
      break;
    case 'logout':
      openLogoutModal();
      break;
    case 'logout-confirm':
      closeModal();
      toast('Anda telah keluar dari akun (simulasi).', 'success');
      break;
    case 'receive':
      openReceiveModal(el.dataset.id);
      break;
    case 'receive-confirm':
      confirmReceive(el.dataset.id);
      break;
    case 'scroll-shipping':
      scrollToShipping();
      break;
    case 'view-shipping':
      go('#/pesanan/' + encodeURIComponent(el.dataset.id));
      setTimeout(scrollToShipping, 160);
      break;
    case 'save-draft':
      saveDraft();
      break;
    case 'discard-draft':
      state.draft = null;
      saveState();
      renderCurrent(false);
      toast('Draft dihapus.');
      break;
    case 'open-methods':
      openMethodModal(el.dataset.order);
      break;
    case 'apply-method':
      applyModalMethod();
      break;
    case 'copy-va':
      copyText(el.dataset.copy || '');
      break;
    case 'help-whatsapp':
      openWhatsappModal();
      break;
    default:
      break;
  }
}

/* ---------- event global ---------- */
function bindGlobalEvents() {
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    if (document.body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  });
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
  const accountBtn = document.getElementById('accountBtn');
  if (accountBtn) accountBtn.addEventListener('click', () => go('#/profil'));

  const searchForm = document.getElementById('globalSearch');
  const searchInput = document.getElementById('globalSearchInput');
  const clearBtn = document.getElementById('searchClear');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      catalogFilters.q = searchInput.value.trim();
      if (rootOf() === 'produk' && (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).length === 1) renderCurrent(false);
      else go('#/produk');
    });
    searchInput.addEventListener('input', () => {
      if (clearBtn) clearBtn.hidden = !searchInput.value;
    });
  }
  if (clearBtn && searchInput) clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.hidden = true;
    searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-link');
    if (navLink) closeSidebar();
    const closer = e.target.closest('[data-close]');
    if (closer) closeModal();
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) handleAction(actionEl.dataset.action, actionEl);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSidebar();
    }
  });

  window.addEventListener('hashchange', () => {
    closeModal();
    closeSidebar();
    renderCurrent(true);
  });
}

/* ---------- inisialisasi ---------- */
function init() {
  bindGlobalEvents();
  if (!location.hash) history.replaceState(null, '', '#/beranda');
  renderCurrent(true);
}

init();
