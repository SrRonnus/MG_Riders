function toggleDropdown() {
  const menu = document.getElementById('menuDropdown');
  if (!menu) return;
  menu.classList.toggle('show');
  const btn = menu.querySelector('.dropdown-btn');
  if (btn) btn.setAttribute('aria-expanded', menu.classList.contains('show'));
}

// Cierra el menú si se hace clic fuera
document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.show').forEach(openDropdown => {
      openDropdown.classList.remove('show');
      const btn = openDropdown.querySelector('.dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
});

// Cerrar con Escape y navegación por teclado para el botón
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.dropdown.show').forEach((openDropdown) => {
      openDropdown.classList.remove('show');
      const btn = openDropdown.querySelector('.dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
  const active = document.activeElement;
  if (active && active.classList && active.classList.contains('dropdown-btn') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    toggleDropdown();
  }
});

const CATALOG_URL = 'images/images_catalogo/images_catalogo.json';

/** Obtiene el catálogo una sola vez; reutilizable por destacados y pasarela */
async function fetchCatalog() {
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Error cargando catálogo:', err);
    return null;
  }
}

/** Renderiza productos destacados (usa datos ya cargados) */
function renderFeatured(items) {
  const grid = document.getElementById('productsGrid');
  if (!grid || !items || !items.length) return;
  const featured = items.slice(0, 6);
  grid.innerHTML = featured.map(item => `
    <article class="card">
      <img src="images/images_catalogo/${item.image}" alt="${item.title || 'Producto'}">
      <div class="card-body">
        <h4>${item.title || 'Sin título'}</h4>
        <p class="price">Precio a consultar</p>
        <a href="nuestros_productos/productos.html" class="btn card-btn">Ver catálogo</a>
      </div>
    </article>
  `).join('');
}

/** Inicializa la pasarela con los datos del catálogo ya cargados */
function initPasarela(items) {
  const track = document.getElementById('pasarelaTrack');
  if (!track || !items || !items.length) return;
  const pool = items.slice(3).filter(i => i.image).map(i => i.image);
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  let chosen = shuffle([...pool]).slice(0, 12);
  if (chosen.length === 0) chosen = items.filter(i => i.image).map(i => i.image).slice(0, 6);
  if (chosen.length === 0) return;
  const itemHtml = chosen.map(img => `
    <div class="pasarela-item">
      <img src="images/images_catalogo/${img}" alt="Producto" loading="lazy">
    </div>
  `).join('');
  track.innerHTML = itemHtml + itemHtml;
  void track.offsetWidth;
  track.classList.add('anim');
  const duration = Math.max(15, Math.round(chosen.length * 3));
  track.style.setProperty('--duration', duration + 's');
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  const items = await fetchCatalog();
  if (items) {
    renderFeatured(items);
    initPasarela(items);
  }
});

// FAQ accordion
document.addEventListener('click', (e) => {
  const q = e.target.closest('.faq-q');
  if (q) {
    const expanded = q.getAttribute('aria-expanded') === 'true';
    q.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }
});

// Back to top behavior
const backBtn = document.getElementById('backToTop');
if (backBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backBtn.classList.add('show'); else backBtn.classList.remove('show');
  });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
