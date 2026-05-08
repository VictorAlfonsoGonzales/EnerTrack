// ── EnerTrack · Dispositivos ───────────────────────────────────────────────
if (!auth.isAuthenticated()) { window.location.href = '../login.html'; }

const isAdmin = auth.getRole() === 'admin';

let currentFilter  = 'all';
let currentView    = 'grid';
let devices        = [...EnerTrackData.devices];
let wizardStep     = 1;
let selectedWifi   = '';
let editingId      = null;

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    buildSidebar('dispositivos');
    initUserInfo();
    updateStats();
    renderDevices();
    NotifSystem.init();
    setupEvents();
    if (new URLSearchParams(window.location.search).get('action') === 'add') {
        openWizard();
    }
});

// ── Info usuario ───────────────────────────────────────────────────────────
function initUserInfo() {
    const name    = auth.getUsername();
    const initial = name.charAt(0).toUpperCase();
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('userName', name); set('userAvatar', initial);
    set('navAvatar', initial); set('navUserName', name);
    set('userRole', isAdmin ? 'Administrador' : 'Usuario');
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.className = 'role-tag ' + (isAdmin ? 'admin-tag' : 'user-tag');
    const btn = document.getElementById('openModalBtn');
    if (btn) btn.style.display = isAdmin ? 'inline-flex' : 'none';
}

