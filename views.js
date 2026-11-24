/* ==========================================================
   BulkBuy — tampilan halaman (render functions)
   ========================================================== */
'use strict';

const HEART_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.4s-7.6-4.5-7.6-10A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.6 3c0 5.5-7.6 10-7.6 10z"/></svg>';
const HEART_FILLED = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.9 10.4 19.5C5.3 15 2 12 2 8.3 2 5.4 4.3 3.2 7.2 3.2c1.7 0 3.3.8 4.8 2.5 1.5-1.7 3.1-2.5 4.8-2.5C19.7 3.2 22 5.4 22 8.3c0 3.7-3.3 6.7-8.4 11.2z"/></svg>';
const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>';

const CATEGORY_BG = {
  'Bahan Makanan': 'linear-gradient(140deg,#f4f7ec,#e8efdb)',
  'Minuman': 'linear-gradient(140deg,#eef8f4,#dcefe8)',
  'Kemasan': 'linear-gradient(140deg,#f1f6fa,#e2edf5)',
  'Sembako': 'linear-gradient(140deg,#f7f8ed,#eaf0de)',
  'Peralatan': 'linear-gradient(140deg,#f7f4ee,#ece6da)',
  'Lainnya': 'linear-gradient(140deg,#f4f6f3,#e8ede9)'
};

const ORDER_TABS = [
  ['all', 'Semua'],
  ['target', 'Menunggu Target'],
  ['payment', 'Menunggu Pembayaran'],
  ['process', 'Diproses'],
  ['shipped', 'Dikirim'],
  ['done', 'Selesai'],
  ['cancelled', 'Dibatalkan']
];

const PRICE_RANGES = [
  ['all', 'Semua harga'],
  ['lt50', 'Di bawah Rp50.000'],
  ['50to150', 'Rp50.000 – Rp150.000'],
  ['150to250', 'Rp150.000 – Rp250.000'],
  ['gt250', 'Di atas Rp250.000']
];

const GROUP_STATUS_OPTIONS = [
  ['all', 'Semua status'],
  ['running', 'Berjalan'],
  ['almost', 'Hampir penuh'],
  ['reached', 'Target tercapai'],
  ['ended', 'Ditutup']
];

const PAY_METHODS = [
  { name: 'Transfer Bank', icon: '🏦', sub: 'BCA, Mandiri, atau BNI' },
  { name: 'Virtual Account', icon: '🔢', sub: 'Nomor VA khusus pesanan' },
  { name: 'E-wallet', icon: '📱', sub: 'GoPay, OVO, atau DANA' }
];

/* ---------- komponen kecil ---------- */
function opt(value, label, current) {
  return `<option value="${esc(value)}"${String(value) === String(current) ? ' selected' : ''}>${esc(label)}</option>`;
}
function optionsOf(values, current) {
  return values.map((v) => opt(v, v, current)).join('');
}
function statCard(icon, label, value, note, tint = '') {
  return `<div class="stat-card">
    <div class="stat-top"><span class="stat-label">${esc(label)}</span><span class="stat-icon ${tint}" aria-hidden="true">${icon}</span></div>
    <span class="stat-value">${esc(value)}</span>
    <span class="stat-note">${esc(note)}</span>
  </div>`;
}
function emptyState(icon, title, text, action = '') {
  return `<div class="empty-state">
    <div class="empty-art" aria-hidden="true">${icon}</div>
    <h3>${esc(title)}</h3>
    <p>${text}</p>
    ${action}
  </div>`;
}
function progressBar(pct, extra = '') {
  return `<div class="progress ${pct >= 100 ? 'full' : pct >= 80 ? 'warn' : ''}"><span style="width:${pct}%"></span></div>`;
}
function mediaBadges(p) {
  const gs = groupState(p);
  return `<span class="badge badge-green">${p.retailPrice ? 'Harga Grosir' : 'Harga Kolektif'}</span><span class="badge ${gs.badge}">${esc(gs.badgeText)}</span>`;
}

/* ---------- kartu produk ---------- */
function productCard(p) {
  const pct = progressPct(p);
  const dl = deadlineInfo(p.deadline);
  const gs = groupState(p);
  const wished = state.wishlist.includes(p.id);
  const saving = p.retailPrice ? Math.max(0, p.retailPrice - p.price) : 0;
  return `<article class="product-card">
    <div class="product-media" style="background:${CATEGORY_BG[p.category] || CATEGORY_BG['Lainnya']}">
      <span class="media-emoji" aria-hidden="true">${p.emoji || '📦'}</span>
      <div class="media-badges">${mediaBadges(p)}</div>
      <button class="fav-btn ${wished ? 'is-active' : ''}" type="button" data-action="wishlist" data-id="${esc(p.id)}" aria-label="${wished ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}" aria-pressed="${wished}">${wished ? HEART_FILLED : HEART_ICON}</button>
    </div>
    <div class="product-body">
      <div class="product-meta">${esc(p.category)} · ${esc(p.supplier)}</div>
      <h3 class="product-title"><a href="#/produk/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
      <p class="supplier-line">MOQ grup ${p.target} ${esc(p.unit)} · ${p.collected} terkumpul</p>
      <div class="price-row">
        <div class="price">${rp(p.price)} <small>/ ${esc(p.unit)}</small></div>
        <div class="moq">${saving > 0 ? `Hemat<br><b>${rp(saving)}</b>` : `Satuan<br><b>${esc(p.unit)}</b>`}</div>
      </div>
      ${progressBar(pct)}
      <div class="progress-labels"><span>${p.collected} ${esc(p.unit)} terkumpul</span><span><b>${pct}%</b></span></div>
      <div class="card-actions">
        <a class="btn btn-sm" href="#/gabung/${encodeURIComponent(p.id)}">Gabung Grup</a>
        <a class="btn btn-outline btn-sm" href="#/produk/${encodeURIComponent(p.id)}">Detail Produk</a>
      </div>
      <div class="product-footnote">⏱ ${esc(dl.label)} · ${esc(gs.label)}</div>
    </div>
  </article>`;
}

function wishlistCard(p) {
  const pct = progressPct(p);
  const gs = groupState(p);
  const dl = deadlineInfo(p.deadline);
  return `<article class="product-card">
    <div class="product-media" style="background:${CATEGORY_BG[p.category] || CATEGORY_BG['Lainnya']}">
      <span class="media-emoji" aria-hidden="true">${p.emoji || '📦'}</span>
      <div class="media-badges">${mediaBadges(p)}</div>
      <button class="fav-btn is-active" type="button" data-action="remove-wishlist" data-id="${esc(p.id)}" aria-label="Hapus ${esc(p.name)} dari wishlist">${HEART_FILLED}</button>
    </div>
    <div class="product-body">
      <div class="product-meta">${esc(p.category)} · ${esc(p.supplier)}</div>
      <h3 class="product-title"><a href="#/produk/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
      <p class="supplier-line">MOQ ${p.target} ${esc(p.unit)} · ${p.collected} terkumpul</p>
      <div class="price-row">
        <div class="price">${rp(p.price)} <small>/ ${esc(p.unit)}</small></div>
        <div class="moq">Status<br><b>${esc(gs.label)}</b></div>
      </div>
      ${progressBar(pct)}
      <div class="progress-labels"><span>${esc(dl.label)}</span><span><b>${pct}%</b></span></div>
      <div class="card-actions">
        <a class="btn btn-sm" href="#/gabung/${encodeURIComponent(p.id)}">Gabung Grup</a>
        <a class="btn btn-outline btn-sm" href="#/produk/${encodeURIComponent(p.id)}">Lihat Detail</a>
        <button class="btn btn-ghost btn-sm" type="button" data-action="remove-wishlist" data-id="${esc(p.id)}">Hapus</button>
      </div>
    </div>
  </article>`;
}

/* ---------- kartu grup ---------- */
function groupCard(item) {
  const pct = progressPct(item);
  const gs = groupState(item);
  const dl = deadlineInfo(item.deadline);
  const joined = joinedGroupIds().has(item.id);
  return `<article class="group-card">
    <div class="group-head">
      <div>
        <span class="group-cat">${esc(item.category)}</span>
        <h3><a href="#/produk/${encodeURIComponent(item.id)}">${esc(item.name)}</a></h3>
        <p class="group-supplier">Supplier: ${esc(item.supplier)}</p>
      </div>
      <span class="badge ${gs.badge}">${esc(gs.label)}</span>
    </div>
    <div class="group-stats">
      <div><small>Harga grosir</small><b>${rp(item.price)}/${esc(item.unit)}</b></div>
      <div><small>Target MOQ</small><b>${item.target} ${esc(item.unit)}</b></div>
      <div><small>Batas waktu</small><b>${esc(dl.label)}</b></div>
    </div>
    ${progressBar(pct)}
    <div class="progress-labels"><span>${item.collected} dari ${item.target} ${esc(item.unit)}</span><span><b>${pct}%</b></span></div>
    <div class="group-actions">
      <a class="btn btn-outline btn-sm" href="#/produk/${encodeURIComponent(item.id)}">Lihat Detail</a>
      ${joined
        ? '<button class="btn btn-sm" type="button" disabled>Sudah Diikuti</button>'
        : `<a class="btn btn-sm" href="#/gabung/${encodeURIComponent(item.id)}">Gabung Grup</a>`}
    </div>
    ${item.isCustom ? '<div class="group-note">Grup buatan Anda</div>' : ''}
  </article>`;
}

