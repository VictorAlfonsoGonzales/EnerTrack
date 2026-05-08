# EnerTrack - Sistema Inteligente de Monitoreo Energético

Sistema web profesional para el monitoreo y control del consumo de energía eléctrica en hogares urbanos.

## Descripción

EnerTrack es un prototipo web completamente funcional desarrollado con tecnologías web estándar (HTML5, CSS3 y JavaScript Vanilla) que permite a los usuarios monitorear, analizar y optimizar su consumo energético en tiempo real.

## Características Principales

### Autenticación
- Sistema de login con validación de credenciales
- Roles diferenciados: Administrador y Usuario
- Gestión de sesiones con localStorage

### Dashboard Administrador
- Vista general del sistema
- Gestión de usuarios
- Estadísticas globales
- Monitoreo de todos los dispositivos
- Alertas del sistema

### Dashboard Usuario
- Consumo personal en tiempo real
- Estadísticas individuales
- Dispositivos propios
- Recomendaciones personalizadas
- Progreso mensual

### Módulos del Sistema

#### 1. Dispositivos
- Visualización de dispositivos conectados
- Filtrado por estado y área
- Vista de tarjetas y tabla
- Información de consumo individual
- Clasificación energética

#### 2. Análisis
- Gráficas de consumo mensual, semanal y diario
- Distribución por áreas
- Tendencias de consumo
- Estadísticas detalladas
- Comparativas de períodos

#### 3. Alertas
- Centro de notificaciones
- Alertas críticas, advertencias e informativas
- Filtrado por tipo
- Historial de alertas
- Priorización automática

#### 4. Recomendaciones
- Consejos inteligentes de ahorro
- Estimación de ahorro potencial
- Clasificación por impacto
- Recomendaciones personalizadas
- Categorización por tipo

#### 5. Configuración
- Perfil de usuario
- Configuración de alertas
- Preferencias del sistema
- Seguridad y contraseña
- Información del sistema

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS, Grid y Flexbox
- **JavaScript Vanilla**: Lógica de aplicación sin frameworks
- **Chart.js**: Visualización de gráficas
- **Font Awesome**: Iconografía profesional

## Estructura del Proyecto

```
EnerTrack/
├── index.html                 # Redirección a landing
├── landing.html               # Landing page principal
├── login.html                 # Página de login
├── html/                      # Páginas HTML del sistema
│   ├── dashboard-admin.html   # Panel administrador
│   ├── dashboard-user.html    # Panel usuario
│   ├── dispositivos.html
│   ├── analisis.html
│   ├── alertas.html
│   ├── recomendaciones.html
│   └── configuracion.html
├── css/                       # Estilos CSS
│   ├── landing.css           # Estilos landing page
│   ├── login.css             # Estilos login
│   ├── common.css            # Estilos compartidos
│   ├── dashboard-admin.css
│   ├── dashboard-user.css
│   ├── dispositivos.css
│   ├── analisis.css
│   ├── alertas.css
│   ├── recomendaciones.css
│   └── configuracion.css
├── js/                        # JavaScript
│   ├── landing.js            # Lógica landing page
│   ├── login.js              # Lógica login
│   ├── auth.js               # Sistema de autenticación
│   ├── data.js               # Datos simulados
│   ├── dashboard-admin.js
│   ├── dashboard-user.js
│   ├── dispositivos.js
│   ├── analisis.js
│   ├── alertas.js
│   ├── recomendaciones.js
│   └── configuracion.js
└── assets/                    # Recursos
    ├── icons/
    └── img/
```

## Usuarios de Prueba

### Administradores (Acceso Total)
| Usuario | Contraseña | Panel |
|---------|-----------|-------|
| Jose    | admin123  | Dashboard Administrador |
| Erica   | admin123  | Dashboard Administrador |

**Capacidades de Administrador:**
- Ver y gestionar todos los usuarios
- Acceso a estadísticas globales
- Monitoreo de todos los dispositivos del sistema
- Gestión completa de alertas
- Configuración avanzada del sistema
- Reportes generales

### Usuarios Estándar (Acceso Personal)
| Usuario | Contraseña | Panel |
|---------|-----------|-------|
| Andres  | user123   | Dashboard Usuario |
| Victor  | user123   | Dashboard Usuario |

**Capacidades de Usuario:**
- Ver solo su consumo personal
- Gestionar solo sus dispositivos
- Recibir alertas personales
- Recomendaciones individuales
- Configuración básica de perfil

## Instalación y Uso

### Opción 1: Abrir Directamente
1. Descarga o clona el repositorio
2. Abre el archivo `index.html` en tu navegador (redirige a landing.html)
3. Explora la landing page
4. Click en "Iniciar Sesión"
5. Usa las credenciales mostradas en la página de login

### Opción 2: Servidor Local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Luego accede a http://localhost:8000
```

### Opción 2: GitHub Pages
1. Sube el proyecto a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main y la carpeta raíz
4. Accede a la URL generada
5. La landing page se mostrará automáticamente

### Opción 3: Servidor Web
1. Copia la carpeta EnerTrack a tu servidor web
2. Accede a través de tu dominio o IP
3. El sistema redirigirá automáticamente a la landing page
4. No requiere configuración adicional

## Características Técnicas

### Diseño Responsive
- Adaptable a monitores grandes, laptops, tablets y móviles
- Breakpoints optimizados para todos los dispositivos
- Sidebar colapsable en dispositivos móviles
- Tablas y gráficas responsivas

### Paleta de Colores
- Azul Primario: #1e3a8a
- Azul Secundario: #3b82f6
- Azul Eléctrico: #0ea5e9
- Fondo Oscuro: #0f172a
- Fondo de Tarjetas: #1e293b

### Funcionalidades Implementadas
- Autenticación con roles
- Gestión de sesiones
- Visualización de datos en tiempo real
- Gráficas interactivas
- Filtrado y búsqueda
- Modales y formularios
- Animaciones y transiciones
- Sistema de alertas
- Recomendaciones inteligentes

## Navegación del Sistema

### Flujo de Usuario Estándar
1. Login → Dashboard Usuario
2. Ver consumo actual y estadísticas
3. Revisar dispositivos conectados
4. Analizar tendencias de consumo
5. Consultar alertas activas
6. Revisar recomendaciones de ahorro
7. Configurar preferencias

### Flujo de Administrador
1. Login → Dashboard Administrador
2. Vista general del sistema
3. Gestión de usuarios
4. Monitoreo global de dispositivos
5. Análisis de consumo general
6. Gestión de alertas del sistema
7. Configuración avanzada

## Compatibilidad

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Características de Seguridad

- Validación de credenciales
- Control de acceso por roles
- Protección de rutas
- Gestión segura de sesiones
- Validación de formularios

## Rendimiento

- Carga rápida sin dependencias pesadas
- Optimización de imágenes y recursos
- CSS y JS modulares
- Animaciones con GPU
- Lazy loading de componentes

## Futuras Mejoras

- Integración con API real
- Base de datos persistente
- Notificaciones push
- Exportación de reportes PDF
- Integración con dispositivos IoT
- Aplicación móvil nativa
- Análisis predictivo con IA

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## Licencia

Proyecto académico - EnerTrack 2026

## Créditos

Desarrollado como prototipo funcional del proyecto tecnológico "EnerTrack – Sistema inteligente de monitoreo y control del consumo de energía eléctrica en hogares urbanos".

---

**Versión**: 1.0.0  
**Fecha**: Mayo 2026  
**Estado**: Prototipo Funcional
