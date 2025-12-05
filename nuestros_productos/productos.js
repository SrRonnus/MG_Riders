// productos.js — carga dinámica del catálogo desde JSON
const catalogEl = document.getElementById('catalog');
const template = document.getElementById('card-template');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

// Cambia este número por el número real de la tienda (sin + ni espacios)
const WHATSAPP_NUMBER = '593984665854';

// Directorio base para las imágenes del catálogo (solo cambiar aquí si mueves las imágenes)
const IMAGE_DIR = '../images/images_catalogo/';

// Paginación y lazy-load
const PAGE_SIZE = 20; // cambia a 10 si prefieres
let currentIndex = 0;
let products = [];
let observer = null;

// (products declarado arriba ahora)

async function loadCatalog() {
  try {
    const res = await fetch('../images/images_catalogo/images_catalogo.json');
    if (!res.ok) throw new Error('No se pudo cargar JSON');
    products = await res.json();
    currentIndex = 0;

    // inicializar observer para lazy-loading de imágenes
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset && img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '200px 0px' });
    }

    // crear el botón Cargar más
    createLoadMore();
    renderPage(products);
  } catch (err) {
    catalogEl.innerHTML = `<div class="empty">Error cargando catálogo. ${err.message}</div>`;
  }
}

function createCard(item) {
  const node = template.content.cloneNode(true);
  const img = node.querySelector('img');
  const title = node.querySelector('.card-title');
  const desc = node.querySelector('.card-desc');
  const price = node.querySelector('.price');
  const btn = node.querySelector('.ver-btn');

  // Construir ruta de imagen: si la propiedad es absoluta, usarla; si no, intentar thumbs (WebP), luego original.
  const imgProp = item.image || '';

  if (!imgProp) {
    img.src = placeholderDataURI(item.title || item.id);
  } else if (/^https?:\/\//.test(imgProp)) {
    img.src = imgProp;
    img.onerror = () => {
      img.src = placeholderDataURI(item.title || item.id);
    };
  } else {
    // Si `image` contiene una ruta completa (incluye '/'), mantener compatibilidad.
    // De lo contrario asumimos que es solo el nombre de archivo y usamos IMAGE_DIR.
    let filename = imgProp;
    if (imgProp.includes('/')) {
      const rel = imgProp.replace(/^\/+/, '');
      const parts = rel.split('/');
      filename = parts.pop();
    }

    const thumbPath = `${IMAGE_DIR}thumbs/${filename}`; // thumbnail preferida (esperamos .webp)
    const originalPath = `${IMAGE_DIR}${filename}`;

    // Inicialmente mostramos placeholder y deferimos la carga real usando data-src.
    img.src = placeholderDataURI(item.title || item.id);
    img.dataset.src = thumbPath;
    img.dataset.attempt = 'thumb';
    img.loading = 'lazy';

    img.onerror = function () {
      if (this.dataset.attempt === 'thumb') {
        this.dataset.attempt = 'original';
        // intentar original inmediatamente
        this.src = originalPath;
        // asegurar que si falla otra vez se reemplace por placeholder
      } else if (this.dataset.attempt === 'original') {
        this.dataset.attempt = 'fallback';
        this.src = placeholderDataURI(item.title || item.id);
      }
    };

    // observar para lazy-load
    if (observer) observer.observe(img);
  }

  img.alt = item.title || 'Producto';
  title.textContent = item.title || 'Sin título';
  desc.textContent = item.description || '';
  price.textContent = item.price ? `USD ${item.price}` : '';

  // Construir enlace de contacto: usar `item.link` si existe, si no generar uno hacia WhatsApp
  btn.href = buildContactLink(item);
  btn.textContent = item.link ? 'Ver' : 'Contactar';

  return node;
}

// Crear y controlar el botón "Cargar más"
function createLoadMore() {
  let wrap = document.getElementById('load-more-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'load-more-wrap';
    wrap.style.textAlign = 'center';
    wrap.style.margin = '18px 0';
    const btn = document.createElement('button');
    btn.id = 'load-more';
    btn.textContent = 'Cargar más';
    btn.className = 'load-more-btn';
    btn.addEventListener('click', () => {
      renderPage(products);
    });
    wrap.appendChild(btn);
    catalogEl.parentNode.insertBefore(wrap, catalogEl.nextSibling);
  }
}

function renderPage(list) {
  // Si se está filtrando (list diferente que products), no paginar
  if (!list) list = products;
  if (list !== products) {
    render(list);
    const wrap = document.getElementById('load-more-wrap');
    if (wrap) wrap.style.display = 'none';
    return;
  }

  const slice = list.slice(currentIndex, currentIndex + PAGE_SIZE);
  if (currentIndex === 0) catalogEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  slice.forEach((p) => frag.appendChild(createCard(p)));
  catalogEl.appendChild(frag);
  currentIndex += slice.length;

  const wrap = document.getElementById('load-more-wrap');
  if (wrap) wrap.style.display = currentIndex < list.length ? 'block' : 'none';
}

function buildContactLink(item) {
  if (item.link && item.link.trim()) return item.link;
  const title = item.title || item.id || 'producto';
  const text = `Me interesa: ${title}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function placeholderDataURI(title) {
  const safe = (title || 'Producto')
    .slice(0, 30)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'>` +
    `<rect width='100%' height='100%' fill='%230b0b0b'/>` +
    `<rect x='0' y='0' width='100%' height='80' fill='%23c70000' opacity='0.95'/>` +
    `<text x='20' y='50' font-family='Arial, Helvetica, sans-serif' font-size='28' fill='%23ffffff'>MG Riders</text>` +
    `<text x='20' y='110' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='%23bbbbbb'>${safe}</text>` +
    `</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function render(list) {
  catalogEl.innerHTML = '';
  if (!list || list.length === 0) {
    catalogEl.innerHTML = '<div class="empty">No hay productos para mostrar.</div>';
    return;
  }

  // render completo (usado por filtros)
  const frag = document.createDocumentFragment();
  list.forEach((p) => frag.appendChild(createCard(p)));
  catalogEl.appendChild(frag);
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  let list = products.slice();

  if (q) {
    list = list.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.price || '').toString().includes(q)
    );
  }

  const order = sortSelect.value;
  if (order === 'price-asc') list.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
  if (order === 'price-desc') list.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
  // Si hay consulta, mostramos resultados completos sin paginación; si no, volvemos a paginar
  if (q) {
    render(list);
  } else {
    currentIndex = 0;
    renderPage(products);
  }
}

searchInput.addEventListener('input', () => {
  applyFilters();
});

sortSelect.addEventListener('change', () => {
  applyFilters();
});

// Inicializar
loadCatalog();
