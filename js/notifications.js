// ── EnerTrack · Sistema de Notificaciones ─────────────────────────────────
// Módulo compartido — incluido en todos los módulos del sistema

const NotifSystem = (function () {

    // ── Detectar ruta base (desde html/ o desde raíz) ──────────────────────
    const isInHtmlFolder = window.location.pathname.includes('/html/');
    const base = isInHtmlFolder ? '' : 'html/';

    // ── Mapa de navegación por tipo/sección ────────────────────────────────
    const NAV_MAP = {
        'consumo':        base + 'analisis.html',
        'dispositivo':    base + 'dispositivos.html',
        'sensor':         base + 'dispositivos.html',
        'alerta':         base + 'alertas.html',
        'límite':         base + 'alertas.html',
        'recomendacion':  base + 'recomendaciones.html',
        'ahorro':         base + 'recomendaciones.html',
        'reporte':        base + 'analisis.html',
        'análisis':       base + 'analisis.html',
        'configuracion':  base + 'configuracion.html',
        'sistema':        base + 'alertas.html',
        'batería':        base + 'dispositivos.html',
        'actualización':  base + 'configuracion.html',
        'default':        base + 'alertas.html'
    };

    function getNavUrl(notif) {
        const text = (notif.title + ' ' + notif.message + ' ' + notif.device).toLowerCase();
        for (const key in NAV_MAP) {
            if (key !== 'default' && text.includes(key)) return NAV_MAP[key];
        }
        return NAV_MAP['default'];
    }

    // ── Datos de notificaciones ────────────────────────────────────────────
    let notifications = [];
    let currentTab    = 'all';
    let selectedIds   = new Set();
    let panelOpen     = false;

    function buildNotifications() {
        // Desde alertas del sistema
        const fromAlerts = EnerTrackData.alerts.map(function (a, i) {
            return {
                id:        a.id,
                type:      a.type,
                title:     a.title,
                message:   a.message,
                device:    a.device,
                timestamp: a.timestamp,
                priority:  a.priority,
                section:   'alertas',
                unread:    i < 3,
                important: a.priority === 'critical' || a.priority === 'high',
                deleted:   false
            };
        });

        // Notificaciones adicionales de otras secciones
        const extra = [
            {
                id:100, type:'info', title:'Reporte mensual disponible',
                message:'El reporte de consumo de mayo 2026 ya está listo para descargar.',
                device:'Análisis', timestamp:'2026-05-07T09:00:00',
                priority:'low', section:'analisis',
                unread:true, important:false, deleted:false
            },
            {
                id:101, type:'success', title:'Sensor sincronizado correctamente',
                message:'El sensor del Refrigerador se sincronizó con el sistema sin errores.',
                device:'Refrigerador', timestamp:'2026-05-07T08:30:00',
                priority:'low', section:'dispositivos',
                unread:false, important:false, deleted:false
            },
            {
                id:102, type:'warning', title:'Batería baja en sensor',
                message:'El sensor de la Lavandería tiene batería al 15%. Reemplázala pronto.',
                device:'Sensor Lavandería', timestamp:'2026-05-06T20:00:00',
                priority:'medium', section:'dispositivos',
                unread:true, important:true, deleted:false
            },
            {
                id:103, type:'info', title:'Nueva recomendación disponible',
                message:'Hemos generado 2 nuevas recomendaciones de ahorro basadas en tu consumo.',
                device:'Recomendaciones', timestamp:'2026-05-06T15:00:00',
                priority:'low', section:'recomendaciones',
                unread:true, important:false, deleted:false
            },
            {
                id:104, type:'info', title:'Actualización de firmware disponible',
                message:'Hay una nueva versión del firmware para tus sensores EnerTrack v2.1.',
                device:'Sistema', timestamp:'2026-05-06T12:00:00',
                priority:'low', section:'configuracion',
                unread:false, important:false, deleted:false
            },
            {
                id:105, type:'warning', title:'Consumo inusual en Sala',
                message:'El área de Sala registró un consumo 35% mayor al promedio esta semana.',
                device:'Área Sala', timestamp:'2026-05-06T10:00:00',
                priority:'medium', section:'analisis',
                unread:true, important:true, deleted:false
            },
            {
                id:106, type:'success', title:'Meta de ahorro alcanzada',
                message:'¡Felicitaciones! Alcanzaste tu meta de ahorro del 15% este mes.',
                device:'Sistema', timestamp:'2026-05-05T18:00:00',
                priority:'low', section:'recomendaciones',
                unread:false, important:false, deleted:false
            },
            {
                id:107, type:'critical', title:'Dispositivo desconectado',
                message:'El sensor del Aire Acondicionado perdió conexión hace 10 minutos.',
                device:'Aire Acondicionado', timestamp:'2026-05-05T14:00:00',
                priority:'high', section:'dispositivos',
                unread:true, important:true, deleted:false
            },
            {
                id:108, type:'info', title:'Análisis semanal generado',
                message:'Tu análisis de consumo de la semana del 28 abr – 4 may está disponible.',
                device:'Análisis', timestamp:'2026-05-05T08:00:00',
                priority:'low', section:'analisis',
                unread:false, important:false, deleted:false
            },
            {
                id:109, type:'warning', title:'Límite mensual al 75%',
                message:'Has consumido el 75% de tu límite mensual. Quedan 87 kWh disponibles.',
                device:'Sistema', timestamp:'2026-05-04T12:00:00',
                priority:'medium', section:'alertas',
                unread:false, important:false, deleted:false
            }
        ];

        notifications = [...fromAlerts, ...extra];
    }

    // ── Inicializar ────────────────────────────────────────────────────────
    function init() {
        buildNotifications();
        renderPanel();
        updateBadge();
        setupGlobalEvents();
    }

    // ── Renderizar panel completo ──────────────────────────────────────────
    function renderPanel() {
        const panel = document.getElementById('notifPanel');
        if (!panel) return;

        const active  = notifications.filter(n => !n.deleted);
        const unread  = active.filter(n => n.unread).length;
        const total   = active.length;
        const impCount= active.filter(n => n.important).length;

        panel.innerHTML = `
            <div class="notif-panel-header">
                <div class="notif-panel-top">
                    <div class="notif-panel-title">
                        <i class="fas fa-bell"></i>
                        <span>Notificaciones</span>
                        ${unread > 0 ? `<span class="notif-unread-count">${unread} nuevas</span>` : ''}
                    </div>
                    <button class="notif-panel-close" id="notifPanelClose" type="button" title="Cerrar panel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notif-tabs">
                    <button class="notif-tab ${currentTab==='all'       ?'active':''}" data-tab="all"       type="button">Todas (${total})</button>
                    <button class="notif-tab ${currentTab==='unread'    ?'active':''}" data-tab="unread"    type="button">Sin leer (${unread})</button>
                    <button class="notif-tab ${currentTab==='important' ?'active':''}" data-tab="important" type="button">Importantes (${impCount})</button>
                </div>
            </div>

            <div class="notif-toolbar">
                <div class="notif-toolbar-left">
                    <label class="notif-select-all" title="Seleccionar todas">
                        <input type="checkbox" id="notifSelectAll">
                        <span>Seleccionar todo</span>
                    </label>
                </div>
                <div class="notif-toolbar-right">
                    <button class="notif-action-btn read" id="notifMarkAllRead" type="button" title="Marcar todas como leídas">
                        <i class="fas fa-check-double"></i><span>Todas leídas</span>
                    </button>
                    <div class="notif-toolbar-sep"></div>
                    <button class="notif-action-btn read" id="notifMarkRead" type="button" title="Marcar seleccionadas como leídas" disabled>
                        <i class="fas fa-envelope-open"></i><span>Leídas</span>
                    </button>
                    <div class="notif-toolbar-sep"></div>
                    <button class="notif-action-btn star" id="notifMarkImportant" type="button" title="Marcar seleccionadas como importantes" disabled>
                        <i class="fas fa-star"></i><span>Importante</span>
                    </button>
                    <div class="notif-toolbar-sep"></div>
                    <button class="notif-action-btn danger" id="notifDeleteSelected" type="button" title="Eliminar seleccionadas" disabled>
                        <i class="fas fa-trash"></i><span>Eliminar</span>
                    </button>
                </div>
            </div>

            <div class="notif-list" id="notifList"></div>

            <div class="notif-panel-footer">
                <a href="${base}alertas.html" class="notif-footer-link">
                    <i class="fas fa-external-link-alt"></i>
                    Ver centro de alertas
                </a>
                <span class="notif-footer-stats">${total} notificaciones</span>
            </div>`;

        renderList();
        bindPanelEvents();
    }

    // ── Renderizar lista ───────────────────────────────────────────────────
    function renderList() {
        const list = document.getElementById('notifList');
        if (!list) return;

        let items = notifications.filter(n => !n.deleted);
        if (currentTab === 'unread')    items = items.filter(n => n.unread);
        if (currentTab === 'important') items = items.filter(n => n.important);

        if (!items.length) {
            const msgs = {
                all:       { icon:'fa-bell-slash',  title:'Sin notificaciones',  desc:'No tienes notificaciones pendientes.' },
                unread:    { icon:'fa-check-circle', title:'Todo al día',         desc:'No tienes notificaciones sin leer.' },
                important: { icon:'fa-star',         title:'Sin importantes',     desc:'No has marcado notificaciones como importantes.' }
            };
            const m = msgs[currentTab];
            list.innerHTML = `
                <div class="notif-empty">
                    <div class="notif-empty-icon"><i class="fas ${m.icon}"></i></div>
                    <div class="notif-empty-title">${m.title}</div>
                    <div class="notif-empty-desc">${m.desc}</div>
                </div>`;
            return;
        }

        const typeIcons = {
            critical:'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info:    'fa-info-circle',
            success: 'fa-check-circle'
        };

        const sectionLabels = {
            alertas:         'Alertas',
            dispositivos:    'Dispositivos',
            analisis:        'Análisis',
            recomendaciones: 'Recomendaciones',
            configuracion:   'Configuración'
        };

        const sectionIcons = {
            alertas:         'fa-bell',
            dispositivos:    'fa-microchip',
            analisis:        'fa-chart-bar',
            recomendaciones: 'fa-lightbulb',
            configuracion:   'fa-cog'
        };

        list.innerHTML = items.map(function (n) {
            const checked   = selectedIds.has(n.id) ? 'checked' : '';
            const selClass  = selectedIds.has(n.id) ? 'selected' : '';
            const unreadCls = n.unread    ? 'unread'    : '';
            const impCls    = n.important ? 'important' : '';
            const starIcon  = n.important ? 'fas fa-star' : 'far fa-star';
            const starColor = n.important ? 'style="color:var(--warning-color)"' : '';
            const readIcon  = n.unread    ? 'fa-envelope-open' : 'fa-envelope';
            const readTitle = n.unread    ? 'Marcar como leída' : 'Marcar como no leída';
            const navUrl    = getNavUrl(n);
            const secLabel  = sectionLabels[n.section] || 'Sistema';
            const secIcon   = sectionIcons[n.section]  || 'fa-bell';
            const dotHtml   = n.unread ? '<span style="display:inline-block;width:7px;height:7px;background:var(--secondary-blue);border-radius:50%;margin-left:5px;vertical-align:middle;flex-shrink:0"></span>' : '';

            return `
                <div class="notif-item notif-${n.type} ${unreadCls} ${impCls} ${selClass}" data-id="${n.id}" data-url="${navUrl}">
                    <div class="notif-item-check">
                        <input type="checkbox" ${checked} data-id="${n.id}" title="Seleccionar">
                    </div>
                    <div class="notif-item-icon-wrap notif-item-icon">
                        <i class="fas ${typeIcons[n.type] || 'fa-bell'}"></i>
                    </div>
                    <div class="notif-item-body">
                        <div class="notif-item-title">${n.title}${dotHtml}</div>
                        <div class="notif-item-msg">${n.message}</div>
                        <div class="notif-item-meta">
                            <span class="notif-item-device">
                                <i class="fas ${secIcon}" style="font-size:10px;color:var(--secondary-blue)"></i>
                                ${secLabel}
                            </span>
                            <span style="color:var(--border-color)">·</span>
                            <span class="notif-item-device">
                                <i class="fas fa-microchip" style="font-size:10px"></i>
                                ${n.device}
                            </span>
                            <span class="notif-item-time">${relativeTime(n.timestamp)}</span>
                        </div>
                    </div>
                    <div class="notif-item-actions">
                        <button class="notif-item-btn star-btn" type="button" title="${n.important ? 'Quitar importante' : 'Marcar importante'}" data-action="star" data-id="${n.id}">
                            <i class="${starIcon}" ${starColor}></i>
                        </button>
                        <button class="notif-item-btn read-btn" type="button" title="${readTitle}" data-action="read" data-id="${n.id}">
                            <i class="fas ${readIcon}"></i>
                        </button>
                        <button class="notif-item-btn delete-btn" type="button" title="Eliminar" data-action="delete" data-id="${n.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>`;
        }).join('');

        // Sync checkbox "seleccionar todo"
        const selectAll = document.getElementById('notifSelectAll');
        if (selectAll) {
            const allIds = items.map(n => n.id);
            const allSel = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
            selectAll.checked       = allSel;
            selectAll.indeterminate = !allSel && selectedIds.size > 0;
        }

        updateToolbarButtons();
    }

    // ── Eventos del panel ──────────────────────────────────────────────────
    function bindPanelEvents() {
        // Cerrar
        const closeBtn = document.getElementById('notifPanelClose');
        if (closeBtn) closeBtn.addEventListener('click', closePanel);

        // Tabs
        document.querySelectorAll('.notif-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                currentTab = this.dataset.tab;
                selectedIds.clear();
                renderPanel();
            });
        });

        // Seleccionar todo
        const selectAll = document.getElementById('notifSelectAll');
        if (selectAll) {
            selectAll.addEventListener('change', function () {
                const active  = notifications.filter(n => !n.deleted);
                const visible = currentTab === 'all'       ? active :
                                currentTab === 'unread'    ? active.filter(n => n.unread) :
                                active.filter(n => n.important);
                if (this.checked) visible.forEach(n => selectedIds.add(n.id));
                else selectedIds.clear();
                renderList();
            });
        }

        // Marcar TODAS como leídas (botón principal)
        const markAllRead = document.getElementById('notifMarkAllRead');
        if (markAllRead) markAllRead.addEventListener('click', function () {
            notifications.forEach(n => { if (!n.deleted) n.unread = false; });
            selectedIds.clear();
            renderPanel();
            updateBadge();
            showToastGlobal('Todas las notificaciones marcadas como leídas', 'success');
        });

        // Marcar seleccionadas como leídas
        const markRead = document.getElementById('notifMarkRead');
        if (markRead) markRead.addEventListener('click', function () {
            selectedIds.forEach(function (id) {
                const n = notifications.find(x => x.id === id);
                if (n) n.unread = false;
            });
            selectedIds.clear();
            renderPanel();
            updateBadge();
            showToastGlobal('Notificaciones marcadas como leídas', 'success');
        });

        // Marcar importantes
        const markImp = document.getElementById('notifMarkImportant');
        if (markImp) markImp.addEventListener('click', function () {
            let allImp = true;
            selectedIds.forEach(function (id) {
                const n = notifications.find(x => x.id === id);
                if (n && !n.important) allImp = false;
            });
            selectedIds.forEach(function (id) {
                const n = notifications.find(x => x.id === id);
                if (n) n.important = !allImp;
            });
            selectedIds.clear();
            renderPanel();
            showToastGlobal(allImp ? 'Quitadas de importantes' : 'Marcadas como importantes', 'success');
        });

        // Eliminar seleccionadas
        const delSel = document.getElementById('notifDeleteSelected');
        if (delSel) delSel.addEventListener('click', function () {
            if (!confirm('¿Eliminar ' + selectedIds.size + ' notificación(es)?')) return;
            selectedIds.forEach(function (id) {
                const n = notifications.find(x => x.id === id);
                if (n) n.deleted = true;
            });
            selectedIds.clear();
            renderPanel();
            updateBadge();
            showToastGlobal('Notificaciones eliminadas', 'success');
        });

        // Clicks en la lista
        const listEl = document.getElementById('notifList');
        if (!listEl) return;

        // Checkboxes
        listEl.addEventListener('change', function (e) {
            if (e.target.type === 'checkbox' && e.target.dataset.id) {
                const id = parseInt(e.target.dataset.id);
                if (e.target.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderList();
            }
        });

        // Botones de acción + navegación
        listEl.addEventListener('click', function (e) {
            // Botón de acción (star, read, delete)
            const btn = e.target.closest('[data-action]');
            if (btn) {
                e.stopPropagation();
                const id     = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const notif  = notifications.find(x => x.id === id);
                if (!notif) return;

                if (action === 'star') {
                    notif.important = !notif.important;
                    showToastGlobal(notif.important ? 'Marcada como importante' : 'Quitada de importantes', 'info');
                } else if (action === 'read') {
                    notif.unread = !notif.unread;
                    updateBadge();
                } else if (action === 'delete') {
                    notif.deleted = true;
                    selectedIds.delete(id);
                    updateBadge();
                    showToastGlobal('Notificación eliminada', 'success');
                }
                renderPanel();
                return;
            }

            // Click en el cuerpo del item → navegar a la sección
            const item = e.target.closest('.notif-item');
            if (item && !e.target.closest('.notif-item-check') && !e.target.closest('.notif-item-actions')) {
                const id    = parseInt(item.dataset.id);
                const url   = item.dataset.url;
                const notif = notifications.find(x => x.id === id);

                // Marcar como leída
                if (notif && notif.unread) {
                    notif.unread = false;
                    updateBadge();
                }

                // Navegar a la sección correspondiente
                if (url) {
                    closePanel();
                    setTimeout(function () {
                        window.location.href = url;
                    }, 150);
                }
            }
        });
    }

    // ── Toolbar buttons state ──────────────────────────────────────────────
    function updateToolbarButtons() {
        const has = selectedIds.size > 0;
        ['notifMarkRead','notifMarkImportant','notifDeleteSelected'].forEach(function (id) {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !has;
        });
    }

    // ── Badge ──────────────────────────────────────────────────────────────
    function updateBadge() {
        const count = notifications.filter(n => n.unread && !n.deleted).length;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        const btn = document.getElementById('notifBtn');
        if (btn) btn.classList.toggle('has-unread', count > 0);
    }

    // ── Abrir / cerrar ─────────────────────────────────────────────────────
    function openPanel() {
        const panel = document.getElementById('notifPanel');
        if (panel) { panel.classList.add('show'); panelOpen = true; }
    }

    function closePanel() {
        const panel = document.getElementById('notifPanel');
        if (panel) { panel.classList.remove('show'); panelOpen = false; }
    }

    function togglePanel() {
        if (panelOpen) closePanel();
        else { renderPanel(); openPanel(); }
    }

    // ── Eventos globales ───────────────────────────────────────────────────
    function setupGlobalEvents() {
        const btn = document.getElementById('notifBtn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                togglePanel();
            });
        }

        document.addEventListener('click', function (e) {
            if (!panelOpen) return;
            const panel = document.getElementById('notifPanel');
            const notBtn = document.getElementById('notifBtn');
            if (panel && notBtn && !panel.contains(e.target) && !notBtn.contains(e.target)) {
                closePanel();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panelOpen) closePanel();
        });
    }

    // ── Agregar notificación nueva ─────────────────────────────────────────
    function addNotification(notif) {
        notifications.unshift({
            id:        Date.now(),
            type:      notif.type      || 'info',
            title:     notif.title,
            message:   notif.message   || '',
            device:    notif.device    || 'Sistema',
            timestamp: new Date().toISOString(),
            priority:  notif.priority  || 'low',
            section:   notif.section   || 'alertas',
            unread:    true,
            important: false,
            deleted:   false
        });
        updateBadge();
        if (panelOpen) renderPanel();
    }

    // ── Utilidades ─────────────────────────────────────────────────────────
    function relativeTime(str) {
        const diff = Date.now() - new Date(str).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1)  return 'Ahora mismo';
        if (m < 60) return 'Hace ' + m + ' min';
        const h = Math.floor(m / 60);
        if (h < 24) return 'Hace ' + h + ' h';
        const d = Math.floor(h / 24);
        if (d < 7)  return 'Hace ' + d + ' día' + (d > 1 ? 's' : '');
        return new Date(str).toLocaleDateString('es-ES', { month:'short', day:'numeric' });
    }

    function showToastGlobal(msg, type) {
        if (typeof showToast === 'function') { showToast(msg, type); return; }
        const t = document.createElement('div');
        t.className = 'toast toast-' + (type || 'info');
        const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle' };
        t.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i><span>${msg}</span>`;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
    }

    // ── API pública ────────────────────────────────────────────────────────
    return {
        init,
        addNotification,
        updateBadge,
        closePanel,
        getUnreadCount: function () {
            return notifications.filter(n => n.unread && !n.deleted).length;
        }
    };

})();
