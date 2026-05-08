// ── EnerTrack · Landing Page ───────────────────────────────────────────────

const navbar      = document.getElementById('navbar');
const navToggle   = document.getElementById('navToggle');
const navMenu     = document.getElementById('navMenu');
const navLinks    = document.querySelectorAll('.nav-link');
const scrollTopBtn = document.getElementById('scrollTopLanding');

// ── Navbar scroll ──────────────────────────────────────────────────────────
window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 400);
}, { passive: true });

// ── Scroll top ─────────────────────────────────────────────────────────────
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Menú hamburguesa ───────────────────────────────────────────────────────
navToggle.addEventListener('click', function () {
    const open = navMenu.classList.toggle('active');
    const spans = navToggle.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
    }
});

// Cerrar menú al hacer clic en un enlace
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
    }
});

// ── Active link en scroll ──────────────────────────────────────────────────
window.addEventListener('scroll', function () {
    let current = '';
    document.querySelectorAll('section[id]').forEach(function (sec) {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}, { passive: true });

// ── Smooth scroll para anclas ──────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ── Animaciones de entrada con IntersectionObserver ────────────────────────
const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity  = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.feature-card, .func-card, .benefit-item, .project-card, .team-card, .sprint-card').forEach(function (el) {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ── Parallax suave en hero ─────────────────────────────────────────────────
window.addEventListener('mousemove', function (e) {
    const x = (e.clientX / window.innerWidth  - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    document.querySelectorAll('.hero-circle').forEach(function (c, i) {
        const factor = (i + 1) * 0.4;
        c.style.transform = 'translate(' + (x * factor) + 'px,' + (y * factor) + 'px)';
    });
}, { passive: true });
