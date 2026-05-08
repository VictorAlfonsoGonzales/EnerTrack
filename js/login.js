// ── EnerTrack · Login ──────────────────────────────────────────────────────

const USERS = {
    'Jose':   { password: 'admin123', role: 'admin' },
    'Erica':  { password: 'admin123', role: 'admin' },
    'Andres': { password: 'user123',  role: 'user'  },
    'Victor': { password: 'user123',  role: 'user'  }
};

// ── Redirigir si ya hay sesión ─────────────────────────────────────────────
(function checkSession() {
    try {
        const raw = localStorage.getItem('enertrack_session');
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s && s.role) {
            window.location.href = s.role === 'admin'
                ? 'html/dashboard-admin.html'
                : 'html/dashboard-user.html';
        }
    } catch (_) { localStorage.removeItem('enertrack_session'); }
})();

// ── Tabs ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.form-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        const target = this.dataset.tab;
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.form-card').forEach(c => c.classList.remove('active'));
        const card = document.getElementById('form' + target.charAt(0).toUpperCase() + target.slice(1));
        if (card) card.classList.add('active');
    });
});

// ── Credenciales de prueba ─────────────────────────────────────────────────
document.querySelectorAll('.cred-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
        document.getElementById('username').value = this.dataset.user;
        document.getElementById('password').value = this.dataset.pass;
        document.querySelectorAll('.cred-pill').forEach(p => p.classList.remove('selected'));
        this.classList.add('selected');
        clearLoginErrors();
        document.getElementById('btnSubmit').focus();
    });
});

// ── Toggle contraseña login ────────────────────────────────────────────────
document.getElementById('togglePass').addEventListener('click', function () {
    const inp = document.getElementById('password');
    const ico = document.getElementById('eyeIcon');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    ico.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    inp.focus();
});

// ── Toggle contraseña registro ─────────────────────────────────────────────
document.getElementById('toggleRegPass').addEventListener('click', function () {
    const inp = document.getElementById('regPass');
    const ico = document.getElementById('regEyeIcon');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    ico.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    inp.focus();
});

// ── Indicador de fortaleza de contraseña ───────────────────────────────────
document.getElementById('regPass').addEventListener('input', function () {
    const val = this.value;
    const wrap = document.getElementById('passStrength');
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (!val) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
        { pct:'20%', color:'#ef4444', text:'Muy débil' },
        { pct:'40%', color:'#f97316', text:'Débil' },
        { pct:'60%', color:'#f59e0b', text:'Regular' },
        { pct:'80%', color:'#84cc16', text:'Buena' },
        { pct:'100%',color:'#10b981', text:'Muy fuerte' }
    ];
    const lvl = levels[Math.min(score - 1, 4)] || levels[0];
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color;
});

// ── Limpiar errores al escribir ────────────────────────────────────────────
['username','password'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', clearLoginErrors);
});

function clearLoginErrors() {
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('username').classList.remove('input-error','input-ok');
    document.getElementById('password').classList.remove('input-error','input-ok');
    hideAlert('alertError');
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    handleLogin();
});

document.getElementById('username').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('password').focus(); }
});
document.getElementById('password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
});

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    clearLoginErrors();
    let ok = true;
    if (!username) {
        document.getElementById('usernameError').textContent = 'El usuario es obligatorio';
        document.getElementById('username').classList.add('input-error');
        ok = false;
    }
    if (!password) {
        document.getElementById('passwordError').textContent = 'La contraseña es obligatoria';
        document.getElementById('password').classList.add('input-error');
        ok = false;
    }
    if (!ok) return;

    setLoginLoading(true);

    setTimeout(function () {
        const user = USERS[username];
        if (!user) {
            setLoginLoading(false);
            document.getElementById('username').classList.add('input-error');
            document.getElementById('usernameError').textContent = 'Usuario no encontrado';
            showAlert('alertError', 'alertMsg', 'El usuario "' + username + '" no existe en el sistema');
            return;
        }
        if (user.password !== password) {
            setLoginLoading(false);
            document.getElementById('password').classList.add('input-error');
            document.getElementById('passwordError').textContent = 'Contraseña incorrecta';
            showAlert('alertError', 'alertMsg', 'La contraseña ingresada no es correcta');
            document.getElementById('password').select();
            return;
        }
        // Éxito
        const remember = document.getElementById('rememberMe').checked;
        const session = { username, role: user.role, loginTime: new Date().toISOString() };
        if (remember) {
            localStorage.setItem('enertrack_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('enertrack_session', JSON.stringify(session));
            localStorage.setItem('enertrack_session', JSON.stringify(session));
        }
        document.getElementById('username').classList.add('input-ok');
        document.getElementById('password').classList.add('input-ok');
        window.location.href = user.role === 'admin'
            ? 'html/dashboard-admin.html'
            : 'html/dashboard-user.html';
    }, 350);
}

function setLoginLoading(on) {
    const btn = document.getElementById('btnSubmit');
    btn.disabled = on;
    document.getElementById('btnText').textContent = on ? 'Verificando...' : 'Iniciar Sesión';
    document.getElementById('btnSpinner').classList.toggle('show', on);
    document.getElementById('btnIcon').style.display = on ? 'none' : '';
}

// ── REGISTRO ───────────────────────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    handleRegister();
});

