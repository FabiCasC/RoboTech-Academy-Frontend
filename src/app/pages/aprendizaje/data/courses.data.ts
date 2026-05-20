import { Course, Lesson } from '../models/learning.models';

const TCRT_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/TCRT5000_Line_Sensor.jpg/640px-TCRT5000_Line_Sensor.jpg';
const TCRT_DIAGRAM =
  'https://lastminuteengineers.com/wp-content/uploads/arduino/TCRT5000-Line-Tracker-Sensor-Module-Pinout.png';
const PID_DIAGRAM =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/PID.svg/640px-PID.svg.png';
const LINE_SENSOR_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/IR_sensor.jpg/640px-IR_sensor.jpg';

function lessonsRoboticaBasica(): Lesson[] {
  return [
    {
      id: 'introduccion',
      order: 1,
      sidebarTitle: 'INTRODUCCIÓN',
      lessonTag: 'LECCIÓN 1',
      heading: 'Bienvenida a la Robótica Básica',
      paragraphs: [
        'La robótica móvil combina mecánica, electrónica y programación para crear sistemas que perciben el entorno y actúan sobre él. En este módulo aprenderás los bloques esenciales: sensores, actuadores y lógica de control embebida.',
        'Trabajarás con microcontroladores como Arduino o STM32, simulando y luego implementando comportamientos reales en un chasis diferencial. Cada lección incluye diagramas y ejemplos listos para el laboratorio virtual.'
      ],
      showComponentViewer: true
    },
    {
      id: 'fundamentos-sensores',
      order: 2,
      sidebarTitle: 'FUNDAMENTOS DE SENSORES',
      lessonTag: 'LECCIÓN 2',
      heading: 'Cómo percibe un robot el mundo',
      paragraphs: [
        'Los sensores convierten magnitudes físicas (distancia, luz, inclinación) en señales eléctricas digitales o analógicas. Un robot sin sensores es ciego: no puede seguir líneas, evitar obstáculos ni mantener equilibrio.',
        'Clasificamos los sensores en proximidad, navegación (IMU, encoders) y visión. La calibración y el filtrado de ruido son tan importantes como la lectura cruda del pin.'
      ],
      diagramTitle: 'TAXONOMÍA DE SENSORES EN ROBÓTICA MÓVIL',
      diagramImage:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
      showComponentViewer: false
    },
    {
      id: 'sensor-ir',
      order: 3,
      sidebarTitle: '¿QUÉ ES UN SENSOR IR?',
      lessonTag: 'LECCIÓN 3',
      heading: 'El Sensor Infrarrojo (TCRT5000)',
      paragraphs: [
        'El TCRT5000 es un componente fundamental en robótica móvil para detectar reflectividad a corta distancia. Integra un LED emisor infrarrojo y un fototransistor receptor en un solo encapsulado, permitiendo distinguir superficies oscuras de claras — base de seguidores de línea y detección de bordes.',
        'Su salida analógica o digital (según el módulo) varía con la cantidad de luz reflejada. A 2–15 mm del suelo suele ofrecer la mejor discriminación entre cinta negra y piso blanco.'
      ],
      diagramTitle: 'DIAGRAMA ESQUEMÁTICO DE CONEXIÓN',
      diagramImage: TCRT_DIAGRAM,
      showComponentViewer: true
    },
    {
      id: 'logica-control',
      order: 4,
      sidebarTitle: 'LÓGICA DE CONTROL',
      lessonTag: 'LECCIÓN 4',
      heading: 'De la lectura del sensor a la acción del motor',
      paragraphs: [
        'Un algoritmo típico compara el valor del sensor con un umbral calibrado: si detecta línea, gira hacia un lado; si no, avanza. Este comportamiento bang-bang es simple pero efectivo para competencias escolares.',
        'Mejoras incluyen control proporcional (más desviación → más corrección) y lectura de varios sensores para estimar la posición respecto a la línea.'
      ],
      diagramTitle: 'FLUJO DE CONTROL PARA SEGUIDOR DE LÍNEA',
      diagramImage: LINE_SENSOR_IMG,
      showComponentViewer: true
    },
    {
      id: 'validacion-final',
      order: 5,
      sidebarTitle: 'VALIDACIÓN FINAL',
      lessonTag: 'LECCIÓN 5',
      heading: 'Prueba de competencias del módulo',
      paragraphs: [
        'Integra sensor IR, driver de motores y bucle de control en un sketch completo. Calibra umbrales con el robot sobre la pista real, no solo en simulación.',
        'Criterios de éxito: seguir una línea de al menos 2 metros, recuperarse tras una curva de 90° y detenerse ante una marca de parada (cinta perpendicular).'
      ],
      showComponentViewer: true
    }
  ];
}

