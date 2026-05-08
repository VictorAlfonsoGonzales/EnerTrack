// ── EnerTrack · Dashboard Administrador ───────────────────────────────────
auth.protectPage('admin');

let consumptionChart = null;
let areaChart        = null;
let editingUserId    = null;

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    initUserInfo();
    initDate();
    loadKPIs();
    loadUsersTable();
    loadAlerts();
    loadAreaList();
    NotifSystem.init();
    initCharts();
    setupEvents();
    startRealtime();
});

// ── Info de usuario ────────────────────────────────────────────────────────
function initUserInfo() {
    const name    = auth.getUsername();
    const initial = name.charAt(0).toUpperCase();
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('userName', name); set('userAvatar', initial);
    set('navAvatar', initial); set('navUserName', name);
}

function initDate() {
    const el = document.getElementById('dateDisplay');
    if (el) el.textContent = new Date().toLocaleDateString('es-ES', {
        weekday:'long', year:'numeric', month:'long', day:'numeric'
    });
}

// ── KPIs globales ──────────────────────────────────────────────────────────
function loadKPIs() {
    const active = EnerTrackData.users.filter(u => u.status === 'active').length;
    const totalConsumption = EnerTrackData.users.reduce((s, u) => s + u.consumption, 0);
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('kpiTotal',   EnerTrackData.stats.totalConsumption + ' W');
    set('kpiUsers',   active);
    set('kpiDevices', EnerTrackData.stats.activeDevices + '/' + EnerTrackData.stats.totalDevices);
    set('kpiAlerts',  EnerTrackData.stats.activeAlerts);
    set('alertNavBadge', EnerTrackData.stats.activeAlerts);
}

