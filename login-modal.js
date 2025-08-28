// ---util: asegura admin por defecto en localStorage
(function ensureAdmin() {
    try{
        let users = JSON.parse(localStorage.getItem('toreno_users')) || [];
        if(!users.some(u => (u.email || '').toLowerCase() === 'admin@toreno.co')) {
            users.push({ name: 'Admin', email: 'admin@toreno.co', password: 'demo123'});
            localStorage.setItem('toreno_users', JSON.stringify(users));
        }
    } catch (e) {}
} )();

const modal      = document.getElementById('loginModal');
const openBtn    = document.getElementById('openLoginModal');
const closeBtn   = document.getElementById('closeLoginModal');
const form       = document.getElementById('loginModalForm');
const statusBox  = document.getElementById('modalStatus');
const emailInput = document.getElementById('m_email');
const passInput  = document.getElementById('m_password');
const rememberCb = document.getElementById('m_remember');
const togglePass = document.getElementById('m_togglePass');
const forgotLink = document.getElementById('m_forgot');

let lastFocused = null;

function showStatus(msg, ok=false){
    if(!msg) {
        statusBox.textContent= '';
        statusBox.className='status';
        return;
    }
    statusBox.textContent = msg;
    statusBox.className = 'status ' + (ok ? 'ok' : 'err');
    if(!ok) statusBox.focus?.();
}

function isValidEmail(v){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v).trim()); }

function openModal(e){
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    // seed email si existe sesión

    try{
        const saved = JSON.parse(localStorage.getItem('toreno_demo_user'));
        if (saved) emailInput.value = saved.email || '';
    } catch(e){}
    setTimeout(() => emailInput.focus(), 0);
    document.addEventListener('keydown', onKeyDown);

}
function closeModal(e){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeyDown);
    showStatus('', false);
    if(lastFocused) lastFocused.focus();
}

function onKeyDown(ev){
    if(ev.key === 'Escape') closeModal();
}
// Cerrar si clic fuera del cuadro

modal.addEventListener('click', (ev) => {
    if(ev.target === modal) closeModal();

});
if(openBtn) openBtn.addEventListener('click', openModal);
if(closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

// Toggle pass
if (togglePass) {
  togglePass.addEventListener('click', () => {
    const showing = passInput.type === 'password';
    passInput.type = showing ? 'text' : 'password';
    togglePass.textContent = showing ? 'Ocultar' : 'Mostrar';
  });
}

// Forgot (PMV)
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Función en construcción para el PMV.');
  });
}

// Submit
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const pass  = passInput.value;

    if (!isValidEmail(email)) { showStatus('Ingresa un correo válido.', false); return; }
    if (!pass || pass.length < 6) { showStatus('La contraseña debe tener al menos 6 caracteres.', false); return; }

    let users = [];
    try { users = JSON.parse(localStorage.getItem('toreno_users')) || []; } catch(e) {}

    const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === pass);
    if (!user) { showStatus('Credenciales incorrectas.', false); return; }

    // Guardar sesión ligera (usamos ts para caducidad de 7 días)
    localStorage.setItem('toreno_demo_user', JSON.stringify({ name: user.name, email: user.email, ts: Date.now() }));

    showStatus('Acceso concedido. Redirigiendo…', true);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
  });
}