function handleRegister() {
    const name     = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const pass     = document.getElementById('regPass').value;
    const confirm  = document.getElementById('regPassConfirm').value;
    const terms    = document.getElementById('regTerms').checked;

    // Limpiar errores
    ['regNameErr','regUsernameErr','regEmailErr','regPassErr','regPassConfirmErr','regTermsErr'].forEach(function (id) {
        document.getElementById(id).textContent = '';
    });
    hideAlert('regAlertError');
    document.getElementById('regAlertSuccess').style.display = 'none';

    let ok = true;
    if (!name)     { document.getElementById('regNameErr').textContent = 'El nombre es obligatorio'; ok = false; }
    if (!username) { document.getElementById('regUsernameErr').textContent = 'El usuario es obligatorio'; ok = false; }
    if (username && USERS[username]) { document.getElementById('regUsernameErr').textContent = 'Este usuario ya existe'; ok = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('regEmailErr').textContent = 'Ingresa un correo válido'; ok = false;
    }
    if (!pass || pass.length < 6) { document.getElementById('regPassErr').textContent = 'Mínimo 6 caracteres'; ok = false; }
    if (pass !== confirm) { document.getElementById('regPassConfirmErr').textContent = 'Las contraseñas no coinciden'; ok = false; }
    if (!terms) { document.getElementById('regTermsErr').textContent = 'Debes aceptar los términos'; ok = false; }
    if (!ok) return;

    setRegLoading(true);

    setTimeout(function () {
        // Registrar usuario en memoria
        USERS[username] = { password: pass, role: 'user' };
        setRegLoading(false);
        document.getElementById('regAlertSuccess').style.display = 'flex';
        document.getElementById('regSuccessMsg').textContent = '¡Cuenta creada! Ahora puedes iniciar sesión con "' + username + '"';
        document.getElementById('registerForm').reset();
        document.getElementById('passStrength').style.display = 'none';
        // Cambiar a tab login después de 2s
        setTimeout(function () {
            document.getElementById('regAlertSuccess').style.display = 'none';
            document.querySelector('[data-tab="login"]').click();
            document.getElementById('username').value = username;
            document.getElementById('password').focus();
        }, 2200);
    }, 1200);
}

function setRegLoading(on) {
    const btn = document.getElementById('btnRegister');
    btn.disabled = on;
    document.getElementById('btnRegText').textContent = on ? 'Creando cuenta...' : 'Crear Cuenta';
    document.getElementById('btnRegSpinner').classList.toggle('show', on);
    document.getElementById('btnRegIcon').style.display = on ? 'none' : '';
}

// ── RECUPERAR CONTRASEÑA ───────────────────────────────────────────────────
document.getElementById('forgotBtn').addEventListener('click', function () {
    showRecoverForm();
});

document.getElementById('backToLoginBtn').addEventListener('click', function () {
    hideRecoverForm();
});

document.getElementById('btnBackToLogin').addEventListener('click', function () {
    hideRecoverForm();
});

function showRecoverForm() {
    document.querySelectorAll('.form-card').forEach(c => c.classList.remove('active'));
    document.getElementById('formRecover').classList.add('active');
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('recoverStep1').style.display = 'block';
    document.getElementById('recoverStep2').style.display = 'none';
    document.getElementById('recoverFooter').style.display = 'block';
}

function hideRecoverForm() {
    document.querySelectorAll('.form-card').forEach(c => c.classList.remove('active'));
    document.getElementById('formLogin').classList.add('active');
    document.querySelector('[data-tab="login"]').classList.add('active');
    document.getElementById('recoverEmail').value = '';
    document.getElementById('recoverEmailErr').textContent = '';
    hideAlert('recoverAlertError');
}

document.getElementById('recoverForm').addEventListener('submit', function (e) {
    e.preventDefault();
    handleRecover();
});

function handleRecover() {
    const val = document.getElementById('recoverEmail').value.trim();
    document.getElementById('recoverEmailErr').textContent = '';
    hideAlert('recoverAlertError');

    if (!val) {
        document.getElementById('recoverEmailErr').textContent = 'Ingresa tu correo o usuario';
        return;
    }

    // Verificar si existe el usuario
    const exists = USERS[val] || Object.keys(USERS).some(function (u) {
        return u.toLowerCase() === val.toLowerCase();
    });

    const btn = document.getElementById('btnRecover');
    btn.disabled = true;
    document.getElementById('btnRecoverText').textContent = 'Enviando...';
    document.getElementById('btnRecoverSpinner').classList.add('show');
    document.getElementById('btnRecoverIcon').style.display = 'none';

    setTimeout(function () {
        btn.disabled = false;
        document.getElementById('btnRecoverText').textContent = 'Enviar Instrucciones';
        document.getElementById('btnRecoverSpinner').classList.remove('show');
        document.getElementById('btnRecoverIcon').style.display = '';

        if (!exists) {
            showAlert('recoverAlertError', 'recoverAlertMsg', 'No encontramos una cuenta con ese correo o usuario');
            return;
        }
        // Mostrar confirmación
        const emailDisplay = val.includes('@') ? val : val + '@enertrack.com';
        document.getElementById('recoverEmailSent').textContent = emailDisplay;
        document.getElementById('recoverStep1').style.display = 'none';
        document.getElementById('recoverStep2').style.display = 'block';
        document.getElementById('recoverFooter').style.display = 'none';
    }, 1500);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function showAlert(containerId, msgId, msg) {
    const c = document.getElementById(containerId);
    const m = document.getElementById(msgId);
    if (c) c.classList.add('show');
    if (m) m.textContent = msg;
}

function hideAlert(containerId) {
    const c = document.getElementById(containerId);
    if (c) c.classList.remove('show');
}