// ── Tabla de usuarios ──────────────────────────────────────────────────────
function loadUsersTable() {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    EnerTrackData.users.forEach(function (u) {
        const pct = Math.round((u.consumption / 350) * 100);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#0ea5e9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;color:white">
                        ${u.name.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight:600">${u.name}</div>
                        <div style="font-size:11px;color:var(--text-muted)">${u.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
                    </div>
                </div>
            </td>
            <td><span class="status ${u.role === 'admin' ? 'status-active' : 'status-info'}">${u.role === 'admin' ? 'Admin' : 'Usuario'}</span></td>
            <td>
                <div style="display:flex;align-items:center;gap:6px">
                    <strong>${u.consumption} kWh</strong>
                    <div class="consumption-bar-mini"><div class="consumption-bar-mini-fill" style="width:${Math.min(pct,100)}%"></div></div>
                </div>
            </td>
            <td>${u.devices} sensores</td>
            <td><span class="status ${u.status === 'active' ? 'status-active' : 'status-inactive'}">${u.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td>${formatDate(u.lastLogin)}</td>
            <td>
                <div style="display:flex;gap:6px">
                    <button class="btn-icon btn-edit" type="button" title="Ver detalle" onclick="viewUser(${u.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon btn-edit" type="button" title="Editar usuario" onclick="openEditUser(${u.id})" style="background:rgba(139,92,246,0.1);color:#8b5cf6"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" type="button" title="Eliminar usuario" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── Ver detalle usuario ────────────────────────────────────────────────────
function viewUser(id) {
    const u = EnerTrackData.users.find(x => x.id === id);
    if (!u) return;
    const body = document.getElementById('viewUserBody');
    if (!body) return;
    const pct = Math.round((u.consumption / 350) * 100);
    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;background:var(--dark-bg);border-radius:12px">
            <div style="width:60px;height:60px;background:linear-gradient(135deg,#3b82f6,#0ea5e9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;flex-shrink:0">${u.name.charAt(0)}</div>
            <div>
                <div style="font-size:20px;font-weight:800">${u.name}</div>
                <div style="font-size:13px;color:var(--text-muted)">${u.role === 'admin' ? 'Administrador del sistema' : 'Usuario estándar'}</div>
                <span class="status ${u.status === 'active' ? 'status-active' : 'status-inactive'}" style="margin-top:4px;display:inline-block">${u.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>
        <div class="user-detail-grid">
            <div class="user-detail-item"><div class="user-detail-label">Consumo Mensual</div><div class="user-detail-value" style="color:#3b82f6">${u.consumption} kWh</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Dispositivos</div><div class="user-detail-value">${u.devices} sensores</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Último Acceso</div><div class="user-detail-value">${formatDate(u.lastLogin)}</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Uso del Límite</div><div class="user-detail-value" style="color:${pct > 80 ? '#ef4444' : '#10b981'}">${pct}%</div></div>
        </div>
        <div style="margin-bottom:16px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Progreso mensual (${u.consumption} / 350 kWh)</div>
            <div style="height:10px;background:var(--dark-bg);border-radius:5px;overflow:hidden">
                <div style="height:100%;width:${Math.min(pct,100)}%;background:linear-gradient(90deg,#3b82f6,#0ea5e9);border-radius:5px;transition:width 0.6s ease"></div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" type="button" onclick="document.getElementById('viewUserModal').classList.remove('show')">Cerrar</button>
            <button class="btn btn-primary" type="button" onclick="document.getElementById('viewUserModal').classList.remove('show');openEditUser(${u.id})">
                <i class="fas fa-edit"></i><span>Editar Usuario</span>
            </button>
        </div>`;
    document.getElementById('viewUserModal').classList.add('show');
}

// ── Editar usuario ─────────────────────────────────────────────────────────
function openEditUser(id) {
    const u = EnerTrackData.users.find(x => x.id === id);
    if (!u) return;
    editingUserId = id;
    document.getElementById('editUserId').value     = id;
    document.getElementById('editUserName').value   = u.name;
    document.getElementById('editUserRole').value   = u.role;
    document.getElementById('editUserStatus').value = u.status;
    // Stats en el modal
    const statsEl = document.getElementById('editUserStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="user-detail-item"><div class="user-detail-label">Consumo</div><div class="user-detail-value">${u.consumption} kWh</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Dispositivos</div><div class="user-detail-value">${u.devices}</div></div>`;
    }
    document.getElementById('editUserModal').classList.add('show');
}

function saveEditUser() {
    const u = EnerTrackData.users.find(x => x.id === editingUserId);
    if (!u) return;
    const name = document.getElementById('editUserName').value.trim();
    if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
    u.name   = name;
    u.role   = document.getElementById('editUserRole').value;
    u.status = document.getElementById('editUserStatus').value;
    loadUsersTable();
    loadKPIs();
    document.getElementById('editUserModal').classList.remove('show');
    showToast(`Usuario "${u.name}" actualizado correctamente`, 'success');
}

// ── Eliminar usuario ───────────────────────────────────────────────────────
function deleteUser(id) {
    const u = EnerTrackData.users.find(x => x.id === id);
    if (!u) return;
    if (!confirm(`¿Eliminar al usuario "${u.name}"?\nEsta acción no se puede deshacer.`)) return;
    EnerTrackData.users = EnerTrackData.users.filter(x => x.id !== id);
    loadUsersTable();
    loadKPIs();
    showToast(`Usuario "${u.name}" eliminado del sistema`, 'success');
}

// ── Agregar usuario ────────────────────────────────────────────────────────
function saveNewUser() {
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const pass = document.getElementById('newUserPass').value;
    const errName = document.getElementById('errNewName');
    const errPass = document.getElementById('errNewPass');
    let ok = true;
    if (!name) { if (errName) errName.textContent = 'El nombre es obligatorio'; ok = false; }
    else { if (errName) errName.textContent = ''; }
    if (!pass || pass.length < 6) { if (errPass) errPass.textContent = 'Mínimo 6 caracteres'; ok = false; }
    else { if (errPass) errPass.textContent = ''; }
    if (!ok) return;
    const newUser = {
        id: Date.now(), name, role,
        consumption: 0, devices: 0,
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0]
    };
    EnerTrackData.users.push(newUser);
    loadUsersTable();
    loadKPIs();
    document.getElementById('addUserModal').classList.remove('show');
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserPass').value = '';
    showToast(`Usuario "${name}" creado correctamente`, 'success');
}

// ── Alertas recientes ──────────────────────────────────────────────────────
function loadAlerts() {
    const container = document.getElementById('alertsList');
    if (!container) return;
    container.innerHTML = '';
    EnerTrackData.alerts.slice(0, 4).forEach(function (a) {
        const icons = { critical:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
        const div = document.createElement('div');
        div.className = 'alert-item alert-' + a.type;
        div.innerHTML = `
            <div class="alert-icon"><i class="fas ${icons[a.type] || 'fa-bell'}"></i></div>
            <div class="alert-content">
                <div class="alert-title">${a.title}</div>
                <div class="alert-message">${a.message}</div>
                <div class="alert-time">${relativeTime(a.timestamp)}</div>
            </div>`;
        container.appendChild(div);
    });
}

// ── Consumo por área ───────────────────────────────────────────────────────
function loadAreaList() {
    const container = document.getElementById('areaList');
    if (!container) return;
    const icons = { Sala:'fa-couch', Cocina:'fa-utensils', Baño:'fa-bath', Habitación:'fa-bed', Oficina:'fa-desktop', Lavandería:'fa-tshirt', General:'fa-home' };
    container.innerHTML = '';
    EnerTrackData.areaConsumption.forEach(function (a) {
        const div = document.createElement('div');
        div.className = 'area-item';
        div.innerHTML = `
            <div class="area-icon"><i class="fas ${icons[a.area] || 'fa-home'}"></i></div>
            <div class="area-info">
                <div class="area-name">${a.area}</div>
                <div class="area-bar"><div class="area-bar-fill" style="width:${a.percentage}%"></div></div>
            </div>
            <div class="area-consumption">${a.consumption} W</div>`;
        container.appendChild(div);
    });
}

// ── Gráficas ───────────────────────────────────────────────────────────────
function initCharts() {
    buildConsumptionChart('24h');
    buildAreaChart();
}

function buildConsumptionChart(period) {
    const ctx = document.getElementById('consumptionChart');
    if (!ctx) return;
    let labels, data, unit;
    if (period === '24h') {
        labels = EnerTrackData.hourlyConsumption.map(h => h.hour);
        data   = EnerTrackData.hourlyConsumption.map(h => h.consumption);
        unit   = 'W';
    } else if (period === '7d') {
        labels = EnerTrackData.dailyConsumption.map(d => d.day);
        data   = EnerTrackData.dailyConsumption.map(d => d.consumption);
        unit   = 'kWh';
    } else {
        labels = EnerTrackData.monthlyConsumption.map(m => m.month);
        data   = EnerTrackData.monthlyConsumption.map(m => m.consumption);
        unit   = 'kWh';
    }
    if (consumptionChart) { consumptionChart.destroy(); consumptionChart = null; }
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(59,130,246,0.35)');
    gradient.addColorStop(1, 'rgba(59,130,246,0)');
    consumptionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Consumo (' + unit + ')',
                data,
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointRadius: 0, pointHoverRadius: 6,
                pointHoverBackgroundColor: '#3b82f6',
                pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 500 },
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
                x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
                y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: v => v + ' ' + unit } }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function buildAreaChart() {
    const ctx = document.getElementById('areaChart');
    if (!ctx) return;
    if (areaChart) { areaChart.destroy(); areaChart = null; }
    areaChart = new Chart(ctx, {
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
            animation: { duration: 500 },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#cbd5e1', padding: 12, font: { size: 12 },
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
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            return ctx.parsed + ' W (' + ((ctx.parsed / total) * 100).toFixed(1) + '%)';
                        }
                    }
                }
            }
        }
    });
}