function lessonsSistemasControl(): Lesson[] {
  return [
    {
      id: 'introduccion',
      order: 1,
      sidebarTitle: 'INTRODUCCIÓN',
      lessonTag: 'LECCIÓN 1',
      heading: 'Sistemas de control en robótica',
      paragraphs: [
        'Un sistema de control compara la salida deseada (referencia) con la medida real (retroalimentación) y calcula la acción correctiva. En robots, esto estabiliza velocidad, orientación o posición.',
        'Dominar lazos abiertos y cerrados es clave antes de sintonizar controladores PID en motores y servos.'
      ],
      showComponentViewer: true
    },
    {
      id: 'retroalimentacion',
      order: 2,
      sidebarTitle: 'LAZO CERRADO',
      lessonTag: 'LECCIÓN 2',
      heading: 'Retroalimentación y error de seguimiento',
      paragraphs: [
        'El error e(t) = r(t) − y(t) indica cuánto nos alejamos del objetivo. Un controlador procesa ese error para generar la señal u(t) al actuador.',
        'Sensores como encoders en las ruedas o giroscopios IMU proveen y(t). Sin ellos, el sistema es a ciegas ante perturbaciones (pendientes, rozamiento).'
      ],
      diagramTitle: 'DIAGRAMA DE BLOQUES — LAZO CERRADO',
      diagramImage: PID_DIAGRAM,
      showComponentViewer: false
    },
    {
      id: 'control-pid',
      order: 3,
      sidebarTitle: 'CONTROL PID',
      lessonTag: 'LECCIÓN 3',
      heading: 'Controlador PID: P, I y D',
      paragraphs: [
        'El término proporcional reacciona al error actual; el integral elimina error estacionario acumulando pasado; el derivativo anticipa cambios frenando oscilaciones.',
        'En robótica, PID regula velocidad de DC motors (entrada PWM) o ángulo de un brazo (posición de servo). Kp, Ki y Kd se ajustan por prueba y error o métodos como Ziegler-Nichols.'
      ],
      diagramTitle: 'RESPUESTA TÍPICA ANTE UN ESCALÓN',
      diagramImage:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
      showComponentViewer: true
    },
    {
      id: 'giroscopio',
      order: 4,
      sidebarTitle: 'ESTABILIZACIÓN IMU',
      lessonTag: 'LECCIÓN 4',
      heading: 'Giroscopio y fusión de sensores',
      paragraphs: [
        'Un IMU (MPU6050, BNO055) entrega aceleración y velocidad angular. Combinando con un filtro complementario o Kalman se estima la inclinación del robot — vital en equilibrio invertido o drones.',
        'La estabilización usa un lazo interno rápido (actitud) y un lazo externo lento (posición), cascada típica en cuadricópteros y self-balancing robots.'
      ],
      diagramTitle: 'EJES DE ROTACIÓN — ROLL, PITCH, YAW',
      diagramImage:
        'https://images.unsplash.com/photo-1635070041078-e43d960a2d84?auto=format&fit=crop&w=900&q=80',
      showComponentViewer: true
    },
    {
      id: 'validacion-final',
      order: 5,
      sidebarTitle: 'VALIDACIÓN FINAL',
      lessonTag: 'LECCIÓN 5',
      heading: 'Sintonización y prueba de lazo',
      paragraphs: [
        'Implementa un PID de velocidad: referencia en rpm, salida en PWM limitado. Registra respuesta con Serial Plotter o Logic Analyzer.',
        'Meta: tiempo de establecimiento < 2 s, sobrepico < 10 % y error estacionario nulo en carga constante.'
      ],
      showComponentViewer: true
    }
  ];
}

