// =============================
//  Toreno PMV · Login/Registro
// =============================

// --- Helpers de almacenamiento seguro (sin romper si el navegador bloquea localStorage)
const KEYS = {
  USERS: 'toreno_users',
  SESSION: 'toreno_demo_user',
};

const readJSON = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};
const writeJSON = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};
const removeKey = (k) => {
  try { localStorage.removeItem(k); } catch {}
};

// --- Estado en memoria
let users = readJSON(KEYS.USERS, []);

// Admin por defecto (si no existe)
if (!users.some(u => (u.email || '').toLowerCase() === 'admin@toreno.co')) {
  users.push({ name: 'Admin', email: 'admin@toreno.co', password: 'demo123' });
  writeJSON(KEYS.USERS, users);
}

// --- Datos demo de panel
const sampleData = {
  productos: [
    { titulo: 'Torta de Chocolate', descripcion: 'Bizcocho de chocolate con relleno de ganache.' },
    { titulo: 'Cheesecake', descripcion: 'Pastel de queso cremoso con base de galleta.' },
    { titulo: 'Cupcake Vainilla', descripcion: 'Cupcake de vainilla con glaseado de mantequilla.' }
  ],
  inventarios: [
    { titulo: 'Harina', descripcion: 'Harina de trigo – 50 kg disponibles.' },
    { titulo: 'Azúcar', descripcion: 'Azúcar blanca – 30 kg disponibles.' },
    { titulo: 'Huevos', descripcion: 'Huevos frescos – 20 docenas.' }
  ],
  pedidos: [
    { titulo: 'Pedido #001', descripcion: 'Torta de bodas para el 15/08.' },
    { titulo: 'Pedido #002', descripcion: 'Docena de cupcakes sabor chocolate.' },
    { titulo: 'Pedido #003', descripcion: 'Cheesecake familiar para entrega el 20/08.' }
  ]
};

// --- Query de elementos
const statusEl = document.getElementById('status');
const form = document.getElementById('loginForm');
const createAccountLink = document.getElementById('createAccountLink');
const registerSection = document.getElementById('registerSection');
const registerForm = document.getElementById('registerForm');
const cancelRegister = document.getElementById('cancelRegister');
const togglePassBtn = document.getElementById('togglePassBtn');
const forgotLink = document.getElementById('forgotLink');
const waSupport = document.getElementById('waSupport');

// --- Utilidades UI
function showStatus(msg, ok = false) {
  if (!msg) {
    statusEl.textContent = '';
    statusEl.className = 'status';
    return;
  }
  statusEl.textContent = msg;
  statusEl.className = 'status ' + (ok ? 'ok' : 'err');
  // Accesibilidad: mover el foco al mensaje en errores
  if (!ok) statusEl.focus?.();
}

const isValidEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v).trim());

// --- Toggle contraseña
togglePassBtn.addEventListener('click', () => {
  const input = document.getElementById('password');
  const showing = input.type === 'password';
  input.type = showing ? 'text' : 'password';
  togglePassBtn.textContent = showing ? 'Ocultar' : 'Mostrar';
});

// --- Forgot password (simulado PMV)
forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Función en construcción para el PMV.');
});

// --- WhatsApp soporte
waSupport.addEventListener('click', (e) => {
  e.preventDefault();
  const phone = '573001112233';
  const text = encodeURIComponent('Hola, necesito ayuda con el acceso al panel.');
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
});

// --- Navegación registro/login
createAccountLink.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginForm').classList.add('hidden');
  document.querySelector('.create-account')?.classList.add('hidden');
  showStatus('', false);
  registerSection.classList.remove('hidden');
  registerSection.setAttribute('aria-hidden', 'false');
});

cancelRegister.addEventListener('click', () => {
  registerForm.reset();
  registerSection.classList.add('hidden');
  registerSection.setAttribute('aria-hidden', 'true');
  document.getElementById('loginForm').classList.remove('hidden');
  document.querySelector('.create-account')?.classList.remove('hidden');
  showStatus('', false);
});