// ── Simulación tiempo real ─────────────────────────────────────────────────
function startRealtime() {
    setInterval(function () {
        const el = document.getElementById('kpiTotal');
        if (!el) return;
        const base = EnerTrackData.stats.totalConsumption;
        const variation = Math.floor(Math.random() * 80) - 40;
        el.textContent = (base + variation).toLocaleString() + ' W';
    }, 3000);
}

// ── Eventos ────────────────────────────────────────────────────────────────
function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');
    const addUserBtn     = document.getElementById('addUserBtn');
    const addUserModal   = document.getElementById('addUserModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const cancelUserModal= document.getElementById('cancelUserModal');
    const saveUserBtn    = document.getElementById('saveUserBtn');
    const editUserModal  = document.getElementById('editUserModal');
    const closeEditUser  = document.getElementById('closeEditUserModal');
    const cancelEditUser = document.getElementById('cancelEditUserModal');
    const viewUserModal  = document.getElementById('viewUserModal');
    const closeViewUser  = document.getElementById('closeViewUserModal');
    const usersNavBtn    = document.getElementById('usersNavBtn');
    const chartPeriod    = document.getElementById('chartPeriod');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); sidebarOverlay.classList.toggle('active'); });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); });

    // Gráfica período
    if (chartPeriod) chartPeriod.addEventListener('change', e => buildConsumptionChart(e.target.value));

    // Modal agregar usuario
    if (addUserBtn)    addUserBtn.addEventListener('click', () => addUserModal.classList.add('show'));
    if (closeUserModal) closeUserModal.addEventListener('click', () => addUserModal.classList.remove('show'));
    if (cancelUserModal) cancelUserModal.addEventListener('click', () => addUserModal.classList.remove('show'));
    if (saveUserBtn)   saveUserBtn.addEventListener('click', saveNewUser);
    if (addUserModal)  addUserModal.addEventListener('click', e => { if (e.target === addUserModal) addUserModal.classList.remove('show'); });

    // Modal editar usuario
    const saveEditUserBtn = document.getElementById('saveEditUserBtn');
    if (closeEditUser)   closeEditUser.addEventListener('click', () => editUserModal.classList.remove('show'));
    if (cancelEditUser)  cancelEditUser.addEventListener('click', () => editUserModal.classList.remove('show'));
    if (saveEditUserBtn) saveEditUserBtn.addEventListener('click', saveEditUser);
    if (editUserModal)   editUserModal.addEventListener('click', e => { if (e.target === editUserModal) editUserModal.classList.remove('show'); });

    // Modal ver usuario
    if (closeViewUser) closeViewUser.addEventListener('click', () => viewUserModal.classList.remove('show'));
    if (viewUserModal) viewUserModal.addEventListener('click', e => { if (e.target === viewUserModal) viewUserModal.classList.remove('show'); });

    // Sidebar: Gestión Usuarios → scroll a sección
    if (usersNavBtn) {
        usersNavBtn.addEventListener('click', function () {
            const section = document.getElementById('usersSection');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                section.style.outline = '2px solid var(--secondary-blue)';
                setTimeout(() => { section.style.outline = ''; }, 1500);
            }
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Scroll top
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

function saveEditUser_fn() { saveEditUser(); }
function formatDate(str) {
    return new Date(str).toLocaleDateString('es-ES', { year:'numeric', month:'short', day:'numeric' });
}

function relativeTime(str) {
    const diff = Date.now() - new Date(str).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return 'Hace ' + m + ' min';
    const h = Math.floor(m / 60);
    if (h < 24) return 'Hace ' + h + ' h';
    return formatDate(str);
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