/* ---------- beranda ---------- */
function homeView() {
  const activeOrders = state.orders.filter((o) => ['target', 'payment', 'process', 'shipped'].includes(o.status));
  const pendingTarget = state.orders.filter((o) => o.status === 'target').length;
  const followed = new Set(activeOrders.map((o) => o.productId)).size;
  const savings = activeOrders.reduce((sum, o) => {
    const p = findItem(o.productId);
    return p && p.retailPrice ? sum + Math.max(0, p.retailPrice - p.price) * o.qty : sum;
  }, 0);
  const featured = state.products.slice(0, 3);
  const running = allGroups().filter((g) => !isReached(g) && !deadlineInfo(g.deadline).ended).slice(0, 2);
  const firstName = String(state.profile.owner || 'Sari').split(' ')[0];

  return `<div class="page">
    <div class="page-head">
      <div class="page-head-row">
        <div><h1>Selamat datang, ${esc(firstName)}! 👋</h1><p>Temukan kebutuhan usaha dengan harga grosir yang lebih hemat.</p></div>
        <a class="btn" href="#/grup/baru">＋ Buat Pembelian Bersama</a>
      </div>
    </div>

    <section class="hero">
      <div class="hero-copy">
        <h2>Belanja Grosir, Lebih Hemat Bersama!</h2>
        <p>Gabungkan kebutuhan belanja dengan UMKM lain untuk mencapai minimum order supplier dan dapatkan harga terbaik.</p>
        <div class="hero-actions">
          <a class="btn" href="#/grup">Cari Grup Pembelian →</a>
          <a class="btn btn-outline" href="#/produk">Lihat Katalog</a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">🛒🤝</div>
    </section>

    <div class="stat-grid">
      ${statCard('♧', 'Grup Diikuti', `${followed} Grup`, `${pendingTarget} grup menunggu target`)}
      ${statCard('↘', 'Potensi Penghematan', rp(savings), 'Estimasi dari pembelian bersama', 'amber')}
      ${statCard('▤', 'Pesanan Aktif', `${activeOrders.length} Pesanan`, 'Perlu dipantau', 'blue')}
    </div>

    <div class="section-head"><div class="section-sub"><h2>Kategori Produk</h2><p>Pilih kategori kebutuhan usaha Anda</p></div><a class="link-arrow" href="#/produk">Lihat semua →</a></div>
    <div class="category-grid">
      ${D.categories.map((c) => {
        const count = state.products.filter((p) => p.category === c).length;
        return `<button class="category-card" type="button" data-action="pick-category" data-category="${esc(c)}">
          <span class="cat-emoji" aria-hidden="true">${D.categoryEmoji[c] || '📦'}</span>
          <label>${esc(c)}</label><small>${count} produk</small>
        </button>`;
      }).join('')}
    </div>

    <div class="section-head"><div class="section-sub"><h2>Produk Grosir Pilihan</h2><p>Harga kolektif dari supplier terpercaya</p></div><a class="link-arrow" href="#/produk">Lihat katalog →</a></div>
    <div class="product-grid">${featured.map(productCard).join('')}</div>

    <div class="section-head"><div class="section-sub"><h2>Pembelian Bersama yang Berjalan</h2><p>Grup aktif yang bisa Anda ikuti</p></div><a class="link-arrow" href="#/grup">Lihat semua →</a></div>
    <div class="group-grid">${running.length ? running.map(groupCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><h3>Belum ada grup berjalan</h3><p>Buat grup pembelian baru untuk memulai.</p><a class="btn" href="#/grup/baru">Buat Pembelian Bersama</a></div>'}</div>
  </div>`;
}

/* ---------- katalog ---------- */
function filteredProducts() {
  const q = catalogFilters.q.trim().toLowerCase();
  let items = state.products.slice();

  if (q) items = items.filter((p) => `${p.name} ${p.supplier} ${p.category}`.toLowerCase().includes(q));
  if (catalogFilters.category) items = items.filter((p) => p.category === catalogFilters.category);
  if (catalogFilters.supplier) items = items.filter((p) => p.supplier === catalogFilters.supplier);
  if (catalogFilters.status !== 'all') items = items.filter((p) => groupState(p).key === catalogFilters.status);
  if (catalogFilters.price !== 'all') {
    items = items.filter((p) => {
      if (catalogFilters.price === 'lt50') return p.price < 50000;
      if (catalogFilters.price === '50to150') return p.price >= 50000 && p.price <= 150000;
      if (catalogFilters.price === '150to250') return p.price > 150000 && p.price <= 250000;
      if (catalogFilters.price === 'gt250') return p.price > 250000;
      return true;
    });
  }

  switch (catalogFilters.sort) {
    case 'price-asc': items.sort((a, b) => a.price - b.price); break;
    case 'price-desc': items.sort((a, b) => b.price - a.price); break;
    case 'progress': items.sort((a, b) => progressPct(b) - progressPct(a)); break;
    default: break;
  }
  return items;
}

function catalogGridHTML() {
  const items = filteredProducts();
  if (!items.length) {
    return emptyState('🔍', 'Produk tidak ditemukan', 'Coba kata kunci lain atau ubah filter yang Anda gunakan.', '<button class="btn btn-outline" type="button" data-action="reset-catalog">Reset Filter</button>');
  }
  return items.map(productCard).join('');
}

function activeCatalogFilters() {
  return Boolean(catalogFilters.q.trim() || catalogFilters.category || catalogFilters.supplier || catalogFilters.price !== 'all' || catalogFilters.status !== 'all' || catalogFilters.sort !== 'default');
}

