// ── EnerTrack · Configuración ─────────────────────────────────────────────
if (!auth.isAuthenticated()) { window.location.href = '../login.html'; }

const isAdmin = auth.getRole() === 'admin';

document.addEventListener('DOMContentLoaded', function () {
    buildSidebar('configuracion');
    initUserInfo();
    loadProfile();
    NotifSystem.init();
    setupEvents();
});

function initUserInfo() {
    const name = auth.getUsername();
    const isAdmin = auth.getRole() === 'admin';
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('userName', name);
    set('userAvatar', name.charAt(0).toUpperCase());
    set('navAvatar', name.charAt(0).toUpperCase());
    set('navUserName', name);
    set('userRole', isAdmin ? 'Administrador' : 'Usuario');
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.className = 'role-tag ' + (isAdmin ? 'admin-tag' : 'user-tag');
    // Título de página según rol
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = isAdmin ? 'Configuración del Sistema' : 'Mis Ajustes';
}

function loadProfile() {
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.value = auth.getUsername();
    const email = localStorage.getItem('enertrack_email');
    const phone = localStorage.getItem('enertrack_phone');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    if (emailEl && email) emailEl.value = email;
    if (phoneEl && phone) phoneEl.value = phone;
}

function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); sidebarOverlay.classList.toggle('active'); });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); });

    // Guardar perfil
    document.querySelectorAll('.btn-save-profile').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const email = document.getElementById('profileEmail');
            const phone = document.getElementById('profilePhone');
            if (email) localStorage.setItem('enertrack_email', email.value);
            if (phone) localStorage.setItem('enertrack_phone', phone.value);
            showToast('Perfil actualizado correctamente', 'success');
        });
    });

    // Cambiar contraseña
    const btnPass = document.getElementById('btnChangePass');
    if (btnPass) btnPass.addEventListener('click', function () {
        const curr = document.getElementById('currentPass');
        const newp = document.getElementById('newPass');
        const conf = document.getElementById('confirmPass');
        if (!curr || !curr.value) { showToast('Ingresa tu contraseña actual', 'error'); return; }
        if (!newp || newp.value.length < 6) { showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error'); return; }
        if (newp.value !== conf.value) { showToast('Las contraseñas no coinciden', 'error'); return; }
        if (curr) curr.value = '';
        if (newp) newp.value = '';
        if (conf) conf.value = '';
        showToast('Contraseña actualizada correctamente', 'success');
    });

    // Acciones del sistema
    document.querySelectorAll('.btn-system-action').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const action = this.dataset.action;
            if (action === 'export') { showToast('Exportando datos del sistema...', 'info'); setTimeout(() => showToast('Datos exportados correctamente', 'success'), 1500); }
            else if (action === 'sync') { showToast('Sincronizando dispositivos...', 'info'); setTimeout(() => showToast('Sincronización completada', 'success'), 1500); }
            else if (action === 'cache') { showToast('Caché limpiado correctamente', 'success'); }
            else if (action === 'reset') {
                if (confirm('¿Restablecer configuración? Esta acción no se puede deshacer.')) {
                    localStorage.removeItem('enertrack_email');
                    localStorage.removeItem('enertrack_phone');
                    loadProfile();
                    showToast('Configuración restablecida', 'success');
                }
            }
        });
    });

    // Toggles
    document.querySelectorAll('.toggle input').forEach(function (toggle) {
        toggle.addEventListener('change', function () {
            const label = this.closest('.setting-item').querySelector('.setting-title');
            const status = this.checked ? 'activada' : 'desactivada';
            if (label) showToast(label.textContent + ' ' + status, 'info');
        });
    });

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
    t.innerHTML = '<i class="fas ' + icon + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
