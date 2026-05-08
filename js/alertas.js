// ── EnerTrack · Alertas ────────────────────────────────────────────────────
if (!auth.isAuthenticated()) { window.location.href = '../login.html'; }

const isAdmin = auth.getRole() === 'admin';
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function () {
    buildSidebar('alertas');
    initUserInfo();
    updateStats();
    loadAlerts();
    NotifSystem.init();
    setupEvents();
});

function initUserInfo() {
    const name = auth.getUsername();
    const initial = name.charAt(0).toUpperCase();
    const isAdmin = auth.getRole() === 'admin';
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('userName', name);
    set('userAvatar', initial);
    set('navAvatar', initial);
    set('navUserName', name);
    set('userRole', isAdmin ? 'Administrador' : 'Usuario');
    // Aplicar clase de rol al badge
    const roleEl = document.getElementById('userRole');
    if (roleEl) {
        roleEl.className = 'role-tag ' + (isAdmin ? 'admin-tag' : 'user-tag');
    }
}

function updateStats() {
    const critical = EnerTrackData.alerts.filter(a => a.type === 'critical').length;
    const warning  = EnerTrackData.alerts.filter(a => a.type === 'warning').length;
    const info     = EnerTrackData.alerts.filter(a => a.type === 'info').length;
    const el = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('activeAlerts', critical + warning);
    el('criticalAlerts', critical);
    el('warningAlerts', warning);
    el('infoAlerts', info);
}

function loadAlerts() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    container.innerHTML = '';
    let list = [...EnerTrackData.alerts];
    if (currentFilter !== 'all') list = list.filter(a => a.type === currentFilter);
    if (!list.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">No hay alertas en esta categoría</p>';
        return;
    }
    list.forEach(function (a) {
        const icons = { critical:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
        const labels = { critical:'Crítica', high:'Alta', medium:'Media', low:'Baja' };
        const div = document.createElement('div');
        div.className = 'alert-card alert-' + a.type;
        div.innerHTML = `
            <div class="alert-card-icon"><i class="fas ${icons[a.type] || 'fa-bell'}"></i></div>
            <div class="alert-card-content">
                <div class="alert-card-header">
                    <h3>${a.title}</h3>
                    <span class="alert-priority priority-${a.priority}">${labels[a.priority] || a.priority}</span>
                </div>
                <p class="alert-card-message">${a.message}</p>
                <div class="alert-card-footer">
                    <span class="alert-device"><i class="fas fa-microchip"></i> ${a.device}</span>
                    <span class="alert-time"><i class="fas fa-clock"></i> ${relativeTime(a.timestamp)}</span>
                </div>
            </div>
            <button class="alert-dismiss" onclick="dismissAlert(${a.id})" title="Descartar"><i class="fas fa-times"></i></button>`;
        container.appendChild(div);
    });
}

function dismissAlert(id) {
    EnerTrackData.alerts = EnerTrackData.alerts.filter(a => a.id !== id);
    updateStats();
    loadAlerts();
    showToast('Alerta descartada', 'success');
}

function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');
    const markAllRead    = document.getElementById('markAllRead');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); sidebarOverlay.classList.toggle('active'); });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); });

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadAlerts();
        });
    });

    if (markAllRead) markAllRead.addEventListener('click', function () {
        EnerTrackData.alerts = [];
        updateStats(); loadAlerts();
        NotifSystem.init();
        showToast('Todas las alertas marcadas como leídas', 'success');
    });

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

function relativeTime(str) {
    const diff = Date.now() - new Date(str).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return 'Hace ' + m + ' min';
    const h = Math.floor(m / 60);
    if (h < 24) return 'Hace ' + h + ' h';
    return new Date(str).toLocaleDateString('es-ES', { month:'short', day:'numeric' });
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    t.innerHTML = '<i class="fas ' + icon + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
