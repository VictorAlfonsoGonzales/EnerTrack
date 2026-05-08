// ── EnerTrack · Dashboard Usuario ─────────────────────────────────────────
auth.protectPage('user');

let hourlyChart = null;
let weeklyChart = null;

document.addEventListener('DOMContentLoaded', function () {
    initUserInfo();
    initDate();
    loadTopDevices();
    loadRecommendations();
    NotifSystem.init();
    initCharts();
    setupEvents();
});

// ── Info usuario ───────────────────────────────────────────────────────────
function initUserInfo() {
    const name    = auth.getUsername();
    const initial = name.charAt(0).toUpperCase();
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('userName', name);
    set('userAvatar', initial);
    set('navAvatar', initial);
    set('navUserName', name);
    set('welcomeName', name);
}

function initDate() {
    const now = new Date();
    const h   = now.getHours();
    const greeting = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    const el = document.getElementById('welcomeMsg');
    if (el) el.innerHTML = greeting + ', <span id="welcomeName">' + auth.getUsername() + '</span>';
    const dd = document.getElementById('dateDisplay');
    if (dd) dd.textContent = now.toLocaleDateString('es-ES', {
        weekday:'long', year:'numeric', month:'long', day:'numeric'
    });
}

// ── Dispositivos activos ───────────────────────────────────────────────────
function loadTopDevices() {
    const container = document.getElementById('topDevices');
    if (!container) return;
    container.innerHTML = '';

    const icons = { Climatización:'fa-fan', Electrodoméstico:'fa-blender', Entretenimiento:'fa-tv', Electrónica:'fa-laptop', Iluminación:'fa-lightbulb' };
    const sorted = [...EnerTrackData.devices]
        .filter(d => d.status === 'active')
        .sort((a, b) => b.consumption - a.consumption)
        .slice(0, 5);

    sorted.forEach(function (d) {
        const div = document.createElement('div');
        div.className = 'device-mini-card';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('title', 'Ver detalle de ' + d.name);
        div.innerHTML = `
            <div class="device-mini-icon"><i class="fas ${icons[d.type] || 'fa-plug'}"></i></div>
            <div class="device-mini-name">${d.name}</div>
            <div class="device-mini-area">${d.area}</div>
            <div class="device-mini-consumption">${d.consumption} W</div>
            <span class="status status-active" style="font-size:10px">Activo</span>`;
        div.addEventListener('click', function () {
            showToast(d.name + ' · ' + d.area + ' · ' + d.consumption + ' W · Eficiencia ' + d.efficiency, 'info');
        });
        div.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') this.click();
        });
        container.appendChild(div);
    });
}

// ── Recomendaciones ────────────────────────────────────────────────────────
function loadRecommendations() {
    const container = document.getElementById('recsList');
    if (!container) return;
    container.innerHTML = '';

    const colors = { high:'#ef4444', medium:'#f59e0b', low:'#3b82f6' };
    EnerTrackData.recommendations.slice(0, 3).forEach(function (r) {
        const div = document.createElement('div');
        div.className = 'rec-item';
        div.innerHTML = `
            <div class="rec-icon" style="background:rgba(59,130,246,0.1);color:#3b82f6">
                <i class="fas fa-lightbulb"></i>
            </div>
            <div class="rec-content">
                <div class="rec-title">${r.title}</div>
                <div class="rec-desc">${r.description}</div>
                <span class="rec-savings"><i class="fas fa-piggy-bank"></i> Ahorro: ${r.savings}</span>
            </div>
            <span class="rec-impact" style="background:${colors[r.impact]}20;color:${colors[r.impact]}">
                ${r.impact === 'high' ? 'Alto' : r.impact === 'medium' ? 'Medio' : 'Bajo'}
            </span>`;
        div.addEventListener('click', function () {
            window.location.href = 'recomendaciones.html';
        });
        container.appendChild(div);
    });
}

// ── Gráficas ───────────────────────────────────────────────────────────────
function initCharts() {
    buildHourlyChart();
    buildWeeklyChart();
}

function buildHourlyChart() {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;
    if (hourlyChart) { hourlyChart.destroy(); hourlyChart = null; }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(14,165,233,0.35)');
    gradient.addColorStop(1, 'rgba(14,165,233,0)');

    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: EnerTrackData.hourlyConsumption.map(h => h.hour),
            datasets: [{
                label: 'Consumo (W)',
                data: EnerTrackData.hourlyConsumption.map(h => h.consumption),
                borderColor: '#0ea5e9', backgroundColor: gradient,
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointRadius: 0, pointHoverRadius: 6,
                pointHoverBackgroundColor: '#0ea5e9',
                pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2
            }]
        },
        options: chartOptions('W')
    });
}

function buildWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    if (weeklyChart) { weeklyChart.destroy(); weeklyChart = null; }

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: EnerTrackData.dailyConsumption.map(d => d.day),
            datasets: [{
                label: 'Consumo (kWh)',
                data: EnerTrackData.dailyConsumption.map(d => d.consumption),
                backgroundColor: 'rgba(59,130,246,0.8)',
                borderColor: '#3b82f6',
                borderWidth: 0, borderRadius: 8, borderSkipped: false
            }]
        },
        options: chartOptions('kWh')
    });
}

function chartOptions(unit) {
    return {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b', titleColor: '#f8fafc',
                bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12,
                displayColors: false,
                callbacks: { label: ctx => 'Consumo: ' + ctx.parsed.y + ' ' + unit }
            }
        },
        scales: {
            x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: v => v + ' ' + unit } }
        },
        interaction: { intersect: false, mode: 'index' }
    };
}

// ── Eventos ────────────────────────────────────────────────────────────────
function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    if (s) s.classList.toggle('active');
    if (o) o.classList.toggle('active');
}
function closeSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    if (s) s.classList.remove('active');
    if (o) o.classList.remove('active');
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle' };
    t.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
}