function catalogView() {
  const suppliers = Array.from(new Set(state.products.map((p) => p.supplier))).sort();
  const count = filteredProducts().length;
  return `<div class="page">
    <div class="page-head"><div class="page-head-row">
      <div><h1>Produk Grosir</h1><p>Cari bahan baku, kemasan, dan kebutuhan operasional usaha dengan harga grosir.</p></div>
      <a class="btn btn-outline" href="#/grup">♧ Lihat Pembelian Bersama</a>
    </div></div>

    <div class="filter-card">
      <div class="filter-search">
        <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
        <input id="catSearch" type="search" placeholder="Cari nama produk, kategori, atau supplier..." value="${esc(catalogFilters.q)}" aria-label="Cari produk grosir">
      </div>
      <div class="chip-row">
        <button type="button" class="chip ${catalogFilters.category === '' ? 'active' : ''}" data-action="catalog-cat" data-cat="Semua">Semua</button>
        ${D.categories.map((c) => `<button type="button" class="chip ${catalogFilters.category === c ? 'active' : ''}" data-action="catalog-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <div class="filter-row" style="margin-top:11px">
        <div class="filter-field"><label for="catSupplier">Supplier</label><select id="catSupplier">${opt('', 'Semua supplier', catalogFilters.supplier)}${suppliers.map((s) => opt(s, s, catalogFilters.supplier)).join('')}</select></div>
        <div class="filter-field"><label for="catPrice">Rentang harga</label><select id="catPrice">${PRICE_RANGES.map(([v, l]) => opt(v, l, catalogFilters.price)).join('')}</select></div>
        <div class="filter-field"><label for="catStatus">Status grup</label><select id="catStatus">${GROUP_STATUS_OPTIONS.map(([v, l]) => opt(v, l, catalogFilters.status)).join('')}</select></div>
        <div class="filter-field"><label for="catSort">Urutkan</label><select id="catSort">${opt('default', 'Rekomendasi', catalogFilters.sort)}${opt('price-asc', 'Harga termurah', catalogFilters.sort)}${opt('price-desc', 'Harga tertinggi', catalogFilters.sort)}${opt('progress', 'Hampir mencapai target', catalogFilters.sort)}</select></div>
        <button class="btn btn-ghost btn-sm filter-reset" type="button" data-action="reset-catalog">Reset filter</button>
      </div>
    </div>

    <p class="result-count" id="catalogResult"><b>${count}</b> produk ditemukan${activeCatalogFilters() ? ' · filter aktif' : ''}</p>
    <div class="product-grid" id="catalogGrid">${catalogGridHTML()}</div>
  </div>`;
}

/* ---------- detail produk ---------- */
function productDetailView(id) {
  const p = findItem(id);
  if (!p) return notFoundView('Produk tidak ditemukan', 'Produk yang Anda cari tidak tersedia atau sudah dihapus dari katalog.', '#/produk', 'Kembali ke Katalog');

  const pct = progressPct(p);
  const gs = groupState(p);
  const dl = deadlineInfo(p.deadline);
  const wished = state.wishlist.includes(p.id);
  const saving = p.retailPrice ? Math.max(0, p.retailPrice - p.price) : 0;
  const remaining = Math.max(0, p.target - p.collected);
  const specs = Object.entries(p.specs || {});
  const canJoin = !dl.ended;

  return `<div class="page">
    <div class="breadcrumb"><a href="#/produk">Produk Grosir</a><span>›</span><span>${esc(p.category)}</span><span>›</span><span>${esc(p.name)}</span></div>
    <div class="detail-layout">
      <div class="detail-media-card">
        <div class="detail-media" style="background:${CATEGORY_BG[p.category] || CATEGORY_BG['Lainnya']}">
          <span aria-hidden="true">${p.emoji || '📦'}</span>
          <div class="media-badges">${mediaBadges(p)}</div>
          <button class="fav-btn ${wished ? 'is-active' : ''}" type="button" data-action="wishlist" data-id="${esc(p.id)}" aria-label="Wishlist" aria-pressed="${wished}">${wished ? HEART_FILLED : HEART_ICON}</button>
        </div>
        <div class="detail-media-foot">
          <span class="detail-fact">Kategori <b>${esc(p.category)}</b></span>
          <span class="detail-fact">Supplier <b>${esc(p.supplier)}</b></span>
          <span class="detail-fact">Status <b>${esc(gs.label)}</b></span>
        </div>
      </div>

      <div>
        <div class="detail-panel">
          <span class="eyebrow">${esc(p.category)}</span>
          <h1>${esc(p.name)}</h1>
          <p class="supplier">Supplier: <b>${esc(p.supplier)}</b></p>
          <p class="detail-desc">${esc(p.description || 'Produk kebutuhan UMKM dengan harga grosir kolektif.')}</p>

          <div class="detail-price-box">
            <div class="detail-price">${rp(p.price)} <small>/ ${esc(p.unit)}</small></div>
            ${p.retailPrice ? `<div class="retail-row">Harga normal <s>${rp(p.retailPrice)}</s><span class="saving-tag">Hemat ${rp(saving)} / ${esc(p.unit)}</span></div>` : '<div class="retail-row">Harga kolektif grup pembelian</div>'}
            <div class="detail-facts">
              <span class="detail-fact">MOQ grup <b>${p.target} ${esc(p.unit)}</b></span>
              <span class="detail-fact">Terkumpul <b>${p.collected} ${esc(p.unit)}</b></span>
            </div>
          </div>

          <div class="group-panel">
            <div class="group-panel-head"><h3>Progres grup pembelian</h3><span class="badge ${gs.badge}">${esc(gs.label)}</span></div>
            ${progressBar(pct)}
            <div class="progress-labels"><span>${p.collected} dari ${p.target} ${esc(p.unit)} terkumpul</span><span><b>${pct}%</b></span></div>
            <div class="group-mini-stats">
              <div><small>Target MOQ</small><b>${p.target} ${esc(p.unit)}</b></div>
              <div><small>Sisa menuju target</small><b>${remaining} ${esc(p.unit)}</b></div>
              <div><small>Batas waktu</small><b>${esc(dl.label)}</b></div>
            </div>
            ${isReached(p)
              ? '<div class="notice">Target grup sudah tercapai. Pembayaran dapat dilakukan setelah pesanan dikonfirmasi.</div>'
              : dl.ended
                ? '<div class="notice notice-warn">Grup ini telah ditutup karena batas waktu berakhir.</div>'
                : `<div class="notice">${dl.urgent ? 'Grup akan segera berakhir. ' : ''}Ajak UMKM lain bergabung, atau ikut sekarang agar target ${p.target} ${esc(p.unit)} cepat tercapai.</div>`}
          </div>

          <div class="qty-block">
            <div class="qty-block-head"><label for="detailQty">Jumlah pesanan</label><span class="text-sm muted">${esc(p.unit)}</span></div>
            <div class="qty-stepper">
              <button class="qty-btn" type="button" id="detailMinus" aria-label="Kurangi jumlah">−</button>
              <input class="qty-input" id="detailQty" type="number" inputmode="numeric" min="1" max="9999" value="1" aria-label="Jumlah pesanan">
              <button class="qty-btn" type="button" id="detailPlus" aria-label="Tambah jumlah">＋</button>
            </div>
            <div class="summary-box" id="detailSummary"></div>
          </div>

          <div class="detail-actions">
            ${canJoin ? `<a class="btn btn-lg" id="detailJoin" href="#/gabung/${encodeURIComponent(p.id)}">Gabung Grup</a>` : '<button class="btn btn-lg" type="button" disabled>Grup Ditutup</button>'}
            <button class="btn btn-outline" type="button" data-action="wishlist" data-id="${esc(p.id)}">${wished ? HEART_FILLED : HEART_ICON} <span class="wish-label">${wished ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}</span></button>
            <a class="btn btn-ghost" href="#/produk">← Kembali ke Katalog</a>
          </div>
        </div>

        <div class="detail-panel">
          <h2 style="font-size:15px;margin-bottom:4px">Spesifikasi Produk</h2>
          <div class="spec-table">
            ${specs.map(([k, v]) => `<div class="spec-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
            <div class="spec-row"><span>Minimum pembelian grup</span><b>${p.target} ${esc(p.unit)}</b></div>
            <div class="spec-row"><span>Harga per satuan</span><b>${rp(p.price)}</b></div>
          </div>
          <div class="notice" style="margin-top:14px">🚚 <b>Estimasi pengiriman:</b> ${esc(p.shipping || '2–4 hari kerja setelah target grup tercapai.')}</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- pembelian bersama ---------- */
function filteredGroups() {
  const q = groupFilters.q.trim().toLowerCase();
  let items = allGroups();
  if (q) items = items.filter((i) => `${i.name} ${i.supplier} ${i.category}`.toLowerCase().includes(q));
  if (groupFilters.status !== 'all') items = items.filter((i) => groupState(i).key === groupFilters.status);
  if (groupFilters.category) items = items.filter((i) => i.category === groupFilters.category);

  switch (groupFilters.sort) {
    case 'almost': items.sort((a, b) => progressPct(b) - progressPct(a)); break;
    case 'soon': items.sort((a, b) => (deadlineInfo(a.deadline).days ?? 999) - (deadlineInfo(b.deadline).days ?? 999)); break;
    default: items.sort((a, b) => b.collected - a.collected);
  }
  return items;
}

function groupSection(title, subtitle, items) {
  if (!items.length) return '';
  return `<div class="section-head"><div class="section-sub"><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><span class="badge badge-gray">${items.length} grup</span></div>
    <div class="group-grid">${items.map(groupCard).join('')}</div>`;
}

function groupsResultsHTML() {
  const active = Boolean(groupFilters.q.trim() || groupFilters.status !== 'all' || groupFilters.category || groupFilters.sort !== 'popular');
  if (active) {
    const items = filteredGroups();
    return `<p class="result-count"><b>${items.length}</b> grup ditemukan</p>
      ${items.length ? `<div class="group-grid">${items.map(groupCard).join('')}</div>` : emptyState('🔍', 'Grup tidak ditemukan', 'Coba kata kunci lain atau ubah filter status dan kategori.', '<button class="btn btn-outline" type="button" data-action="reset-groups">Reset Filter</button>')}`;
  }

  const items = allGroups();
  const joinedIds = joinedGroupIds();
  const followed = items.filter((i) => joinedIds.has(i.id));
  const running = items.filter((i) => groupState(i).key === 'running');
  const almost = items.filter((i) => groupState(i).key === 'almost');
  const ending = items.filter((i) => {
    const dl = deadlineInfo(i.deadline);
    return !dl.ended && dl.days !== null && dl.days <= 2 && !isReached(i);
  });
  const reached = items.filter((i) => groupState(i).key === 'reached');

  return `<p class="result-count"><b>${items.length}</b> grup pembelian aktif dan selesai</p>
    ${groupSection('Grup yang Anda Ikuti', 'Grup pembelian yang sedang Anda ikuti', followed)}
    ${groupSection('Sedang Berjalan', 'Grup yang masih mengumpulkan anggota', running)}
    ${groupSection('Hampir Mencapai Target', 'Sedikit lagi menuju MOQ supplier', almost)}
    ${groupSection('Segera Berakhir', 'Batas waktu dalam 2 hari ke depan', ending)}
    ${groupSection('Telah Mencapai Target', 'Grup yang sudah memenuhi MOQ', reached)}
    ${!items.length ? emptyState('♧', 'Belum ada grup pembelian', 'Mulai grup pertama Anda dan ajak UMKM lain untuk mencapai MOQ supplier.', '<a class="btn" href="#/grup/baru">Buat Pembelian Bersama</a>') : ''}`;
}

function groupsView() {
  const followed = joinedGroupIds().size;
  const commitment = state.orders.filter((o) => o.status === 'target').reduce((sum, o) => sum + (orderTotals(o).subtotal), 0);
  const almost = allGroups().filter((i) => groupState(i).key === 'almost').length;

  return `<div class="page">
    <div class="page-head"><div class="page-head-row">
      <div><h1>Pembelian Bersama</h1><p>Gabungkan pesanan untuk mencapai MOQ supplier dan memperoleh harga grosir.</p></div>
      <a class="btn" href="#/grup/baru">＋ Buat Pembelian Bersama</a>
    </div></div>

    <div class="stat-grid">
      ${statCard('♧', 'Grup Diikuti', `${followed} Grup`, 'Grup aktif yang Anda ikuti')}
      ${statCard('Rp', 'Nilai Komitmen', rp(commitment), 'Pesanan menunggu target', 'amber')}
      ${statCard('⚡', 'Hampir Mencapai Target', `${almost} Grup`, 'Peluang cepat terpenuhi', 'blue')}
    </div>

    <div class="filter-card" style="margin-top:16px">
      <div class="filter-search">
        <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
        <input id="groupSearch" type="search" placeholder="Cari grup, produk, atau supplier..." value="${esc(groupFilters.q)}" aria-label="Cari grup pembelian">
      </div>
      <div class="filter-row">
        <div class="filter-field"><label for="groupStatus">Status grup</label><select id="groupStatus">${GROUP_STATUS_OPTIONS.map(([v, l]) => opt(v, l, groupFilters.status)).join('')}</select></div>
        <div class="filter-field"><label for="groupCategory">Kategori</label><select id="groupCategory">${opt('', 'Semua kategori', groupFilters.category)}${optionsOf(D.categories, groupFilters.category)}</select></div>
        <div class="filter-field"><label for="groupSort">Urutkan</label><select id="groupSort">${opt('popular', 'Paling ramai', groupFilters.sort)}${opt('almost', 'Hampir mencapai target', groupFilters.sort)}${opt('soon', 'Batas waktu terdekat', groupFilters.sort)}</select></div>
        <button class="btn btn-ghost btn-sm filter-reset" type="button" data-action="reset-groups">Reset filter</button>
      </div>
    </div>

    <div id="groupsResults">${groupsResultsHTML()}</div>
  </div>`;
}

/* ---------- buat grup ---------- */
function createGroupView() {
  const d = state.draft || {};
  const val = (k) => esc(d[k] || '');
  const categories = D.categories;
  return `<div class="page">
    <div class="breadcrumb"><a href="#/grup">Pembelian Bersama</a><span>›</span><span>Buat Grup</span></div>
    <div class="page-head"><div class="page-head-row">
      <div><h1>Buat Pembelian Bersama</h1><p>Ajukan kebutuhan pembelian dan ajak UMKM lain bergabung agar mencapai minimum order supplier.</p></div>
      <a class="btn btn-outline" href="#/grup">← Kembali</a>
    </div></div>

    ${state.draft ? `<div class="notice notice-info" style="margin-bottom:14px">Draft pembelian sebelumnya dimuat ke formulir. <button class="btn-link" type="button" data-action="discard-draft">Hapus draft</button></div>` : ''}

    <form id="createGroupForm" class="create-layout" novalidate>
      <div class="form-card">
        <div class="form-section">
          <p class="form-section-title">Informasi Produk</p>
          <div class="form-grid">
            <div class="field full"><label for="cgProduct">Nama produk yang ingin dibeli <span class="req">*</span></label><input id="cgProduct" name="product" placeholder="Contoh: Gula pasir 1 kg" value="${val('product')}" autocomplete="off"><span class="field-error"></span></div>
            <div class="field"><label for="cgCategory">Kategori produk <span class="req">*</span></label><select id="cgCategory" name="category"><option value="">Pilih kategori</option>${optionsOf(categories, d.category || '')}</select><span class="field-error"></span></div>
            <div class="field"><label for="cgSupplier">Supplier (opsional)</label><input id="cgSupplier" name="supplier" placeholder="Nama supplier jika sudah diketahui" value="${val('supplier')}"><span class="field-error"></span></div>
            <div class="field full"><label for="cgDescription">Deskripsi kebutuhan produk</label><textarea id="cgDescription" name="description" placeholder="Jelaskan spesifikasi, kualitas, atau kebutuhan produk Anda">${esc(d.description || '')}</textarea><span class="field-hint">Informasi ini membantu peserta lain memahami kebutuhan grup.</span><span class="field-error"></span></div>
          </div>
        </div>

        <div class="form-section">
          <p class="form-section-title">Target & Harga</p>
          <div class="form-grid">
            <div class="field"><label for="cgOwnQty">Jumlah kebutuhan pribadi <span class="req">*</span></label><input id="cgOwnQty" name="ownQty" type="number" min="1" step="1" placeholder="Contoh: 10" value="${val('ownQty')}"><span class="field-hint">Jumlah yang akan Anda pesan.</span><span class="field-error"></span></div>
            <div class="field"><label for="cgTarget">Target total pembelian grup <span class="req">*</span></label><input id="cgTarget" name="target" type="number" min="1" step="1" placeholder="Contoh: 150" value="${val('target')}"><span class="field-hint">Minimal sama dengan kebutuhan pribadi.</span><span class="field-error"></span></div>
            <div class="field"><label for="cgPrice">Harga estimasi per satuan (Rp) <span class="req">*</span></label><input id="cgPrice" name="price" type="number" min="1" step="100" placeholder="Contoh: 15800" value="${val('price')}"><span class="field-error"></span></div>
            <div class="field"><label for="cgDeadline">Batas waktu pengumpulan <span class="req">*</span></label><input id="cgDeadline" name="deadline" type="date" min="2026-11-24" value="${val('deadline')}"><span class="field-error"></span></div>
          </div>
        </div>

        <div class="form-section">
          <p class="form-section-title">Pengiriman & Catatan</p>
          <div class="form-grid">
            <div class="field full"><label for="cgLocation">Lokasi pengiriman <span class="req">*</span></label><input id="cgLocation" name="location" placeholder="Kota dan alamat pengiriman" value="${val('location')}"><span class="field-error"></span></div>
            <div class="field full"><label for="cgNotes">Catatan tambahan</label><textarea id="cgNotes" name="notes" placeholder="Contoh: pengiriman digabung ke gudang peserta, atau syarat pembayaran">${esc(d.notes || '')}</textarea><span class="field-error"></span></div>
          </div>
        </div>

        <div class="notice">Grup yang dibuat akan tampil pada halaman Pembelian Bersama sebagai simulasi. Pastikan target jumlah dan batas waktu sudah sesuai.</div>

        <div class="form-actions">
          <a class="btn btn-ghost" href="#/grup">Batal</a>
          <button class="btn btn-outline" type="button" data-action="save-draft">Simpan Draft</button>
          <button class="btn" type="submit">Buat Grup</button>
        </div>
      </div>

      <aside class="summary-side">
        <div class="pay-panel">
          <h3>Ringkasan Grup</h3>
          <p class="muted">Perkiraan berubah otomatis sesuai isian Anda.</p>
          <div id="createSummary" style="margin-top:12px"></div>
          <div class="notice" style="margin-top:12px">Harga akhir dapat berubah sesuai penawaran supplier setelah target grup tercapai.</div>
        </div>
      </aside>
    </form>
  </div>`;
}

/* ---------- gabung grup ---------- */
function joinView(id) {
  const p = findItem(id);
  if (!p) return notFoundView('Grup tidak ditemukan', 'Grup pembelian yang Anda tuju tidak tersedia.', '#/grup', 'Kembali ke Pembelian Bersama');

  const pct = progressPct(p);
  const gs = groupState(p);
  const dl = deadlineInfo(p.deadline);
  const existing = state.orders.find((o) => o.productId === p.id && ['target', 'payment', 'process', 'shipped'].includes(o.status));
  const qty = joinIntent.id === p.id ? joinIntent.qty : 1;

  return `<div class="page">
    <div class="breadcrumb"><a href="#/produk">Produk Grosir</a><span>›</span><a href="#/produk/${encodeURIComponent(p.id)}">${esc(p.name)}</a><span>›</span><span>Gabung Grup</span></div>
    <div class="page-head"><h1>Bergabung dengan Grup Pembelian</h1><p>Atur jumlah yang ingin Anda pesan, lalu periksa estimasi biaya sebelum bergabung.</p></div>

    <div class="detail-layout">
      <div class="pay-panel">
        <div class="pay-product">
          <div class="order-thumb" aria-hidden="true">${p.emoji || '📦'}</div>
          <div><h3>${esc(p.name)}</h3><p>Supplier: ${esc(p.supplier)} · ${esc(p.category)}</p></div>
        </div>
        <div class="group-panel">
          <div class="group-panel-head"><h3>Ringkasan grup</h3><span class="badge ${gs.badge}">${esc(gs.label)}</span></div>
          <div class="group-mini-stats">
            <div><small>Harga per satuan</small><b>${rp(p.price)} / ${esc(p.unit)}</b></div>
            <div><small>MOQ grup</small><b>${p.target} ${esc(p.unit)}</b></div>
            <div><small>Terkumpul</small><b>${p.collected} ${esc(p.unit)}</b></div>
          </div>
          ${progressBar(pct)}
          <div class="progress-labels"><span>${p.collected} dari ${p.target} ${esc(p.unit)}</span><span><b>${pct}%</b></span></div>
          <div class="group-mini-stats" style="margin-top:10px">
            <div><small>Sisa waktu</small><b>${esc(dl.label)}</b></div>
            <div><small>Sisa menuju target</small><b>${Math.max(0, p.target - p.collected)} ${esc(p.unit)}</b></div>
            <div><small>Status</small><b>${esc(gs.label)}</b></div>
          </div>
        </div>
        <div class="notice" style="margin-top:12px">Jumlah pesanan Anda akan digabungkan dengan peserta lain untuk mencapai target MOQ supplier. Anda hanya membayar sesuai jumlah pesanan sendiri.</div>
      </div>

      <div class="pay-panel">
        <h2>Jumlah Pesanan</h2>
        ${dl.ended ? '<div class="notice notice-warn">Grup sudah ditutup karena melewati batas waktu.</div>' : ''}
        ${existing ? `<div class="notice notice-info">Anda sudah bergabung di grup ini. <a href="#/pesanan/${encodeURIComponent(existing.id)}">Lihat detail pesanan</a>.</div>` : ''}
        <div class="qty-block">
          <div class="qty-block-head"><label for="joinQty">Jumlah yang ingin dipesan</label><span class="text-sm muted">${esc(p.unit)}</span></div>
          <div class="qty-stepper">
            <button class="qty-btn" type="button" id="joinMinus" aria-label="Kurangi jumlah">−</button>
            <input class="qty-input" id="joinQty" type="number" inputmode="numeric" min="1" max="9999" value="${qty}" aria-label="Jumlah pesanan">
            <button class="qty-btn" type="button" id="joinPlus" aria-label="Tambah jumlah">＋</button>
          </div>
          <div class="summary-box" id="joinSummary"></div>
        </div>
        <div class="notice${dl.ended || existing ? ' notice-warn' : ''}" id="joinError" hidden></div>
        <div class="detail-actions">
          <button class="btn btn-lg" type="button" id="joinConfirm" ${dl.ended || existing ? 'disabled' : ''}>Konfirmasi Bergabung</button>
          <a class="btn btn-outline" href="#/produk/${encodeURIComponent(p.id)}">Batal</a>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- wishlist ---------- */
function filteredWishlist() {
  let items = state.wishlist.map((id) => findItem(id)).filter(Boolean);
  const q = wishlistFilters.q.trim().toLowerCase();
  if (q) items = items.filter((p) => `${p.name} ${p.supplier} ${p.category}`.toLowerCase().includes(q));
  if (wishlistFilters.category) items = items.filter((p) => p.category === wishlistFilters.category);
  if (wishlistFilters.status !== 'all') items = items.filter((p) => groupState(p).key === wishlistFilters.status);
  return items;
}

function wishlistResultsHTML() {
  const items = filteredWishlist();
  if (!state.wishlist.length) {
    return emptyState('♡', 'Wishlist Anda masih kosong', 'Simpan produk grosir yang ingin dibeli nanti agar mudah ditemukan kembali.', '<a class="btn" href="#/produk">Jelajahi Produk</a>');
  }
  if (!items.length) {
    return emptyState('🔍', 'Tidak ada produk yang cocok', 'Ubah kata kunci atau filter untuk menemukan produk wishlist Anda.', '<button class="btn btn-outline" type="button" data-action="reset-wishlist">Reset Filter</button>');
  }
  return `<p class="result-count"><b>${items.length}</b> produk ditemukan</p><div class="product-grid">${items.map(wishlistCard).join('')}</div>`;
}

function wishlistView() {
  return `<div class="page">
    <div class="page-head"><div class="page-head-row">
      <div><h1>Wishlist Saya</h1><p>Simpan produk grosir dan grup pembelian yang ingin Anda beli nanti.</p></div>
      <span class="badge badge-green" style="align-self:center">${state.wishlist.length} produk tersimpan</span>
    </div></div>

    <div class="filter-card">
      <div class="filter-search">
        <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
        <input id="wishSearch" type="search" placeholder="Cari produk wishlist..." value="${esc(wishlistFilters.q)}" aria-label="Cari produk wishlist">
      </div>
      <div class="filter-row">
        <div class="filter-field"><label for="wishCategory">Kategori</label><select id="wishCategory">${opt('', 'Semua kategori', wishlistFilters.category)}${optionsOf(D.categories, wishlistFilters.category)}</select></div>
        <div class="filter-field"><label for="wishStatus">Status grup</label><select id="wishStatus">${GROUP_STATUS_OPTIONS.map(([v, l]) => opt(v, l, wishlistFilters.status)).join('')}</select></div>
        <button class="btn btn-ghost btn-sm filter-reset" type="button" data-action="reset-wishlist">Reset filter</button>
      </div>
    </div>

    <div id="wishlistResults">${wishlistResultsHTML()}</div>
  </div>`;
}

/* ---------- pesanan saya ---------- */
function filteredOrders() {
  let items = state.orders.slice();
  if (orderFilters.tab !== 'all') items = items.filter((o) => o.status === orderFilters.tab);
  const q = orderFilters.q.trim().toLowerCase();
  if (q) {
    items = items.filter((o) => {
      const p = orderProduct(o);
      return `${o.id} ${p.name} ${p.supplier} ${statusMeta(o).label}`.toLowerCase().includes(q);
    });
  }
  return items;
}

function orderCard(o) {
  const p = orderProduct(o);
  const st = statusMeta(o);
  const totals = orderTotals(o);
  const group = orderGroup(o);
  const pct = group.target ? Math.min(100, Math.round((group.collected / group.target) * 100)) : 0;
  const showProgress = o.status === 'target';

  return `<article class="order-card${flashOrderId === o.id ? ' flash' : ''}" id="order-${esc(o.id)}">
    <div class="order-head">
      <div class="order-prod">
        <div class="order-thumb" aria-hidden="true">${p.emoji || '📦'}</div>
        <div><span class="order-id">ORDER #${esc(o.id)}</span><h3><a href="#/pesanan/${encodeURIComponent(o.id)}">${esc(p.name)}</a></h3><p>Supplier: ${esc(p.supplier)}</p></div>
      </div>
      <span class="badge ${st.cls}">${esc(st.label)}</span>
    </div>
    <div class="order-info-grid">
      <div><small>Jumlah pesanan</small><b>${o.qty} ${esc(p.unit)}</b></div>
      <div><small>${totals.charged ? 'Total pembayaran' : 'Total sementara'}</small><b>${rp(totals.total)}</b></div>
      <div><small>Tanggal pesanan</small><b>${fmtDate(o.date)}</b></div>
    </div>
    ${showProgress ? `<div class="order-progress">${progressBar(pct)}<div class="progress-labels"><span>Target grup: ${group.collected} dari ${group.target} ${esc(group.unit)}</span><span>${pct}%</span></div></div>` : ''}
    ${o.status === 'cancelled' ? `<p class="order-cancel-reason">${esc(o.cancelReason || 'Pesanan dibatalkan.')}</p>` : ''}
    <div class="order-foot">
      <span class="order-note">${orderNote(o)}</span>
      <div class="order-actions">${orderActionsHTML(o)}</div>
    </div>
  </article>`;
}

function orderActionsHTML(o) {
  const detail = `<a class="btn btn-outline btn-sm" href="#/pesanan/${encodeURIComponent(o.id)}">Detail Pesanan</a>`;
  switch (o.status) {
    case 'target':
      return `<a class="btn btn-outline btn-sm" href="#/grup">Lihat Progres Grup</a>${detail.replace('btn-outline ', '')}`;
    case 'payment':
      return `<a class="btn btn-sm" href="#/pembayaran/${encodeURIComponent(o.id)}">Bayar Sekarang</a>${detail}`;
    case 'process':
      return detail;
    case 'shipped':
      return `<button class="btn btn-outline btn-sm" type="button" data-action="view-shipping" data-id="${esc(o.id)}">Lihat Pengiriman</button><button class="btn btn-sm" type="button" data-action="receive" data-id="${esc(o.id)}">Pesanan Diterima</button>`;
    default:
      return detail;
  }
}

function ordersListHTML() {
  const items = filteredOrders();
  if (!state.orders.length) {
    return emptyState('▤', 'Belum ada pesanan', 'Pesanan yang Anda buat melalui pembelian bersama akan tampil di sini.', '<a class="btn" href="#/produk">Jelajahi Produk</a>');
  }
  if (!items.length) {
    return emptyState('🔍', 'Tidak ada pesanan yang cocok', 'Coba ubah kata kunci pencarian atau pilih tab status lain.', '<button class="btn btn-outline" type="button" data-action="reset-orders">Reset Pencarian</button>');
  }
  return `<div class="orders-list">${items.map(orderCard).join('')}</div>`;
}

function ordersView() {
  const count = (k) => k === 'all' ? state.orders.length : state.orders.filter((o) => o.status === k).length;
  return `<div class="page">
    <div class="page-head"><h1>Pesanan Saya</h1><p>Pantau status pesanan grosir dan pembelian kolektif Anda.</p></div>

    <div class="order-stats">
      <div class="order-stat"><small>Total Pesanan</small><h3>${state.orders.length}</h3><span>Semua transaksi</span></div>
      <div class="order-stat"><small>Menunggu Target</small><h3>${count('target')}</h3><span>Masih dalam pengumpulan</span></div>
      <div class="order-stat"><small>Menunggu Pembayaran</small><h3>${count('payment')}</h3><span>Perlu diselesaikan</span></div>
      <div class="order-stat"><small>Diproses & Dikirim</small><h3>${count('process') + count('shipped')}</h3><span>Sedang berjalan</span></div>
      <div class="order-stat"><small>Selesai</small><h3>${count('done')}</h3><span>Pesanan diterima</span></div>
    </div>

    <div class="order-toolbar">
      <div class="order-tabs" role="tablist" aria-label="Filter status pesanan">
        ${ORDER_TABS.map(([k, label]) => `<button class="tab ${orderFilters.tab === k ? 'active' : ''}" type="button" role="tab" aria-selected="${orderFilters.tab === k}" data-action="order-tab" data-tab="${k}">${label}<span class="tab-count">${count(k)}</span></button>`).join('')}
      </div>
      <div class="order-search">
        <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
        <input id="orderSearch" type="search" placeholder="Cari pesanan..." value="${esc(orderFilters.q)}" aria-label="Cari pesanan">
      </div>
    </div>

    ${flashOrderId ? `<div class="notice notice-info" style="margin-bottom:12px">Pesanan baru <b>#${esc(flashOrderId)}</b> berhasil ditambahkan ke daftar Anda.</div>` : ''}
    <div id="ordersList">${ordersListHTML()}</div>
  </div>`;
}

/* ---------- detail pesanan ---------- */
function timelineHTML(o) {
  const group = orderGroup(o);
  if (o.status === 'cancelled') {
    return `<div class="timeline">
      <div class="timeline-item done"><div class="timeline-dot">✓</div><div class="timeline-body"><b>Bergabung dengan grup</b><p>Pesanan Anda masuk ke grup pembelian.</p></div></div>
      <div class="timeline-item failed"><div class="timeline-dot">!</div><div class="timeline-body"><b>Target MOQ tidak tercapai</b><p>Grup berakhir sebelum target ${group.target} ${esc(group.unit)} terpenuhi.</p></div></div>
      <div class="timeline-item failed"><div class="timeline-dot">×</div><div class="timeline-body"><b>Pesanan dibatalkan</b><p>${esc(o.cancelReason || 'Pesanan dibatalkan karena grup gagal.')}</p></div></div>
    </div>`;
  }

  const stages = [
    ['Bergabung dengan grup', 'Jumlah pesanan Anda digabungkan ke grup pembelian.'],
    ['Menunggu target MOQ', 'Grup masih mengumpulkan pesanan hingga target terpenuhi.'],
    ['Target tercapai', 'Target minimum order supplier berhasil dipenuhi.'],
    ['Pembayaran dikonfirmasi', 'Pembayaran Anda diperlukan agar supplier dapat memproses pesanan.'],
    ['Supplier memproses pesanan', 'Supplier sedang menyiapkan dan mengemas pesanan.'],
    ['Pesanan dikirim', 'Pesanan dalam perjalanan ke alamat usaha Anda.'],
    ['Pesanan selesai', 'Pesanan telah diterima dan transaksi selesai.']
  ];
  const idx = { target: 1, payment: 3, process: 4, shipped: 5, done: 6 }[o.status] ?? 0;

  return `<div class="timeline">${stages.map(([title, baseDesc], i) => {
    const done = i < idx || (i === idx && o.status === 'done');
    const current = i === idx && o.status !== 'done';
    let desc = baseDesc;
    if (current && i === 1) desc = `Tersisa ${Math.max(0, group.target - group.collected)} ${esc(group.unit)} lagi agar target grup tercapai.`;
    if (current && i === 3) desc = 'Menunggu pembayaran Anda sebelum pesanan diproses supplier.';
    if (done && i === 3 && o.payment) desc = `Pembayaran dikonfirmasi pada ${fmtDate(o.payment.date)}.`;
    if (current && i === 4) desc = 'Pembayaran diterima. Supplier sedang menyiapkan pesanan.';
    if (current && i === 5) desc = o.tracking ? `Dikirim via ${o.tracking.courier} · Resi ${o.tracking.resi}.` : 'Pesanan sedang dalam perjalanan.';
    if (done && i === 6) desc = `Pesanan diterima pada ${fmtDate(o.completedDate || o.date)}.`;
    return `<div class="timeline-item ${done ? 'done' : current ? 'current' : 'pending'}">
      <div class="timeline-dot">${done ? '✓' : i + 1}</div>
      <div class="timeline-body"><b>${esc(title)}</b><p>${esc(desc)}</p></div>
    </div>`;
  }).join('')}</div>`;
}

function orderActionsLarge(o) {
  const back = '<a class="btn btn-outline" href="#/pesanan">Kembali ke Pesanan Saya</a>';
  switch (o.status) {
    case 'target':
      return `<a class="btn" href="#/grup">Lihat Progres Grup</a><a class="btn btn-outline" href="#/pesanan">Kembali ke Pesanan Saya</a>`;
    case 'payment':
      return `<a class="btn" href="#/pembayaran/${encodeURIComponent(o.id)}">Lakukan Pembayaran</a>${back}`;
    case 'process':
      return back;
    case 'shipped':
      return `<button class="btn btn-outline" type="button" data-action="scroll-shipping">Lihat Informasi Pengiriman</button><button class="btn" type="button" data-action="receive" data-id="${esc(o.id)}">Konfirmasi Pesanan Diterima</button>${back}`;
    case 'done':
      return `<button class="btn btn-outline" type="button" data-action="scroll-shipping">Lihat Informasi Pengiriman</button>${back}`;
    default:
      return back;
  }
}

function orderDetailView(id) {
  const o = state.orders.find((x) => x.id === id);
  if (!o) return notFoundView('Pesanan tidak ditemukan', 'Pesanan yang Anda cari tidak tersedia.', '#/pesanan', 'Kembali ke Pesanan Saya');

  const p = orderProduct(o);
  const st = statusMeta(o);
  const totals = orderTotals(o);
  const group = orderGroup(o);
  const pct = group.target ? Math.min(100, Math.round((group.collected / group.target) * 100)) : 0;

  return `<div class="page">
    <div class="breadcrumb"><a href="#/pesanan">Pesanan Saya</a><span>›</span><span>#${esc(o.id)}</span></div>
    <div class="page-head"><div class="page-head-row">
      <div><h1>Detail Pesanan</h1><p>Order #${esc(o.id)} · ${fmtDate(o.date)}</p></div>
      <span class="badge ${st.cls}">${esc(st.label)}</span>
    </div></div>

    <div class="detail-layout">
      <div>
        <div class="pay-panel">
          <div class="pay-product">
            <div class="order-thumb" aria-hidden="true">${p.emoji || '📦'}</div>
            <div><h3>${esc(p.name)}</h3><p>Supplier: ${esc(p.supplier)} · ${esc(p.category || '-')}</p></div>
            <span class="badge ${st.cls}" style="margin-left:auto">${esc(st.label)}</span>
          </div>
          <div class="order-info-grid">
            <div><small>Jumlah pesanan</small><b>${o.qty} ${esc(p.unit)}</b></div>
            <div><small>Harga per satuan</small><b>${rp(totals.unitPrice)}</b></div>
            <div><small>Tanggal pesanan</small><b>${fmtDate(o.date)}</b></div>
          </div>
          <div class="summary-box" style="margin-top:0">
            <div class="summary-row"><span>Subtotal</span><b>${rp(totals.subtotal)}</b></div>
            <div class="summary-row"><span>Biaya pengiriman</span><b>${totals.shipping ? rp(totals.shipping) : 'Belum dihitung'}</b></div>
            <div class="summary-row"><span>Biaya layanan</span><b>${totals.fee ? rp(totals.fee) : '—'}</b></div>
            <div class="summary-total"><span>${totals.charged ? 'Total pembayaran' : 'Total sementara'}</span><b>${rp(totals.total)}</b></div>
          </div>
        </div>

        <div class="pay-panel" style="margin-top:14px">
          <h2>Timeline Status Pesanan</h2>
          ${timelineHTML(o)}
        </div>

        <div class="detail-actions" style="margin-top:14px;flex-direction:row;flex-wrap:wrap">
          ${orderActionsLarge(o)}
        </div>
      </div>

      <div>
        <div class="pay-panel">
          <h2>Informasi Grup Pembelian</h2>
          <div class="group-panel-head"><span class="text-sm muted">Status grup</span><span class="badge ${groupState({ target: group.target, collected: group.collected, deadline: group.deadline }).badge}">${esc(groupState({ target: group.target, collected: group.collected, deadline: group.deadline }).label)}</span></div>
          ${progressBar(pct)}
          <div class="progress-labels"><span>${group.collected} dari ${group.target} ${esc(group.unit)}</span><span><b>${pct}%</b></span></div>
          <div class="group-mini-stats">
            <div><small>Target MOQ</small><b>${group.target} ${esc(group.unit)}</b></div>
            <div><small>Terkumpul</small><b>${group.collected} ${esc(group.unit)}</b></div>
            <div><small>Batas waktu</small><b>${group.deadline ? fmtDate(group.deadline) : '-'}</b></div>
          </div>
          <div class="notice" style="margin-top:10px">Pesanan Anda digabungkan bersama peserta lain dalam grup ini.</div>
        </div>

        <div class="pay-panel" style="margin-top:14px">
          <h2>Informasi Pembayaran</h2>
          ${o.payment ? `
            <div class="spec-table" style="margin-top:0">
              <div class="spec-row"><span>Metode</span><b>${esc(o.payment.method)}</b></div>
              <div class="spec-row"><span>Nomor transaksi</span><b>${esc(o.payment.trx)}</b></div>
              <div class="spec-row"><span>Tanggal</span><b>${fmtDate(o.payment.date)}</b></div>
              <div class="spec-row"><span>Total</span><b>${rp(o.payment.total)}</b></div>
            </div>
            <div class="notice" style="margin-top:12px">Pembayaran telah dikonfirmasi.</div>
          ` : o.status === 'target' ? `
            <div class="notice notice-warn">Pembayaran tersedia setelah grup mencapai target MOQ. Saat ini ${group.collected} dari ${group.target} ${esc(group.unit)} terkumpul.</div>
          ` : o.status === 'cancelled' ? `
            <div class="notice notice-danger">Pesanan dibatalkan, tidak ada pembayaran yang diperlukan.</div>
          ` : `<div class="notice">Belum ada pembayaran tercatat.</div>`}
        </div>

        <div class="pay-panel" style="margin-top:14px" id="shippingInfo">
          <h2>Informasi Pengiriman</h2>
          ${o.tracking ? `
            <div class="spec-table" style="margin-top:0">
              <div class="spec-row"><span>Kurir</span><b>${esc(o.tracking.courier)} (${esc(o.tracking.service)})</b></div>
              <div class="spec-row"><span>Nomor resi</span><b>${esc(o.tracking.resi)}</b></div>
              <div class="spec-row"><span>Estimasi tiba</span><b>${esc(o.tracking.eta)}</b></div>
              <div class="spec-row"><span>Alamat</span><b>${esc(o.tracking.address)}</b></div>
            </div>
          ` : `<div class="notice">${o.status === 'payment' ? 'Pengiriman dimulai setelah pembayaran dikonfirmasi.' : o.status === 'process' ? 'Pesanan sedang disiapkan supplier. Informasi resi akan muncul setelah dikirim.' : o.status === 'cancelled' ? 'Pengiriman tidak dilakukan karena pesanan dibatalkan.' : 'Informasi pengiriman tersedia setelah grup mencapai target dan pembayaran dilakukan.'}</div>`}
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- pembayaran ---------- */
function paymentDetailHTML(method, o) {
  if (method === 'Transfer Bank') {
    return `<b>Bank Central Asia (BCA)</b>
      <div class="va-number">1234 5678 90</div>
      <div>a.n. <b>PT BulkBuy Nusantara</b></div>
      <div>Berita transfer: <b>${esc(o.id)}</b></div>
      <div class="notice" style="margin-top:9px">Konfirmasi pembayaran diproses otomatis dalam 1–3 menit (simulasi).</div>`;
  }
  if (method === 'Virtual Account') {
    const digits = String(o.id).replace(/\D/g, '');
    const va = `8808 ${digits.slice(0, 4)} ${digits.slice(4) || '0000'}`;
    return `<b>Virtual Account BCA</b>
      <div class="va-number">${va} <button class="btn-link" type="button" data-action="copy-va" data-copy="${va}">Salin</button></div>
      <div>a.n. <b>BulkBuy · ${esc(o.id)}</b></div>
      <div>Masukkan nomor Virtual Account pada aplikasi bank atau ATM, lalu bayar sesuai total.</div>
      <div class="notice" style="margin-top:9px">Nomor VA ini hanya berlaku untuk pesanan ${esc(o.id)}.</div>`;
  }
  return `<b>E-wallet BulkBuy</b>
    <div class="va-number">0812-0000-8888</div>
    <div>a.n. <b>BulkBuy Nusantara</b></div>
    <div>Buka aplikasi GoPay, OVO, atau DANA, lalu transfer ke nomor di atas sebesar total pembayaran.</div>
    <div class="notice" style="margin-top:9px">Cantumkan kode <b>${esc(o.id)}</b> pada catatan transaksi.</div>`;
}

function paymentLockedView(o, title, message) {
  return `<div class="page">
    <div class="breadcrumb"><a href="#/pesanan">Pesanan Saya</a><span>›</span><span>Pembayaran</span></div>
    <div class="page-head"><h1>Pembayaran</h1><p>Order #${esc(o.id)} · ${esc(orderProduct(o).name)}</p></div>
    <div class="empty-state">
      <div class="empty-art" aria-hidden="true">🔒</div>
      <h3>${esc(title)}</h3>
      <p>${esc(message)}</p>
      <div class="success-actions">
        <a class="btn" href="#/pesanan/${encodeURIComponent(o.id)}">Kembali ke Detail Pesanan</a>
        <a class="btn btn-outline" href="#/pesanan">Pesanan Saya</a>
      </div>
    </div>
  </div>`;
}

function paymentView(id) {
  const o = state.orders.find((x) => x.id === id);
  if (!o) return notFoundView('Pesanan tidak ditemukan', 'Pesanan yang ingin dibayar tidak tersedia.', '#/pesanan', 'Kembali ke Pesanan Saya');

  if (o.status === 'cancelled') return paymentLockedView(o, 'Pembayaran tidak tersedia', 'Pesanan ini telah dibatalkan sehingga tidak dapat dibayar.');
  if (o.status === 'target') {
    const group = orderGroup(o);
    return paymentLockedView(o, 'Pembayaran belum tersedia', `Grup masih menunggu target MOQ. Saat ini ${group.collected} dari ${group.target} ${group.unit} terkumpul. Pembayaran dapat dilakukan setelah target tercapai.`);
  }
  if (o.status !== 'payment') {
    return paymentLockedView(o, 'Pesanan sudah dibayar', `Pembayaran untuk pesanan ini sudah dikonfirmasi${o.payment ? ` melalui ${o.payment.method}` : ''}. Lihat detail pesanan untuk informasi selengkapnya.`);
  }

  const p = orderProduct(o);
  const totals = orderTotals(o);
  const method = paymentUI.method;

  return `<div class="page">
    <div class="breadcrumb"><a href="#/pesanan">Pesanan Saya</a><span>›</span><a href="#/pesanan/${encodeURIComponent(o.id)}">#${esc(o.id)}</a><span>›</span><span>Pembayaran</span></div>
    <div class="page-head"><div class="page-head-row">
      <div><h1>Pembayaran</h1><p>Selesaikan pembayaran agar supplier dapat memproses pesanan grup Anda.</p></div>
      <span class="badge badge-violet">Menunggu Pembayaran</span>
    </div></div>

    <div class="payment-layout">
      <div class="pay-panel">
        <h2>Ringkasan Pembayaran</h2>
        <div class="pay-product">
          <div class="order-thumb" aria-hidden="true">${p.emoji || '📦'}</div>
          <div><h3>${esc(p.name)}</h3><p>Supplier: ${esc(p.supplier)} · ${o.qty} ${esc(p.unit)}</p></div>
        </div>
        <div class="summary-box">
          <div class="summary-row"><span>Harga per satuan</span><b>${rp(totals.unitPrice)}</b></div>
          <div class="summary-row"><span>Jumlah pesanan</span><b>${o.qty} ${esc(p.unit)}</b></div>
          <div class="summary-row"><span>Subtotal</span><b>${rp(totals.subtotal)}</b></div>
          <div class="summary-row"><span>Biaya pengiriman</span><b>${rp(totals.shipping)}</b></div>
          <div class="summary-row"><span>Biaya tambahan</span><b>${rp(totals.fee)}</b></div>
          <div class="summary-total"><span>Total pembayaran</span><b>${rp(totals.total)}</b></div>
        </div>
        <div class="pay-deadline">⏱ <span><b>Batas waktu pembayaran:</b> 25 Nov 2026, 23:59 WIB. Selesaikan sebelum waktu berakhir agar pesanan tidak dibatalkan.</span></div>
        <div class="pay-status"><span class="muted">Status transaksi</span><span class="badge badge-amber">Menunggu Pembayaran</span></div>
      </div>

      <div class="pay-panel">
        <h2>Metode Pembayaran</h2>
        <div class="pay-methods">
          ${PAY_METHODS.map((m) => `<label class="pay-method ${method === m.name ? 'selected' : ''}">
            <input type="radio" name="payMethod" value="${esc(m.name)}" ${method === m.name ? 'checked' : ''}>
            <span class="pm-info"><b>${esc(m.name)}</b><small>${esc(m.sub)}</small></span>
            <span class="pm-logo" aria-hidden="true">${m.icon}</span>
          </label>`).join('')}
        </div>
        <div class="pay-detail-box" id="payDetail">${paymentDetailHTML(method, o)}</div>
        <div class="pay-actions">
          <button class="btn btn-lg" type="button" id="payNow">Bayar Sekarang · ${rp(totals.total)}</button>
          <button class="btn btn-outline" type="button" data-action="open-methods" data-order="${esc(o.id)}">Ganti Metode Pembayaran</button>
          <a class="btn btn-ghost" href="#/pesanan/${encodeURIComponent(o.id)}">Kembali ke Detail Pesanan</a>
        </div>
        <div class="notice" style="margin-top:12px">🔒 Pembayaran pada prototype ini hanya simulasi. Tidak ada transaksi atau uang sungguhan yang diproses.</div>
      </div>
    </div>
  </div>`;
}

function paymentSuccessView(id) {
  const o = state.orders.find((x) => x.id === id);
  if (!o || !o.payment) return notFoundView('Transaksi tidak ditemukan', 'Data pembayaran untuk pesanan ini belum tersedia.', '#/pesanan', 'Kembali ke Pesanan Saya');
  const p = orderProduct(o);
  return `<div class="page">
    <div class="success-screen">
      <div class="success-icon" aria-hidden="true">✓</div>
      <h1>Pembayaran Berhasil</h1>
      <p>Simulasi pembayaran berhasil. Pesanan Anda akan diproses oleh supplier.</p>
      <div class="receipt">
        <div class="summary-row"><span>Nomor transaksi</span><b>${esc(o.payment.trx)}</b></div>
        <div class="summary-row"><span>Pesanan</span><b>#${esc(o.id)} · ${esc(p.name)}</b></div>
        <div class="summary-row"><span>Metode pembayaran</span><b>${esc(o.payment.method)}</b></div>
        <div class="summary-row"><span>Tanggal transaksi</span><b>${fmtDate(o.payment.date)}</b></div>
        <div class="summary-total"><span>Total pembayaran</span><b>${rp(o.payment.total)}</b></div>
      </div>
      <div class="success-actions">
        <a class="btn" href="#/pesanan/${encodeURIComponent(o.id)}">Lihat Pesanan</a>
        <a class="btn btn-outline" href="#/pesanan">Pesanan Saya</a>
        <a class="btn btn-ghost" href="#/beranda">Beranda</a>
      </div>
    </div>
  </div>`;
}

/* ---------- profil ---------- */
function profileView() {
  const p = state.profile;
  const ro = profileEditing ? '' : ' disabled';
  const initials = String(p.owner || 'SR').trim().split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  const types = ['Bakery / Toko Roti', 'Warung / Toko Kelontong', 'Minuman / Kafe', 'Reseller', 'Katering', 'Lainnya'];

  return `<div class="page">
    <div class="page-head"><div class="page-head-row">
      <div><h1>Profil UMKM</h1><p>Kelola informasi usaha, kontak, alamat pengiriman, dan pengaturan akun Anda.</p></div>
      ${profileEditing ? '<span class="edit-badge">Mode edit aktif</span>' : ''}
    </div></div>

    <div class="profile-layout">
      <section class="profile-card">
        <div class="profile-avatar" id="profileAvatar">${p.avatar ? `<img src="${esc(p.avatar)}" alt="Foto profil ${esc(p.business)}">` : esc(initials)}</div>
        <h2 id="profileBusinessTitle">${esc(p.business)}</h2>
        <p id="profileOwnerTitle">Pemilik: ${esc(p.owner)}</p>
        <span class="profile-chip">Akun Pembeli UMKM</span>
        <p class="profile-meta">Anggota BulkBuy sejak November 2026<br>${esc(p.city)}</p>
        <div class="profile-actions">
          <label class="btn btn-outline btn-sm avatar-upload" for="avatarInput">Ganti Foto
            <input id="avatarInput" type="file" accept="image/png,image/jpeg,image/webp" hidden>
          </label>
          ${p.avatar ? '<button class="btn btn-ghost btn-sm" type="button" data-action="remove-avatar">Hapus Foto</button>' : ''}
        </div>
      </section>

      <div>
        <form id="profileForm" class="profile-form" novalidate>
          <h2>Informasi Akun UMKM</h2>
          <p class="form-sub">${profileEditing ? 'Perbarui data di bawah lalu simpan perubahan.' : 'Tekan Edit Profil untuk memperbarui data usaha Anda.'}</p>

          <div class="form-section">
            <p class="form-section-title">Informasi Usaha</p>
            <div class="form-grid">
              <div class="field"><label for="pfBusiness">Nama UMKM <span class="req">*</span></label><input id="pfBusiness" name="business" value="${esc(p.business)}"${ro}><span class="field-error"></span></div>
              <div class="field"><label for="pfType">Jenis Usaha</label><select id="pfType" name="type"${ro}>${optionsOf(types, p.type)}</select><span class="field-error"></span></div>
              <div class="field full"><label for="pfDescription">Deskripsi singkat usaha</label><textarea id="pfDescription" name="description" maxlength="300" placeholder="Ceritakan singkat usaha Anda"${ro}>${esc(p.description)}</textarea><span class="field-hint">Maksimal 300 karakter.</span><span class="field-error"></span></div>
            </div>
          </div>

          <div class="form-section">
            <p class="form-section-title">Informasi Kontak</p>
            <div class="form-grid">
              <div class="field"><label for="pfOwner">Nama Pemilik <span class="req">*</span></label><input id="pfOwner" name="owner" value="${esc(p.owner)}"${ro}><span class="field-error"></span></div>
              <div class="field"><label for="pfPhone">Nomor Telepon <span class="req">*</span></label><input id="pfPhone" name="phone" type="tel" inputmode="tel" value="${esc(p.phone)}" placeholder="0812-3456-7890"${ro}><span class="field-error"></span></div>
              <div class="field full"><label for="pfEmail">Email <span class="req">*</span></label><input id="pfEmail" name="email" type="email" value="${esc(p.email)}"${ro}><span class="field-error"></span></div>
            </div>
          </div>

          <div class="form-section">
            <p class="form-section-title">Alamat Pengiriman</p>
            <div class="form-grid">
              <div class="field"><label for="pfCity">Kota <span class="req">*</span></label><input id="pfCity" name="city" value="${esc(p.city)}"${ro}><span class="field-error"></span></div>
              <div class="field full"><label for="pfAddress">Alamat Usaha <span class="req">*</span></label><textarea id="pfAddress" name="address"${ro}>${esc(p.address)}</textarea><span class="field-error"></span></div>
            </div>
          </div>

          <div class="form-actions">
            ${profileEditing
              ? '<button class="btn btn-outline" type="button" data-action="profile-reset">Reset</button><button class="btn" type="submit">Simpan Perubahan</button>'
              : '<button class="btn" type="button" data-action="profile-edit">Edit Profil</button>'}
          </div>
        </form>

        <section class="profile-form" style="margin-top:16px">
          <h2>Pengaturan Akun</h2>
          <p class="form-sub">Kelola keamanan akun dan sesi login Anda.</p>
          <div class="account-grid">
            <div class="account-tile">
              <h3>Kata Sandi</h3>
              <p>Ubah kata sandi secara berkala untuk menjaga keamanan akun UMKM Anda.</p>
              <button class="btn btn-outline btn-sm" type="button" data-action="change-password">Ubah Kata Sandi</button>
            </div>
            <div class="account-tile danger">
              <h3>Keluar dari Akun</h3>
              <p>Akhiri sesi login Anda di perangkat ini. Anda dapat masuk kembali kapan saja.</p>
              <button class="btn btn-danger btn-sm" type="button" data-action="logout">Keluar</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>`;
}

/* ---------- pusat bantuan ---------- */
function filteredFaqs() {
  const q = helpFilters.q.trim().toLowerCase();
  return D.faqs.filter((f) => {
    const catOk = helpFilters.category === 'all' || f.category === helpFilters.category;
    const qOk = !q || `${f.question} ${f.answer} ${f.category}`.toLowerCase().includes(q);
    return catOk && qOk;
  });
}

function helpFaqHTML() {
  const items = filteredFaqs();
  if (!items.length) {
    return `<div class="faq-empty">Tidak ada FAQ yang sesuai dengan pencarian.<br><button class="btn btn-outline btn-sm" type="button" data-action="reset-help" style="margin-top:11px">Reset Pencarian</button></div>`;
  }
  return items.map((f) => `<details class="faq-item">
    <summary><span><span class="faq-cat">${esc(f.category)}</span><br>${esc(f.question)}</span></summary>
    <p>${esc(f.answer)}</p>
  </details>`).join('');
}

function helpView() {
  return `<div class="page">
    <div class="help-hero">
      <h1>Pusat Bantuan</h1>
      <p>Temukan panduan dan jawaban untuk menggunakan BulkBuy dengan lebih mudah.</p>
      <div class="help-search">
        <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
        <input id="helpSearch" type="search" placeholder="Cari pertanyaan atau panduan..." value="${esc(helpFilters.q)}" aria-label="Cari bantuan">
      </div>
    </div>

    <div class="chip-row" style="margin-bottom:16px">
      ${['Semua', 'Mulai Belanja', 'Pembelian Bersama', 'Pesanan', 'Pembayaran', 'Pengiriman', 'Akun'].map((c) => {
        const value = c === 'Semua' ? 'all' : c;
        return `<button class="chip ${helpFilters.category === value ? 'active' : ''}" type="button" data-action="help-cat" data-cat="${esc(value)}">${esc(c)}</button>`;
      }).join('')}
    </div>

    <div class="help-features">
      <div class="help-feature"><div class="help-icon">🛒</div><h3>Mulai Belanja Grosir</h3><p>Cari produk, periksa MOQ dan harga grosir, lalu pilih grup yang sesuai kebutuhan usaha.</p></div>
      <div class="help-feature"><div class="help-icon">🤝</div><h3>Pembelian Bersama</h3><p>Gabungkan kuantitas pesanan dengan UMKM lain agar target minimum supplier tercapai.</p></div>
      <div class="help-feature"><div class="help-icon">📦</div><h3>Pantau Pesanan</h3><p>Lihat progres grup, status pesanan, dan informasi transaksi melalui menu Pesanan Saya.</p></div>
      <div class="help-feature"><div class="help-icon">💳</div><h3>Pembayaran</h3><p>Ikuti instruksi pembayaran saat grup mencapai target dan pesanan siap dibayar.</p></div>
    </div>

    <div class="section-head"><div class="section-sub"><h2>Panduan Langkah demi Langkah</h2><p>Ikuti alur penggunaan BulkBuy untuk pengalaman pertama Anda</p></div></div>
    <div class="guide-grid">
      ${D.guides.map((g) => `<article class="guide-card">
        <h3><span aria-hidden="true">${g.icon}</span>${esc(g.title)}</h3>
        <p>Langkah praktis untuk memulai.</p>
        ${g.steps.map((s, i) => `<div class="guide-step"><span class="step-no">${i + 1}</span><span>${esc(s)}</span></div>`).join('')}
      </article>`).join('')}
    </div>

    <div class="help-layout" style="margin-top:18px">
      <section class="faq-card">
        <div class="filter-head"><h2>Pertanyaan yang Sering Diajukan</h2><span class="text-sm muted" id="faqCount">${filteredFaqs().length} pertanyaan</span></div>
        <div class="faq-list" id="faqList">${helpFaqHTML()}</div>
      </section>

      <section class="faq-card">
        <h2>Hubungi Customer Support</h2>
        <p class="muted" style="font-size:12px;margin-top:-6px">Tim BulkBuy siap membantu kendala Anda pada hari kerja 08.00–17.00 WIB.</p>
        <div class="contact-grid">
          <div class="contact-card">
            <h3>✉️ Email Bantuan</h3>
            <p>Kirim detail kendala Anda ke tim support.</p>
            <a class="btn btn-outline btn-sm" href="mailto:support@bulkbuy.id">support@bulkbuy.id</a>
          </div>
          <div class="contact-card">
            <h3>💬 WhatsApp (simulasi)</h3>
            <p>Hubungi support melalui WhatsApp pada jam kerja.</p>
            <button class="btn btn-outline btn-sm" type="button" data-action="help-whatsapp">Chat WhatsApp</button>
          </div>
        </div>

        <form id="helpContactForm" class="contact-form" novalidate>
          <div class="filter-head" style="margin:14px 0 2px"><h3 style="margin:0;font-size:13px">Kirim Pesan</h3></div>
          <div class="field"><label for="hcName">Nama</label><input id="hcName" name="name" placeholder="Nama Anda"><span class="field-error"></span></div>
          <div class="field"><label for="hcEmail">Email</label><input id="hcEmail" name="email" type="email" placeholder="email@contoh.com"><span class="field-error"></span></div>
          <div class="field"><label for="hcCategory">Kategori kendala</label><select id="hcCategory" name="category"><option value="">Pilih kategori</option>${optionsOf(['Mulai Belanja', 'Pembelian Bersama', 'Pesanan', 'Pembayaran', 'Pengiriman', 'Akun'], '')}</select><span class="field-error"></span></div>
          <div class="field"><label for="hcMessage">Deskripsi masalah</label><textarea id="hcMessage" name="message" placeholder="Jelaskan kendala atau pertanyaan Anda"></textarea><span class="field-error"></span></div>
          <div class="form-actions" style="margin-top:12px"><button class="btn" type="submit">Kirim Pesan</button></div>
        </form>
      </section>
    </div>
  </div>`;
}

/* ---------- halaman tidak ditemukan ---------- */
function notFoundView(title, message, backHref, backLabel) {
  return `<div class="page">
    <div class="empty-state" style="margin-top:30px">
      <div class="empty-art" aria-hidden="true">🧭</div>
      <h3>${esc(title)}</h3>
      <p>${esc(message)}</p>
      <a class="btn" href="${esc(backHref || '#/beranda')}">${esc(backLabel || 'Kembali ke Beranda')}</a>
    </div>
  </div>`;
}
