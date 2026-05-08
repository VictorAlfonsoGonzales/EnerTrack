// ── EnerTrack · Análisis ──────────────────────────────────────────────────
if (!auth.isAuthenticated()) { window.location.href = '../login.html'; }

const isAdmin = auth.getRole() === 'admin';

let charts = {};

document.addEventListener('DOMContentLoaded', function () {
    buildSidebar('analisis');
    initUserInfo();
    initCharts();
    loadTrends();
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

// ── Gráficas ───────────────────────────────────────────────────────────────
function initCharts() {
    buildMonthlyChart();
    buildWeeklyChart();
    buildAreaChart();
}

function buildMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    if (charts.monthly) { charts.monthly.destroy(); }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(59,130,246,0.35)');
    gradient.addColorStop(1, 'rgba(59,130,246,0)');

    charts.monthly = new Chart(ctx, {
        type: 'line',
        data: {
            labels: EnerTrackData.monthlyConsumption.map(m => m.month),
            datasets: [{
                label: 'Consumo (kWh)',
                data: EnerTrackData.monthlyConsumption.map(m => m.consumption),
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointRadius: 4, pointHoverRadius: 8,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff', pointBorderWidth: 2
            }]
        },
        options: makeOptions('kWh')
    });
}

function buildWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    if (charts.weekly) { charts.weekly.destroy(); }

    charts.weekly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: EnerTrackData.dailyConsumption.map(d => d.day),
            datasets: [{
                label: 'Consumo (kWh)',
                data: EnerTrackData.dailyConsumption.map(d => d.consumption),
                backgroundColor: 'rgba(14,165,233,0.8)',
                borderColor: '#0ea5e9',
                borderWidth: 0, borderRadius: 8, borderSkipped: false
            }]
        },
        options: makeOptions('kWh')
    });
}

function buildAreaChart() {
    const ctx = document.getElementById('areaChart');
    if (!ctx) return;
    if (charts.area) { charts.area.destroy(); }

    charts.area = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: EnerTrackData.areaConsumption.map(a => a.area),
            datasets: [{
                data: EnerTrackData.areaConsumption.map(a => a.consumption),
                backgroundColor: ['#3b82f6','#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444'],
                borderWidth: 0, hoverOffset: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 600 },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#cbd5e1', padding: 14, font: { size: 12 },
                        generateLabels: function (chart) {
                            return chart.data.labels.map(function (l, i) {
                                return {
                                    text: l + ': ' + chart.data.datasets[0].data[i] + ' W',
                                    fillStyle: chart.data.datasets[0].backgroundColor[i],
                                    hidden: false, index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b', titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12,
                    callbacks: {
                        label: function (ctx) {
                            const total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                            return ctx.parsed + ' W (' + ((ctx.parsed / total) * 100).toFixed(1) + '%)';
                        }
                    }
                }
            }
        }
    });
}

function makeOptions(unit) {
    return {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b', titleColor: '#f8fafc',
                bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 12,
                displayColors: false,
                callbacks: { label: function (ctx) { return 'Consumo: ' + ctx.parsed.y + ' ' + unit; } }
            }
        },
        scales: {
            x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', maxRotation: 0 } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: function (v) { return v + ' ' + unit; } } }
        },
        interaction: { intersect: false, mode: 'index' }
    };
}

// ── Tendencias ─────────────────────────────────────────────────────────────
function loadTrends() {
    const container = document.getElementById('trendsContainer');
    if (!container) return;
    const trends = [
        { label:'Consumo promedio', value:'9.1 kWh/día', change:-5,  icon:'fa-chart-line' },
        { label:'Pico de consumo',  value:'620 W',       change:-8,  icon:'fa-arrow-up'   },
        { label:'Consumo nocturno', value:'165 W',       change:-12, icon:'fa-moon'        },
        { label:'Eficiencia',       value:'78%',         change:3,   icon:'fa-leaf'        }
    ];
    container.innerHTML = '';
    trends.forEach(function (t) {
        const color = t.change > 0 ? '#10b981' : '#ef4444';
        const icon  = t.change > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const div = document.createElement('div');
        div.className = 'trend-item';
        div.innerHTML = `
            <div class="trend-icon"><i class="fas ${t.icon}"></i></div>
            <div class="trend-content">
                <div class="trend-label">${t.label}</div>
                <div class="trend-value">${t.value}</div>
                <div class="trend-change">
                    <i class="fas ${icon}" style="color:${color}"></i>
                    <span style="color:${color}">${Math.abs(t.change)}% vs mes anterior</span>
                </div>
            </div>`;
        container.appendChild(div);
    });
}



// ── Eventos ────────────────────────────────────────────────────────────────
function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); sidebarOverlay.classList.toggle('active'); });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); });

    const dlBtn = document.getElementById('downloadReport');
    if (dlBtn) dlBtn.addEventListener('click', function () {
        showToast('Generando reporte PDF...', 'info');
        setTimeout(function () { showToast('Reporte descargado correctamente', 'success'); }, 1500);
    });

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
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
