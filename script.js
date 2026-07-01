/* ===========================================================
   DONUT NUZZ — SCRIPT
   Struktur: Data Produk -> State -> Render Produk -> Pencarian &
   Filter & Sorting -> Keranjang -> Navigasi Halaman -> Toast ->
   Dark Mode -> Hero Slider -> Init
=========================================================== */

/* ---------- DATA PRODUK ---------- */
const PRODUCTS = [
  { id:1, name:"Coklat Klasik",      price:12000, rating:4.8, category:"klasik",  desc:"Donat coklat premium.",                                img:"foto/Two Chocolate Donuts.webp" },
  { id:2, name:"Sugar Ice",          price:14500, rating:4.7, category:"buah",    desc:"Tekstur empuk dengan taburan gula halus yang manis.",  img:"foto/Sugar Ice.jpg" },
  { id:3, name:"Heaven Berry",       price:15000, rating:4.9, category:"premium", desc:"Perpaduan rasa manis dan asam stroberi yang segar.",   img:"foto/Heaven Berry.jpg" },
  { id:4, name:"Strawberry Rainbow", price:12500, rating:4.6, category:"buah",    desc:"Glaze stroberi dengan sprinkle warna-warni.",           img:"foto/strawberry rainbow.jpg" },
  { id:5, name:"Tiramisu",           price:16000, rating:4.8, category:"premium", desc:"Perpaduan kopi dan krim mascarpone lembut.",            img:"foto/Donuts With Tiramisu Glaze, Donut, Tiramisu Glaze, Food Illustrations PNG Transparent Clipart Image and PSD File for Free Download.jpg" },
  { id:6, name:"Oreo Crunch",        price:15500, rating:4.7, category:"coklat",  desc:"Topping oreo renyah di atas glaze coklat.",            img:"foto/oreo crunch.jpg" },
  { id:7, name:"Vanilla Cream",      price:13500, rating:4.5, category:"klasik",  desc:"Isian krim vanila yang lembut dan manis.",             img:"foto/Vanilla Glazed Baked Cake Donuts.jpg" },
  { id:8, name:"Blueberry Glaze",    price:14000, rating:4.6, category:"buah",    desc:"Glaze blueberry asam segar yang menyegarkan.",         img:"foto/blueberry glazed.jpg" },
];

/* ---------- STATE ---------- */
let cart = [];
let activeCategory = "semua";
let activeSort = "default";
let searchQuery = "";

/* ---------- HELPER ---------- */
const formatRupiah = (n) => "Rp" + n.toLocaleString("id-ID");
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- RENDER PRODUK ---------- */
function getFilteredProducts() {
  let list = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === "semua" || p.category === activeCategory;
    const matchSearch   = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
  if (activeSort === "termurah") list = list.slice().sort((a,b) => a.price - b.price);
  if (activeSort === "termahal") list = list.slice().sort((a,b) => b.price - a.price);
  if (activeSort === "rating")   list = list.slice().sort((a,b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const grid       = $("#productGrid");
  const emptyState = $("#emptyState");
  const list       = getFilteredProducts();

  if (list.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }
  emptyState.classList.add("d-none");

  grid.innerHTML = list.map((p, i) => `
    <div class="dd-product-card" style="animation-delay:${i * 0.05}s">
      <div class="dd-product-photo">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <span class="dd-rating-badge"><i class="fa-solid fa-star"></i> ${p.rating}</span>
      </div>
      <div class="dd-product-body">
        <h3 class="dd-product-name">${p.name}</h3>
        <p class="dd-product-desc">${p.desc}</p>
        <div class="dd-product-footer">
          <span class="dd-product-price">${formatRupiah(p.price)}</span>
          <button class="dd-add-btn" data-id="${p.id}">Tambah</button>
        </div>
      </div>
    </div>
  `).join("");

  $$(".dd-add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id), btn));
  });
}

/* ---------- KERANJANG ---------- */
function addToCart(id, btnEl) {
  const product  = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  }

  updateCartBadge();
  renderOrderPage();
  showToast(`${product.name} ditambahkan ke keranjang`);

  if (btnEl) {
    btnEl.classList.add("added");
    btnEl.textContent = "✓";
    setTimeout(() => { btnEl.classList.remove("added"); btnEl.textContent = "Tambah"; }, 900);
  }
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  renderOrderPage();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartBadge();
  renderOrderPage();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = $("#cartBadge");
  badge.textContent = totalItems;
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
}

