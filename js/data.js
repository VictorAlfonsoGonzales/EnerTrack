// ── EnerTrack · Datos simulados del sistema ────────────────────────────────
const EnerTrackData = {

    devices: [
        { id:1,  name:'Refrigerador',      area:'Cocina',      consumption:145, status:'active',   type:'Electrodoméstico', efficiency:'A+' },
        { id:2,  name:'Aire Acondicionado', area:'Sala',        consumption:320, status:'active',   type:'Climatización',    efficiency:'B'  },
        { id:3,  name:'Lavadora',           area:'Lavandería',  consumption:85,  status:'inactive', type:'Electrodoméstico', efficiency:'A'  },
        { id:4,  name:'Televisor',          area:'Sala',        consumption:95,  status:'active',   type:'Entretenimiento',  efficiency:'A'  },
        { id:5,  name:'Microondas',         area:'Cocina',      consumption:120, status:'inactive', type:'Electrodoméstico', efficiency:'B+' },
        { id:6,  name:'Computadora',        area:'Oficina',     consumption:180, status:'active',   type:'Electrónica',      efficiency:'A'  },
        { id:7,  name:'Iluminación LED',    area:'General',     consumption:45,  status:'active',   type:'Iluminación',      efficiency:'A++'},
        { id:8,  name:'Calentador Agua',    area:'Baño',        consumption:280, status:'active',   type:'Climatización',    efficiency:'C'  },
        { id:9,  name:'Ventilador',         area:'Habitación',  consumption:55,  status:'active',   type:'Climatización',    efficiency:'A+' },
        { id:10, name:'Router WiFi',        area:'Oficina',     consumption:12,  status:'active',   type:'Electrónica',      efficiency:'A++'}
    ],

    alerts: [
        { id:1, type:'critical', title:'Límite mensual al 90%',         message:'Has alcanzado el 90% de tu límite mensual de consumo.',          device:'Sistema',           timestamp:'2026-05-07T10:00:00', priority:'critical' },
        { id:2, type:'warning',  title:'Consumo elevado detectado',     message:'El aire acondicionado ha superado el límite de 300 W.',          device:'Aire Acondicionado', timestamp:'2026-05-07T14:30:00', priority:'high'     },
        { id:3, type:'warning',  title:'Consumo anormal',               message:'El calentador de agua consume más de lo habitual.',              device:'Calentador Agua',    timestamp:'2026-05-06T18:45:00', priority:'medium'   },
        { id:4, type:'info',     title:'Dispositivo conectado',         message:'Nuevo sensor registrado en la cocina correctamente.',            device:'Refrigerador',       timestamp:'2026-05-07T12:15:00', priority:'low'      },
        { id:5, type:'info',     title:'Ahorro detectado esta semana',  message:'Has reducido tu consumo en un 15% respecto a la semana pasada.', device:'Sistema',           timestamp:'2026-05-06T08:00:00', priority:'low'      }
    ],

    recommendations: [
        { id:1, title:'Optimiza el aire acondicionado',   description:'Configura el termostato a 24 °C para reducir el consumo hasta un 20%.', savings:'64 kWh/mes', impact:'high',   category:'Climatización'   },
        { id:2, title:'Reemplaza el calentador de agua',  description:'Tu calentador tiene baja eficiencia. Un modelo A+ podría ahorrar un 40%.', savings:'112 kWh/mes',impact:'high',   category:'Electrodoméstico'},
        { id:3, title:'Lavadora en horario valle',        description:'Programa lavados entre 22:00 y 08:00 para aprovechar tarifas reducidas.', savings:'25 kWh/mes', impact:'medium', category:'Ahorro'          },
        { id:4, title:'Desconecta dispositivos standby',  description:'El televisor y la computadora consumen energía en modo espera.',          savings:'18 kWh/mes', impact:'medium', category:'Ahorro'          },
        { id:5, title:'Limpia el refrigerador',           description:'Limpia las bobinas traseras cada 3 meses para mejorar la eficiencia.',    savings:'12 kWh/mes', impact:'low',    category:'Mantenimiento'   }
    ],

    // Consumo por hora – últimas 24 h (W)
    hourlyConsumption: [
        {hour:'00:00',consumption:180},{hour:'01:00',consumption:165},{hour:'02:00',consumption:155},
        {hour:'03:00',consumption:150},{hour:'04:00',consumption:145},{hour:'05:00',consumption:160},
        {hour:'06:00',consumption:220},{hour:'07:00',consumption:380},{hour:'08:00',consumption:450},
        {hour:'09:00',consumption:420},{hour:'10:00',consumption:390},{hour:'11:00',consumption:410},
        {hour:'12:00',consumption:480},{hour:'13:00',consumption:520},{hour:'14:00',consumption:550},
        {hour:'15:00',consumption:530},{hour:'16:00',consumption:490},{hour:'17:00',consumption:460},
        {hour:'18:00',consumption:520},{hour:'19:00',consumption:580},{hour:'20:00',consumption:620},
        {hour:'21:00',consumption:560},{hour:'22:00',consumption:420},{hour:'23:00',consumption:280}
    ],

    // Consumo diario – última semana (kWh)
    dailyConsumption: [
        {day:'Lun',consumption:8.5},{day:'Mar',consumption:9.2},{day:'Mié',consumption:7.8},
        {day:'Jue',consumption:8.9},{day:'Vie',consumption:9.5},{day:'Sáb',consumption:10.2},
        {day:'Dom',consumption:9.8}
    ],

    // Consumo mensual – último año (kWh)
    monthlyConsumption: [
        {month:'Ene',consumption:245},{month:'Feb',consumption:228},{month:'Mar',consumption:252},
        {month:'Abr',consumption:268},{month:'May',consumption:285},{month:'Jun',consumption:310},
        {month:'Jul',consumption:335},{month:'Ago',consumption:328},{month:'Sep',consumption:295},
        {month:'Oct',consumption:270},{month:'Nov',consumption:258},{month:'Dic',consumption:242}
    ],

    // Consumo por área (W actuales)
    areaConsumption: [
        {area:'Sala',       consumption:415, percentage:33},
        {area:'Cocina',     consumption:350, percentage:28},
        {area:'Baño',       consumption:280, percentage:22},
        {area:'Habitación', consumption:180, percentage:14},
        {area:'Oficina',    consumption:192, percentage:15},
        {area:'Lavandería', consumption:85,  percentage:7 }
    ],

    stats: {
        totalConsumption: 1337,
        dailyAverage:     9.1,
        monthlyLimit:     350,
        currentMonth:     285,
        activeDevices:    7,
        totalDevices:     10,
        activeAlerts:     3,
        monthlySavings:   45,
        efficiency:       78
    },

    // Usuarios del sistema (para admin)
    users: [
        {id:1, name:'Andres', role:'user',  consumption:245, devices:8,  status:'active',   lastLogin:'2026-05-07'},
        {id:2, name:'Victor', role:'user',  consumption:312, devices:12, status:'active',   lastLogin:'2026-05-06'},
        {id:3, name:'Jose',   role:'admin', consumption:198, devices:6,  status:'active',   lastLogin:'2026-05-07'},
        {id:4, name:'Erica',  role:'admin', consumption:276, devices:9,  status:'active',   lastLogin:'2026-05-07'}
    ]
};
