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
    document.querySelectorAll('.dropdown.show').forEach(openDropdown => openDropdown.classList.remove('show'));
  }
  const active = document.activeElement;
  if (active && active.classList && active.classList.contains('dropdown-btn') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    toggleDropdown();
  }
});

// Carga dinámica de productos destacados desde JSON
async function loadFeatured() {
  try {
    const res = await fetch('images/images_catalogo/images_catalogo.json');
    if (!res.ok) return console.warn('No se pudo cargar el catálogo');
    const items = await res.json();
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    const featured = items.slice(0, 6);
    grid.innerHTML = featured.map(item => `
      <article class="card">
        <img src="images/images_catalogo/${item.image}" alt="${item.title || 'Producto'}">
        <div class="card-body">
          <h4>${item.title || 'Sin título'}</h4>
          <p class="price">${item.price === 'X' ? 'Consulta precio' : item.price}</p>
          <a href="nuestros_productos/productos.html" class="btn card-btn">Ver catálogo</a>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  loadPasarela();
  document.querySelectorAll('.dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
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

// Carga y arranca la pasarela (marquee infinito) con imágenes del catálogo
async function loadPasarela() {
  try {
    const res = await fetch('images/images_catalogo/images_catalogo.json');
    if (!res.ok) return console.warn('No se pudo cargar el catálogo para la pasarela');
    const items = await res.json();
    const track = document.getElementById('pasarelaTrack');
    if (!track) return;
    // Elegir un conjunto razonable de imágenes (hasta 12)
    // Evitar las primeras 3 imágenes más usadas y tomar un conjunto aleatorio
    const pool = items.slice(3).filter(i => i.image).map(i => i.image);
    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    let chosen = shuffle(pool).slice(0, 12);
    if (chosen.length === 0) chosen = items.filter(i => i.image).map(i => i.image).slice(0, 6);
    if (chosen.length === 0) return;
    const itemHtml = chosen.map(img => `
      <div class="pasarela-item">
        <img src="images/images_catalogo/${img}" alt="Producto" loading="lazy">
      </div>
    `).join('');
    // Duplicar para efecto contínuo
    track.innerHTML = itemHtml + itemHtml;
    // Forzar repaint antes de añadir la animación
    void track.offsetWidth;
    track.classList.add('anim');
    // Ajustar duración en función de cantidad de items (más items -> mayor duración)
    // Reducir un poco la duración para que la pasarela vaya más rápida
    const duration = Math.max(15, Math.round(chosen.length * 3)); // segundos
    track.style.setProperty('--duration', duration + 's');
  } catch (err) {
    console.error('Error cargando pasarela:', err);
  }
}