function renderOrderPage() {
  const orderList  = $("#orderList");
  const subtotal   = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceFee = subtotal > 0 ? 2000 : 0;
  const total      = subtotal + serviceFee;

  if (cart.length === 0) {
    orderList.innerHTML = `<p class="dd-empty-order"><i class="fa-solid fa-box-open fa-2x"></i><br><br>Belum ada pesanan. Yuk pilih donat favoritmu!</p>`;
  } else {
    orderList.innerHTML = cart.map(item => `
      <div class="dd-order-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="dd-order-item-info">
          <h4>${item.name}</h4>
          <span>${formatRupiah(item.price)}</span>
        </div>
        <div class="dd-order-qty">
          <button data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-id="${item.id}">+</button>
          <button class="dd-order-remove" data-action="remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join("");

    orderList.querySelectorAll("button[data-action]").forEach(btn => {
      const id     = Number(btn.dataset.id);
      const action = btn.dataset.action;
      btn.addEventListener("click", () => {
        if (action === "inc")    changeQty(id, 1);
        if (action === "dec")    changeQty(id, -1);
        if (action === "remove") removeFromCart(id);
      });
    });
  }

  $("#subtotalValue").textContent = formatRupiah(subtotal);
  $("#serviceValue").textContent  = formatRupiah(serviceFee);
  $("#totalValue").textContent    = formatRupiah(total);
}

/* ---------- CHECKOUT ---------- */
$("#checkoutBtn")?.addEventListener("click", () => {
  if (cart.length === 0) { showToast("Keranjang masih kosong"); return; }
  showLoading(() => {
    showToast("Pesanan berhasil dibuat! Terima kasih 🍩");
    cart = [];
    updateCartBadge();
    renderOrderPage();
  });
});

/* ---------- PENCARIAN, FILTER, SORTING ---------- */
$("#searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

$("#categoryChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".dd-chip");
  if (!chip) return;
  $$(".dd-chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  activeCategory = chip.dataset.category;
  renderProducts();
});

$("#sortSelect").addEventListener("change", (e) => {
  activeSort = e.target.value;
  renderProducts();
});

$("#categoryToggle").addEventListener("click", (e) => {
  e.preventDefault();
  $("#filterBar").classList.toggle("open");
});

/* ---------- NAVIGASI HALAMAN ---------- */
function goToPage(pageName) {
  $$(".dd-page").forEach(p => p.classList.add("d-none"));
  $(`#page-${pageName}`).classList.remove("d-none");
  $$(".dd-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-page]").forEach(el => {
  el.addEventListener("click", (e) => {
    if (el.tagName === "A") e.preventDefault();
    goToPage(el.dataset.page);
  });
});

/* ---------- TOAST ---------- */
function showToast(message) {
  const wrapper = $("#toastWrapper");
  const toast   = document.createElement("div");
  toast.className = "dd-toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  wrapper.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

/* ---------- LOADING ANIMATION ---------- */
function showLoading(callback) {
  const bar = $("#loadingBar");
  bar.style.width = "0%";
  bar.classList.add("active");
  requestAnimationFrame(() => { bar.style.width = "80%"; });
  setTimeout(() => {
    bar.style.width = "100%";
    setTimeout(() => {
      bar.classList.remove("active");
      bar.style.width = "0%";
      if (callback) callback();
    }, 250);
  }, 500);
}

/* ---------- DARK MODE ---------- */
const themeToggle = $("#themeToggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.innerHTML = theme === "dark"
    ? `<i class="fa-solid fa-sun"></i>`
    : `<i class="fa-solid fa-moon"></i>`;
}
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(current);
});

/* ---------- HERO SLIDER ---------- */
const dots = $$(".dot");
let currentSlide = 0;
function setSlide(index) {
  currentSlide = index;
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
}
dots.forEach(dot => dot.addEventListener("click", () => setSlide(Number(dot.dataset.slide))));
setInterval(() => setSlide((currentSlide + 1) % dots.length), 4000);

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderOrderPage();
  updateCartBadge();
});
