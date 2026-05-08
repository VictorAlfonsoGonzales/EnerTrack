// ── EnerTrack · Auth Manager ───────────────────────────────────────────────
class AuthManager {
    constructor() { this.sessionKey = 'enertrack_session'; }

    isAuthenticated() {
        try { return !!localStorage.getItem(this.sessionKey); }
        catch (_) { return false; }
    }

    getSession() {
        try { return JSON.parse(localStorage.getItem(this.sessionKey)); }
        catch (_) { return null; }
    }

    hasRole(role) {
        const s = this.getSession();
        return s && s.role === role;
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.href = '../login.html';
    }

    protectPage(requiredRole) {
        if (!this.isAuthenticated()) { window.location.href = '../login.html'; return false; }
        if (requiredRole && !this.hasRole(requiredRole)) { window.location.href = '../login.html'; return false; }
        return true;
    }

    getUsername() { const s = this.getSession(); return s ? s.username : ''; }
    getRole()     { const s = this.getSession(); return s ? s.role : ''; }
}

const auth = new AuthManager();

// ── Sidebar dinámico según rol ─────────────────────────────────────────────
// Llama a esta función desde cada módulo secundario pasando la página activa.
// activePage: 'dispositivos' | 'analisis' | 'alertas' | 'recomendaciones' | 'configuracion'
function buildSidebar(activePage) {
    const sidebarNav     = document.getElementById('sidebarNav');
    const sidebarSubtitle = document.getElementById('sidebarSubtitle');
    if (!sidebarNav) return;

    const isAdmin = auth.getRole() === 'admin';

    // Subtítulo
    if (sidebarSubtitle) {
        sidebarSubtitle.textContent = isAdmin ? 'Administrador' : 'Mi Hogar';
    }

    // Definir menús según rol
    if (isAdmin) {
        sidebarNav.innerHTML = `
            <div class="nav-section">
                <div class="nav-section-title">Principal</div>
                <a href="dashboard-admin.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                    <i class="fas fa-chart-line"></i><span>Dashboard Global</span>
                </a>
                <a href="dispositivos.html" class="nav-item ${activePage === 'dispositivos' ? 'active' : ''}">
                    <i class="fas fa-microchip"></i><span>Dispositivos</span>
                </a>
                <a href="analisis.html" class="nav-item ${activePage === 'analisis' ? 'active' : ''}">
                    <i class="fas fa-chart-bar"></i><span>Análisis</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Gestión</div>
                <a href="alertas.html" class="nav-item ${activePage === 'alertas' ? 'active' : ''}">
                    <i class="fas fa-bell"></i><span>Alertas</span>
                    <span class="nav-badge" id="alertNavBadge">3</span>
                </a>
                <a href="recomendaciones.html" class="nav-item ${activePage === 'recomendaciones' ? 'active' : ''}">
                    <i class="fas fa-lightbulb"></i><span>Recomendaciones</span>
                </a>
                <a href="dispositivos.html?action=add" class="nav-item">
                    <i class="fas fa-plus-circle"></i><span>Agregar Sensor</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Administración</div>
                <a href="dashboard-admin.html#usuarios" class="nav-item">
                    <i class="fas fa-users"></i><span>Gestión de Usuarios</span>
                </a>
                <a href="configuracion.html" class="nav-item ${activePage === 'configuracion' ? 'active' : ''}">
                    <i class="fas fa-cog"></i><span>Configuración</span>
                </a>
            </div>`;
    } else {
        sidebarNav.innerHTML = `
            <div class="nav-section">
                <div class="nav-section-title">Mi Consumo</div>
                <a href="dashboard-user.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                    <i class="fas fa-home"></i><span>Mi Dashboard</span>
                </a>
                <a href="dispositivos.html" class="nav-item ${activePage === 'dispositivos' ? 'active' : ''}">
                    <i class="fas fa-microchip"></i><span>Mis Dispositivos</span>
                </a>
                <a href="analisis.html" class="nav-item ${activePage === 'analisis' ? 'active' : ''}">
                    <i class="fas fa-chart-bar"></i><span>Mi Análisis</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Información</div>
                <a href="alertas.html" class="nav-item ${activePage === 'alertas' ? 'active' : ''}">
                    <i class="fas fa-bell"></i><span>Mis Alertas</span>
                    <span class="nav-badge" id="alertNavBadge">3</span>
                </a>
                <a href="recomendaciones.html" class="nav-item ${activePage === 'recomendaciones' ? 'active' : ''}">
                    <i class="fas fa-lightbulb"></i><span>Recomendaciones</span>
                </a>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Cuenta</div>
                <a href="configuracion.html" class="nav-item ${activePage === 'configuracion' ? 'active' : ''}">
                    <i class="fas fa-cog"></i><span>Mis Ajustes</span>
                </a>
            </div>`;
    }

    // Actualizar badge de alertas con conteo real (si los datos ya están cargados)
    setTimeout(function () {
        const badge = document.getElementById('alertNavBadge');
        if (badge && typeof EnerTrackData !== 'undefined') {
            const count = EnerTrackData.alerts.filter(function (a) {
                return a.priority !== 'low';
            }).length;
            badge.textContent = count;
        }
    }, 50);
}
