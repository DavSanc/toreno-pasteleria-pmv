// Gestión de usuarios
// Recupera usuarios almacenados o crea un arreglo vacío
let users = [];
try {
  users = JSON.parse(localStorage.getItem('toreno_users')) || [];
} catch (e) {
  users = [];
}
// Asegura que exista un usuario administrador por defecto
if (!users.some(u => (u.email || '').toLowerCase() === 'admin@toreno.co')) {
  users.push({ name: 'Admin', email: 'admin@toreno.co', password: 'demo123' });
  localStorage.setItem('toreno_users', JSON.stringify(users));
}

// Datos estáticos para cada categoría del panel
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

const statusEl = document.getElementById('status');
const form = document.getElementById('loginForm');
const loginContainer = document.getElementById('loginContainer');

// Elementos de registro y enlace para crear cuenta
const createAccountLink = document.getElementById('createAccountLink');
const registerSection = document.getElementById('registerSection');
const registerForm = document.getElementById('registerForm');
const cancelRegister = document.getElementById('cancelRegister');

// Mostrar formulario de registro al hacer clic en "Crear usuario nuevo"
createAccountLink.addEventListener('click', (e) => {
  e.preventDefault();
  // Oculta el formulario de login y el enlace "¿No tienes cuenta?"
  document.getElementById('loginForm').classList.add('hidden');
  const createAccountContainer = document.querySelector('.create-account');
  if (createAccountContainer) {
    createAccountContainer.classList.add('hidden');
  }
  // Limpia mensajes de estado
  showStatus('', false);
  // Muestra la sección de registro
  registerSection.classList.remove('hidden');
});

// Ocultar el formulario de registro y volver al login al cancelar
cancelRegister.addEventListener('click', () => {
  // Limpia el formulario de registro
  registerForm.reset();
  // Oculta la sección de registro
  registerSection.classList.add('hidden');
  // Muestra el formulario de login y el enlace "¿No tienes cuenta?"
  document.getElementById('loginForm').classList.remove('hidden');
  const createAccountContainer = document.querySelector('.create-account');
  if (createAccountContainer) {
    createAccountContainer.classList.remove('hidden');
  }
  // Limpia mensajes de estado
  showStatus('', false);
});

// Procesar el registro de un nuevo usuario
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameVal = document.getElementById('regName').value.trim();
  const emailVal = document.getElementById('regEmail').value.trim().toLowerCase();
  const passVal = document.getElementById('regPass').value;
  // Validaciones básicas
  if (!nameVal || !emailVal || !passVal) {
    showStatus('Todos los campos son obligatorios.', false);
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)) {
    showStatus('Ingresa un correo válido.', false);
    return;
  }
  if (passVal.length < 6) {
    showStatus('La contraseña debe tener al menos 6 caracteres.', false);
    return;
  }
  // Verifica si el correo ya está registrado
  if (users.some(u => (u.email || '').toLowerCase() === emailVal)) {
    showStatus('El correo ya está registrado.', false);
    return;
  }
  // Agrega el nuevo usuario y guarda en localStorage
  users.push({ name: nameVal, email: emailVal, password: passVal });
  localStorage.setItem('toreno_users', JSON.stringify(users));
  // Muestra mensaje de éxito y vuelve al login
  showStatus('Cuenta creada exitosamente. Por favor inicia sesión.', true);
  // Limpia el formulario de registro
  registerForm.reset();
  // Oculta la sección de registro y muestra el login
  registerSection.classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  const createAccountContainer2 = document.querySelector('.create-account');
  if (createAccountContainer2) {
    createAccountContainer2.classList.remove('hidden');
  }
});

function showStatus(msg, ok = false) {
  // Si el mensaje está vacío, oculta el elemento de estado
  if (!msg) {
    statusEl.textContent = '';
    statusEl.className = 'status';
    return;
  }
  statusEl.textContent = msg;
  statusEl.className = 'status ' + (ok ? 'ok' : 'err');
}

function togglePass() {
  const input = document.getElementById('password');
  const btn = event.currentTarget;
  if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Ocultar'; }
  else { input.type = 'password'; btn.textContent = 'Mostrar'; }
}

function openWhatsApp() {
  const phone = '573001112233';
  const text = encodeURIComponent('Hola, necesito ayuda con el acceso al panel.');
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// Muestra el panel con categorías e items.
function showPanel(name) {
  // Reemplaza el contenido del body por el panel.
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

  // Delegación de clics para las tarjetas de categoría
  panel.querySelector('.categories').addEventListener('click', (e) => {
    const card = e.target.closest('.category-card');
    if (card) {
      const category = card.getAttribute('data-category');
      renderItems(category);
    }
  });

  // Botón de volver a la lista de categorías
  panel.querySelector('#btnBack').addEventListener('click', () => {
    const itemsSection = panel.querySelector('#itemsSection');
    itemsSection.style.display = 'none';
    panel.querySelector('.categories').style.display = 'grid';
    // Mostrar nuevamente el botón de cerrar sesión cuando se vuelve al panel
    const logoutBtn = panel.querySelector('#btnLogout');
    if (logoutBtn) {
      logoutBtn.style.display = '';
    }
  });

  // Botón para cerrar sesión y regresar al login
  const btnLogout = panel.querySelector('#btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      location.reload();
    });
  }

  /**
   * Rellena la sección de items según la categoría seleccionada.
   * @param {string} category
   */
  function renderItems(category) {
    // Ocultar el botón de cerrar sesión mientras se muestran los items
    const logoutBtn = panel.querySelector('#btnLogout');
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
    }

    const items = sampleData[category] || [];
    const itemsSection = panel.querySelector('#itemsSection');
    const itemsTitle = panel.querySelector('#itemsTitle');
    const itemsList = panel.querySelector('#itemsList');
    // Título con mayúscula inicial
    itemsTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    itemsList.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `<strong>${item.titulo}</strong><p>${item.descripcion}</p>`;
      itemsList.appendChild(div);
    });
    // Oculta categorías y muestra items
    panel.querySelector('.categories').style.display = 'none';
    itemsSection.style.display = 'block';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;

  // validaciones mínimas
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    showStatus('Ingresa un correo válido.', false);
    return;
  }
  if (!pass || pass.length < 6) {
    showStatus('La contraseña debe tener al menos 6 caracteres.', false);
    return;
  }

  // Busca el usuario en la lista almacenada
  const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === pass);
  if (!user) {
    showStatus('Credenciales incorrectas.', false);
    return;
  }

  // Si se marca "Recordarme", guarda el usuario en localStorage
  if (remember) {
    localStorage.setItem('toreno_demo_user', JSON.stringify({ name: user.name, email: user.email, ts: Date.now() }));
  }

  showStatus('Acceso concedido. Redirigiendo al panel…', true);
  setTimeout(() => {
    showPanel(user.name);
  }, 800);
});

// Coloca el año actual en el footer
document.getElementById('year').textContent = new Date().getFullYear();