// --- Registro
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const first = document.getElementById('regFirst').value.trim();
  const last  = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('regPass').value;

  if (!first || !last || !email || !pass) {
    showStatus('Todos los campos son obligatorios.', false);
    return;
  }
  if (!isValidEmail(email)) {
    showStatus('Ingresa un correo válido.', false);
    return;
  }
  if (pass.length < 6) {
    showStatus('La contraseña debe tener al menos 6 caracteres.', false);
    return;
  }
  if (users.some(u => (u.email || '').toLowerCase() === email)) {
    showStatus('El correo ya está registrado.', false);
    return;
  }

  const name = `${first} ${last}`.trim();
  users.push({ name, email, password: pass });
  writeJSON(KEYS.USERS, users);

  showStatus('Cuenta creada exitosamente. Por favor inicia sesión.', true);
  registerForm.reset();
  registerSection.classList.add('hidden');
  registerSection.setAttribute('aria-hidden', 'true');
  document.getElementById('loginForm').classList.remove('hidden');
  document.querySelector('.create-account')?.classList.remove('hidden');
});

// --- Login
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;

  if (!isValidEmail(email)) {
    showStatus('Ingresa un correo válido.', false);
    return;
  }
  if (!pass || pass.length < 6) {
    showStatus('La contraseña debe tener al menos 6 caracteres.', false);
    return;
  }

  const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === pass);
  if (!user) {
    showStatus('Credenciales incorrectas.', false);
    return;
  }

  if (remember) {
    writeJSON(KEYS.SESSION, { name: user.name, email: user.email, ts: Date.now() });
  } else {
    removeKey(KEYS.SESSION);
  }

  showStatus('Acceso concedido. Redirigiendo al panel…', true);
  setTimeout(() => showPanel(user.name), 600);
});

// --- Auto login si hay sesión guardada
(function autologinIfRemembered() {
  const s = readJSON(KEYS.SESSION, null);
  if (s && s.name && s.email) {
    showPanel(s.name);
  }
})();

// --- Año dinámico
document.getElementById('year').textContent = new Date().getFullYear();

// ============
//   PANEL DEMO
// ============
function showPanel(name) {
  document.body.innerHTML = '';
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h2>Panel</h2>
      <button id="btnLogout" class="logout-btn">Cerrar sesión</button>
    </div>
    <p>Bienvenido, ${name}. Selecciona una categoría para ver la información.</p>
    <div class="categories">
      <div class="category-card" data-category="productos">
        <h3>Productos</h3>
        <p>Tres productos destacados</p>
      </div>
      <div class="category-card" data-category="inventarios">
        <h3>Inventarios</h3>
        <p>Materiales disponibles</p>
      </div>
      <div class="category-card" data-category="pedidos">
        <h3>Pedidos</h3>
        <p>Órdenes recientes</p>
      </div>
    </div>
    <div id="itemsSection" class="items" style="display:none;">
      <button id="btnBack" class="back-btn">← Volver</button>
      <h3 id="itemsTitle"></h3>
      <div id="itemsList"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // eventos del panel
  panel.querySelector('.categories').addEventListener('click', (e) => {
    const card = e.target.closest('.category-card');
    if (card) renderItems(card.getAttribute('data-category'));
  });

  panel.querySelector('#btnBack').addEventListener('click', () => {
    panel.querySelector('#itemsSection').style.display = 'none';
    panel.querySelector('.categories').style.display = 'grid';
    panel.querySelector('#btnLogout').style.display = '';
  });

  panel.querySelector('#btnLogout').addEventListener('click', () => {
    removeKey(KEYS.SESSION);
    location.reload();
  });

  function renderItems(category) {
    panel.querySelector('#btnLogout').style.display = 'none';
    const items = sampleData[category] || [];
    const itemsSection = panel.querySelector('#itemsSection');
    const itemsTitle = panel.querySelector('#itemsTitle');
    const itemsList = panel.querySelector('#itemsList');

    itemsTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    itemsList.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `<strong>${item.titulo}</strong><p>${item.descripcion}</p>`;
      itemsList.appendChild(div);
    });

    panel.querySelector('.categories').style.display = 'none';
    itemsSection.style.display = 'block';
  }
}