function lessonsRobotLinea(): Lesson[] {
  return [
    {
      id: 'introduccion',
      order: 1,
      sidebarTitle: 'INTRODUCCIÓN',
      lessonTag: 'LECCIÓN 1',
      heading: 'Robot seguidor de línea',
      paragraphs: [
        'Un robot seguidor de línea (line follower) usa sensores reflectivos para mantenerse sobre una cinta oscura sobre fondo claro. Es el proyecto introductorio más popular en competencias de robótica educativa.',
        'Aprenderás montaje mecánico, lectura multiplexada de sensores y estrategias de navegación en curvas y cruces.'
      ],
      showComponentViewer: true
    },
    {
      id: 'sensores-linea',
      order: 2,
      sidebarTitle: 'SENSORES DE LÍNEA',
      lessonTag: 'LECCIÓN 2',
      heading: 'Array de sensores IR',
      paragraphs: [
        'Se usan de 3 a 8 sensores TCRT5000 en barra frontal. Cada uno entrega HIGH/LOW según reflectividad. Un array permite detectar si la línea está centrada, desviada a la izquierda o a la derecha.',
        'La calibración guarda valores mínimo y máximo por sensor al pasar sobre negro y blanco, mejorando robustez ante cambios de luz ambiental.'
      ],
      diagramTitle: 'DISPOSICIÓN DE SENSORES EN EL CHASIS',
      diagramImage: TCRT_IMG,
      showComponentViewer: true
    },
    {
      id: 'algoritmo-seguimiento',
      order: 3,
      sidebarTitle: 'ALGORITMO DE SEGUIMIENTO',
      lessonTag: 'LECCIÓN 3',
      heading: 'Estimación de posición y corrección',
      paragraphs: [
        'Se calcula un error ponderado: sensores izquierdos suman −1, derechos +1. El error cero indica línea centrada. Con PID sobre ese error se modula velocidad diferencial de las ruedas.',
        'En cruces en T o cruz, reglas especiales evitan que el robot se pierda: priorizar avance recto o girar según última dirección conocida.'
      ],
      diagramTitle: 'LECTURA PONDERADA DEL ARRAY',
      diagramImage: LINE_SENSOR_IMG,
      showComponentViewer: true
    },
    {
      id: 'calibracion',
      order: 4,
      sidebarTitle: 'CALIBRACIÓN EN PISTA',
      lessonTag: 'LECCIÓN 4',
      heading: 'Ajuste fino en condiciones reales',
      paragraphs: [
        'Umbrales fijos fallan bajo sol directo o superficies brillantes. Rutina de calibración: rotar el robot sobre la pista 3 s capturando min/max por canal.',
        'Ajusta velocidad base y ganancia PID en rectas y curvas de 90° por separado; muchas pistas exigen perfil lento en curva y rápido en recta.'
      ],
      showComponentViewer: true
    },
    {
      id: 'validacion-final',
      order: 5,
      sidebarTitle: 'VALIDACIÓN FINAL',
      lessonTag: 'LECCIÓN 5',
      heading: 'Carrera contra reloj',
      paragraphs: [
        'Monta la pista oficial o usa cinta negra de 19 mm sobre PVC blanco. Cronometra tres vueltas consecutivas sin intervención manual.',
        'Bonus: implementa detección de bifurcación para elegir camino corto según reglas de la competencia.'
      ],
      showComponentViewer: true
    }
  ];
}

export const COURSES: Course[] = [
  {
    id: 'robotica-basica',
    badge: 'ID: RB-101',
    title: 'ROBOTICA BASICA',
    description: 'fundamentos de cinemática, dinámica de actuadores y...',
    progress: 45,
    image:
      'https://png.pngtree.com/thumb_back/fh260/background/20230623/pngtree-futuristic-robot-arms-in-3d-render-on-black-background-image_3658036.jpg',
    modules: [
      {
        id: 'modulo-1',
        number: 1,
        title: 'MÓDULO 1',
        subtitle: 'SENSORES DE PROXIMIDAD',
        lessons: lessonsRoboticaBasica()
      }
    ]
  },
  {
    id: 'sistemas-control',
    badge: 'ID: SC-205',
    title: 'SISTEMAS DE CONTROL',
    description: 'Lazos de retroalimentación PID, estabilización de giroscopios y...',
    progress: 89,
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: [
      {
        id: 'modulo-1',
        number: 1,
        title: 'MÓDULO 1',
        subtitle: 'CONTROL Y RETROALIMENTACIÓN',
        lessons: lessonsSistemasControl()
      }
    ]
  },
  {
    id: 'robot-linea',
    badge: 'ID: DR-100',
    title: 'ROBOT DEGUIDOR DE LINEA',
    description:
      'sistema autónomo capaz de detectar una trayectoria marcada y seguirla de manera precisa.',
    progress: 12,
    image:
      'https://www.shutterstock.com/image-illustration/tech-love-3d-arduino-heart-260nw-2430159711.jpg',
    modules: [
      {
        id: 'modulo-1',
        number: 1,
        title: 'MÓDULO 1',
        subtitle: 'SEGUIMIENTO DE LÍNEA',
        lessons: lessonsRobotLinea()
      }
    ]
  }
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function getLessonById(course: Course, lessonId: string): Lesson | undefined {
  return getAllLessons(course).find((l) => l.id === lessonId);
}

export function getContinueLessonId(course: Course): string {
  const lessons = getAllLessons(course);
  const completedCount = Math.floor((course.progress / 100) * lessons.length);
  const index = Math.min(completedCount, lessons.length - 1);
  return lessons[index]?.id ?? lessons[0].id;
}
