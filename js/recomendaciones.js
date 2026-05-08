// ── EnerTrack · Recomendaciones ───────────────────────────────────────────
if (!auth.isAuthenticated()) { window.location.href = '../login.html'; }

const isAdmin = auth.getRole() === 'admin';
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function () {
    buildSidebar('recomendaciones');
    initUserInfo();
    loadRecommendations();
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
}

function loadRecommendations() {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;
    container.innerHTML = '';
    let list = [...EnerTrackData.recommendations];
    if (currentFilter !== 'all') list = list.filter(r => r.impact === currentFilter);
    if (!list.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">No hay recomendaciones en esta categoría</p>';
        return;
    }
    const colors = { high:'#ef4444', medium:'#f59e0b', low:'#3b82f6' };
    const labels = { high:'Alto Impacto', medium:'Medio Impacto', low:'Bajo Impacto' };
    list.forEach(function (r) {
        const div = document.createElement('div');
        div.className = 'recommendation-card impact-' + r.impact;
        div.innerHTML = `
            <div class="recommendation-header">
                <div class="recommendation-icon"><i class="fas fa-lightbulb"></i></div>
                <span class="impact-badge impact-${r.impact}">${labels[r.impact]}</span>
            </div>
            <h3 class="recommendation-title">${r.title}</h3>
            <p class="recommendation-description">${r.description}</p>
            <div class="recommendation-savings">
                <div class="savings-icon"><i class="fas fa-piggy-bank"></i></div>
                <div class="savings-content">
                    <div class="savings-label">Ahorro Estimado</div>
                    <div class="savings-value">${r.savings}</div>
                </div>
            </div>
            <span class="recommendation-category"><i class="fas fa-tag"></i> ${r.category}</span>
            <div class="recommendation-actions">
                <button class="btn-apply" onclick="applyRec(${r.id}, '${r.title}')">
                    <i class="fas fa-check"></i> Aplicar Recomendación
                </button>
                <button class="btn-dismiss" onclick="dismissRec(${r.id})" title="Descartar">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;
        container.appendChild(div);
    });
}

function applyRec(id, title) {
    showToast('Recomendación aplicada: ' + title, 'success');
}

function dismissRec(id) {
    EnerTrackData.recommendations = EnerTrackData.recommendations.filter(r => r.id !== id);
    loadRecommendations();
    showToast('Recomendación descartada', 'info');
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

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadRecommendations();
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
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    t.innerHTML = '<i class="fas ' + icon + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