// ── Estadísticas ───────────────────────────────────────────────────────────
function updateStats() {
    const active = devices.filter(d => d.status === 'active');
    const total  = active.reduce((s, d) => s + d.consumption, 0);
    const set = function (id, val) { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('statTotal', devices.length);
    set('statActive', active.length);
    set('statConsumption', total.toLocaleString() + ' W');
}

// ── Filtrar ────────────────────────────────────────────────────────────────
function getFiltered() {
    let list = [...devices];
    if (currentFilter === 'active')   list = list.filter(d => d.status === 'active');
    if (currentFilter === 'inactive') list = list.filter(d => d.status === 'inactive');
    const area = document.getElementById('areaFilter').value;
    if (area !== 'all') list = list.filter(d => d.area === area);
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    if (q) list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
    );
    return list;
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderDevices() {
    const list = getFiltered();
    if (currentView === 'grid') {
        document.getElementById('gridView').style.display = 'block';
        document.getElementById('tableView').style.display = 'none';
        renderGrid(list);
    } else {
        document.getElementById('gridView').style.display = 'none';
        document.getElementById('tableView').style.display = 'block';
        renderTable(list);
    }
}

function getIcon(type) {
    const map = { Climatización:'fa-fan', Electrodoméstico:'fa-blender', Entretenimiento:'fa-tv', Electrónica:'fa-laptop', Iluminación:'fa-lightbulb' };
    return map[type] || 'fa-plug';
}

function renderGrid(list) {
    const grid = document.getElementById('devicesGrid');
    grid.innerHTML = '';
    if (!list.length) {
        grid.innerHTML = '<p class="empty-msg">No se encontraron dispositivos</p>';
        return;
    }
    list.forEach(function (d) {
        const card = document.createElement('div');
        card.className = 'device-card-full';
        const actions = isAdmin ? `
            <div style="display:flex;gap:6px">
                <button class="btn-icon btn-edit" type="button" title="Editar" onclick="openEditModal(${d.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-delete" type="button" title="Eliminar" onclick="deleteDevice(${d.id})"><i class="fas fa-trash"></i></button>
            </div>` : `<button class="btn-icon btn-edit" type="button" title="Ver detalles" onclick="viewDeviceDetail(${d.id})"><i class="fas fa-eye"></i></button>`;
        card.innerHTML = `
            <div class="device-card-header">
                <div class="device-card-icon"><i class="fas ${getIcon(d.type)}"></i></div>
                <span class="status ${d.status === 'active' ? 'status-active' : 'status-inactive'}">${d.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="device-card-name">${d.name}</div>
            <div class="device-card-area"><i class="fas fa-map-marker-alt"></i> ${d.area}</div>
            <div class="device-card-stats">
                <div class="device-stat"><span class="device-stat-label">Consumo</span><span class="device-stat-value">${d.consumption} W</span></div>
                <div class="device-stat"><span class="device-stat-label">Tipo</span><span class="device-stat-value" style="font-size:12px">${d.type}</span></div>
            </div>
            <div class="device-card-footer">
                <span class="efficiency-badge">Efic. ${d.efficiency}</span>
                ${actions}
            </div>`;
        grid.appendChild(card);
    });
}

function renderTable(list) {
    const tbody = document.getElementById('devicesTableBody');
    tbody.innerHTML = '';
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No se encontraron dispositivos</td></tr>';
        return;
    }
    list.forEach(function (d) {
        const tr = document.createElement('tr');
        const actions = isAdmin ? `
            <div style="display:flex;gap:6px">
                <button class="btn-icon btn-edit" type="button" title="Editar" onclick="openEditModal(${d.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-delete" type="button" title="Eliminar" onclick="deleteDevice(${d.id})"><i class="fas fa-trash"></i></button>
            </div>` : `<button class="btn-icon btn-edit" type="button" title="Ver detalles" onclick="viewDeviceDetail(${d.id})"><i class="fas fa-eye"></i></button>`;
        tr.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:36px;height:36px;background:rgba(59,130,246,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#3b82f6;font-size:16px">
                        <i class="fas ${getIcon(d.type)}"></i>
                    </div>${d.name}
                </div>
            </td>
            <td>${d.area}</td>
            <td>${d.type}</td>
            <td><strong>${d.consumption} W</strong></td>
            <td><span class="efficiency-badge">${d.efficiency}</span></td>
            <td><span class="status ${d.status === 'active' ? 'status-active' : 'status-inactive'}">${d.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td>${actions}</td>`;
        tbody.appendChild(tr);
    });
}

// ── Ver detalle (usuario) ──────────────────────────────────────────────────
function viewDeviceDetail(id) {
    const d = devices.find(x => x.id === id);
    if (!d) return;
    showToast(`${d.name} — ${d.consumption} W — ${d.area}`, 'info');
}

// ── Eliminar dispositivo ───────────────────────────────────────────────────
function deleteDevice(id) {
    const d = devices.find(x => x.id === id);
    if (!d) return;
    if (!confirm(`¿Eliminar el dispositivo "${d.name}"?\nEsta acción no se puede deshacer.`)) return;
    devices = devices.filter(x => x.id !== id);
    EnerTrackData.devices = devices;
    updateStats();
    renderDevices();
    showToast(`"${d.name}" eliminado del sistema`, 'success');
}

// ── Modal Editar ───────────────────────────────────────────────────────────
function openEditModal(id) {
    const d = devices.find(x => x.id === id);
    if (!d) return;
    editingId = id;
    document.getElementById('editDeviceId').value   = id;
    document.getElementById('editName').value        = d.name;
    document.getElementById('editArea').value        = d.area;
    document.getElementById('editType').value        = d.type;
    document.getElementById('editConsumption').value = d.consumption;
    document.getElementById('editEfficiency').value  = d.efficiency;
    document.getElementById('editStatus').value      = d.status;
    document.getElementById('editDeviceModal').classList.add('show');
}

function saveEditDevice() {
    const id = editingId;
    const d  = devices.find(x => x.id === id);
    if (!d) return;
    const name = document.getElementById('editName').value.trim();
    if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
    d.name        = name;
    d.area        = document.getElementById('editArea').value;
    d.type        = document.getElementById('editType').value;
    d.consumption = parseFloat(document.getElementById('editConsumption').value) || d.consumption;
    d.efficiency  = document.getElementById('editEfficiency').value;
    d.status      = document.getElementById('editStatus').value;
    updateStats();
    renderDevices();
    document.getElementById('editDeviceModal').classList.remove('show');
    showToast(`"${d.name}" actualizado correctamente`, 'success');
}

// ══════════════════════════════════════════════════════════════
// WIZARD — Agregar Sensor (4 pasos)
// ══════════════════════════════════════════════════════════════
function openWizard() {
    wizardStep   = 1;
    selectedWifi = '';
    resetWizardUI();
    document.getElementById('wizardOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeWizard() {
    document.getElementById('wizardOverlay').classList.remove('show');
    document.body.style.overflow = '';
    resetWizardForms();
}

function resetWizardUI() {
    // Mostrar panel 1
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('wizardPanel1').classList.add('active');
    // Reset steps
    document.querySelectorAll('.wizard-step-item').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    document.querySelector('[data-step="1"]').classList.add('active');
    document.querySelectorAll('.step-line').forEach(l => l.classList.remove('done'));
    // Footer
    updateWizardFooter();
}

function resetWizardForms() {
    ['wDeviceName','wDeviceConsumption','wifiPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['wDeviceArea','wDeviceType'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.querySelectorAll('.field-err').forEach(e => e.textContent = '');
    document.querySelectorAll('.wifi-item').forEach(w => w.classList.remove('selected'));
    const pg = document.getElementById('wifiPasswordGroup');
    if (pg) pg.style.display = 'none';
    const cb = document.getElementById('sensorPlugged');
    if (cb) cb.checked = false;
    selectedWifi = '';
}

function updateWizardFooter() {
    const label = document.getElementById('wizardStepLabel');
    const back  = document.getElementById('wizardBack');
    const next  = document.getElementById('wizardNext');
    if (label) label.textContent = `Paso ${wizardStep} de 4`;
    if (back)  back.style.display = wizardStep > 1 && wizardStep < 4 ? 'inline-flex' : 'none';
    if (next) {
        if (wizardStep === 4) {
            next.innerHTML = '<i class="fas fa-check"></i><span>Finalizar</span>';
        } else if (wizardStep === 3) {
            next.innerHTML = '<span>Conectar Sensor</span><i class="fas fa-wifi"></i>';
        } else {
            next.innerHTML = '<span>Siguiente</span><i class="fas fa-arrow-right"></i>';
        }
    }
}

function goToStep(step) {
    // Marcar pasos completados
    document.querySelectorAll('.wizard-step-item').forEach(function (item) {
        const s = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');
        if (s < step) item.classList.add('completed');
        if (s === step) item.classList.add('active');
    });
    // Líneas
    document.querySelectorAll('.step-line').forEach(function (line, i) {
        line.classList.toggle('done', i < step - 1);
    });
    // Paneles
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('wizardPanel' + step);
    if (panel) panel.classList.add('active');
    wizardStep = step;
    updateWizardFooter();
}

function wizardNextStep() {
    if (wizardStep === 1) {
        const cb = document.getElementById('sensorPlugged');
        if (!cb || !cb.checked) {
            showToast('Confirma que el sensor está enchufado y el LED azul parpadea', 'error');
            return;
        }
        goToStep(2);
    } else if (wizardStep === 2) {
        if (!selectedWifi) {
            showToast('Selecciona una red WiFi', 'error');
            return;
        }
        const pass = document.getElementById('wifiPassword').value;
        if (!pass) {
            document.getElementById('errWifiPass').textContent = 'Ingresa la contraseña WiFi';
            return;
        }
        document.getElementById('errWifiPass').textContent = '';
        // Simular conexión
        const btn = document.getElementById('wizardNext');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Conectando...</span>';
        setTimeout(function () {
            btn.disabled = false;
            goToStep(3);
        }, 1800);
    } else if (wizardStep === 3) {
        if (!validateWizardStep3()) return;
        // Simular registro
        const btn = document.getElementById('wizardNext');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Registrando...</span>';
        setTimeout(function () {
            btn.disabled = false;
            registerSensor();
            goToStep(4);
        }, 2000);
    } else if (wizardStep === 4) {
        closeWizard();
    }
}

function wizardBackStep() {
    if (wizardStep > 1) goToStep(wizardStep - 1);
}

function validateWizardStep3() {
    let ok = true;
    const fields = [
        { id:'wDeviceName',        errId:'wErrName',        msg:'El nombre es obligatorio' },
        { id:'wDeviceArea',        errId:'wErrArea',        msg:'Selecciona un área' },
        { id:'wDeviceType',        errId:'wErrType',        msg:'Selecciona un tipo' },
        { id:'wDeviceConsumption', errId:'wErrConsumption', msg:'Ingresa el consumo estimado' }
    ];
    fields.forEach(function (f) {
        const el  = document.getElementById(f.id);
        const err = document.getElementById(f.errId);
        if (!el || !el.value.trim()) {
            if (err) err.textContent = f.msg;
            if (el)  el.style.borderColor = 'var(--error-color)';
            ok = false;
        } else {
            if (err) err.textContent = '';
            if (el)  el.style.borderColor = '';
        }
    });
    const cons = parseFloat(document.getElementById('wDeviceConsumption').value);
    if (!isNaN(cons) && (cons <= 0 || cons > 10000)) {
        document.getElementById('wErrConsumption').textContent = 'Valor entre 1 y 10000 W';
        ok = false;
    }
    return ok;
}

function registerSensor() {
    const name       = document.getElementById('wDeviceName').value.trim();
    const area       = document.getElementById('wDeviceArea').value;
    const type       = document.getElementById('wDeviceType').value;
    const consumption= parseFloat(document.getElementById('wDeviceConsumption').value);
    const efficiency = document.getElementById('wDeviceEfficiency').value;
    const status     = document.getElementById('wDeviceStatus').value;

    const newDevice = { id: Date.now(), name, area, type, consumption, efficiency, status };
    devices.push(newDevice);
    EnerTrackData.devices.push(newDevice);
    updateStats();
    renderDevices();

    // Mostrar detalles en pantalla de éxito
    const details = document.getElementById('successDetails');
    if (details) {
        details.innerHTML = `
            <div class="success-detail-item"><div class="success-detail-label">Nombre</div><div class="success-detail-value">${name}</div></div>
            <div class="success-detail-item"><div class="success-detail-label">Área</div><div class="success-detail-value">${area}</div></div>
            <div class="success-detail-item"><div class="success-detail-label">Tipo</div><div class="success-detail-value">${type}</div></div>
            <div class="success-detail-item"><div class="success-detail-label">Consumo</div><div class="success-detail-value">${consumption} W</div></div>
            <div class="success-detail-item"><div class="success-detail-label">Eficiencia</div><div class="success-detail-value">${efficiency}</div></div>
            <div class="success-detail-item"><div class="success-detail-label">Red WiFi</div><div class="success-detail-value">${selectedWifi}</div></div>`;
    }
}

function selectWifi(el) {
    document.querySelectorAll('.wifi-item').forEach(w => w.classList.remove('selected'));
    el.classList.add('selected');
    selectedWifi = el.dataset.ssid;
    const nameEl = document.getElementById('selectedWifiName');
    if (nameEl) nameEl.textContent = selectedWifi;
    const pg = document.getElementById('wifiPasswordGroup');
    if (pg) { pg.style.display = 'block'; document.getElementById('wifiPassword').focus(); }
}



// ── Eventos ────────────────────────────────────────────────────────────────
function setupEvents() {
    const logoutBtn      = document.getElementById('logoutBtn');
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const scrollTopBtn   = document.getElementById('scrollTop');
    const openModalBtn   = document.getElementById('openModalBtn');
    const searchInput    = document.getElementById('searchInput');
    const areaFilter     = document.getElementById('areaFilter');

    if (logoutBtn)      logoutBtn.addEventListener('click', () => auth.logout());
    if (menuToggle)     menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); sidebarOverlay.classList.toggle('active'); });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); });
    if (openModalBtn)   openModalBtn.addEventListener('click', openWizard);
    if (searchInput)    searchInput.addEventListener('input', renderDevices);
    if (areaFilter)     areaFilter.addEventListener('change', renderDevices);

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderDevices();
        });
    });

    // Vista
    document.querySelectorAll('.view-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderDevices();
        });
    });

    // Wizard
    const wizardClose   = document.getElementById('wizardClose');
    const wizardNextBtn = document.getElementById('wizardNext');
    const wizardBackBtn = document.getElementById('wizardBack');
    const wizardOverlay = document.getElementById('wizardOverlay');
    if (wizardClose)   wizardClose.addEventListener('click', closeWizard);
    if (wizardNextBtn) wizardNextBtn.addEventListener('click', wizardNextStep);
    if (wizardBackBtn) wizardBackBtn.addEventListener('click', wizardBackStep);
    if (wizardOverlay) wizardOverlay.addEventListener('click', function (e) { if (e.target === this) closeWizard(); });

    // Toggle WiFi password
    const toggleWifiPass = document.getElementById('toggleWifiPass');
    if (toggleWifiPass) {
        toggleWifiPass.addEventListener('click', function () {
            const inp = document.getElementById('wifiPassword');
            const ico = document.getElementById('wifiEyeIcon');
            if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fas fa-eye-slash'; }
            else { inp.type = 'password'; ico.className = 'fas fa-eye'; }
        });
    }

    // Scan WiFi
    const scanBtn = document.getElementById('scanWifiBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', function () {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Buscando redes...</span>';
            this.disabled = true;
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i><span>Buscar redes disponibles</span>';
                this.disabled = false;
                showToast('4 redes encontradas', 'success');
            }, 1500);
        });
    }

    // Edit modal
    const closeEditModal   = document.getElementById('closeEditModal');
    const cancelEditModal  = document.getElementById('cancelEditModal');
    const saveEditDeviceEl = document.getElementById('saveEditDevice');
    const editModal        = document.getElementById('editDeviceModal');
    if (closeEditModal)   closeEditModal.addEventListener('click', () => editModal.classList.remove('show'));
    if (cancelEditModal)  cancelEditModal.addEventListener('click', () => editModal.classList.remove('show'));
    if (saveEditDeviceEl) saveEditDeviceEl.addEventListener('click', saveEditDevice);
    if (editModal)        editModal.addEventListener('click', e => { if (e.target === editModal) editModal.classList.remove('show'); });

    // Scroll top
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300), { passive: true });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

// ── Utilidades ─────────────────────────────────────────────────────────────
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
    const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle' };
    t.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
}
