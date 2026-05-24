export type ChecklistPractice = {
  kind: 'checklist';
  id: string;
  title: string;
  description: string;
  items: string[];
};

export type QuizPractice = {
  kind: 'quiz';
  id: string;
  title: string;
  description: string;
  questions: Array<{
    prompt: string;
    options: string[];
    answerIndex: number;
  }>;
};

export type WiringPractice = {
  kind: 'wiring';
  id: string;
  title: string;
  description: string;
  rows: Array<{
    component: string;
    componentPin: string;
    expectedArduinoPin: string;
    choices: string[];
  }>;
};

export type StateMachinePractice = {
  kind: 'state-machine';
  id: string;
  title: string;
  description: string;
  actions: string[];
  cases: Array<{
    left: 'BLANCO' | 'NEGRO';
    right: 'BLANCO' | 'NEGRO';
    expectedAction: string;
  }>;
};

export type CoursePractice = ChecklistPractice | QuizPractice | WiringPractice | StateMachinePractice;

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  lessons: string[];
  practices: CoursePractice[];
};

export type CourseProject = {
  title: string;
  objective: string;
  deliverables: string[];
  tools: string[];
};

export type CourseSpecGroup = {
  title: string;
  items: string[];
};

export type CourseConnection = {
  component: string;
  componentPin: string;
  arduinoPin: string;
};

export type CourseControlState = {
  state: string;
  behavior: string;
};

export type CourseSpecs = {
  introTitle: string;
  introText: string;
  referenceVideo: string;
  materialsTitle: string;
  materialsGroups: CourseSpecGroup[];
  connectionsTitle: string;
  connections: CourseConnection[];
  controlTitle: string;
  controlStates: CourseControlState[];
};

export type Course = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  progress: number;
  image: string;
  project: CourseProject;
  modules: CourseModule[];
  specs?: CourseSpecs;
};

export const COURSE_CATALOG: Course[] = [
  {
    slug: 'robotica-basica',
    badge: 'ID: RB-101',
    title: 'ROBOTICA BASICA',
    subtitle: 'Fundamentos para construir y programar tus primeros robots moviles.',
    description: 'Fundamentos de cinematica, dinamica de actuadores y arquitectura basica de un robot.',
    overview:
      'Este curso introduce la estructura de un sistema robotico completo: sensores, actuadores, chasis, energia y control. Al finalizar podras modelar el movimiento de un robot diferencial y justificar la seleccion de componentes segun su tarea.',
    progress: 45,
    image:
      'https://png.pngtree.com/thumb_back/fh260/background/20230623/pngtree-futuristic-robot-arms-in-3d-render-on-black-background-image_3658036.jpg',
    project: {
      title: 'Proyecto integrador: Rover explorador de laboratorio',
      objective:
        'Disenar un rover diferencial capaz de desplazarse por una zona de pruebas, esquivar obstaculos simples y reportar telemetria basica.',
      deliverables: [
        'Diagrama de bloques del robot y seleccion justificada de componentes',
        'Modelo cinematico del sistema de traccion',
        'Video de validacion del desplazamiento en pista corta',
        'Ficha tecnica con consumo energetico y autonomia estimada'
      ],
      tools: ['Arduino o ESP32', 'Motores DC con driver', 'Sensor ultrasonico', 'Protoboard y fuente regulada']
    },
    modules: [
      {
        id: 'rb-101-m1',
        title: 'Modulo 1. Arquitectura robotica',
        duration: '2 semanas',
        summary: 'Reconoce los subsistemas que forman un robot movil y la funcion de cada uno.',
        lessons: [
          'Historia breve de la robotica y tipos de robots',
          'Sensores, actuadores y unidad de control',
          'Flujo de energia y seguridad electrica basica'
        ],
        practices: [
          {
            kind: 'checklist',
            id: 'rb-101-p1',
            title: 'Checklist: arma la arquitectura',
            description: 'Completa los pasos para identificar el flujo de informacion y energia del robot.',
            items: [
              'Identificar sensor, actuador y controlador en el diagrama',
              'Definir la fuente de energia y protecciones basicas',
              'Explicar el flujo de datos: lectura -> decision -> accion'
            ]
          }
        ]
      },
      {
        id: 'rb-101-m2',
        title: 'Modulo 2. Cinematica y movimiento',
        duration: '3 semanas',
        summary: 'Modela trayectorias, velocidades y restricciones del movimiento diferencial.',
        lessons: [
          'Posicion, velocidad y orientacion en 2D',
          'Cinematica directa de un robot diferencial',
          'Conversion de trayectorias a comandos de motor'
        ],
        practices: [
          {
            kind: 'quiz',
            id: 'rb-101-p2',
            title: 'Quiz: movimiento diferencial',
            description: 'Responde para validar conceptos de velocidad, giro y orientacion.',
            questions: [
              {
                prompt: 'En un robot diferencial, ¿que ocurre si ambas ruedas giran a la misma velocidad?',
                options: ['Gira sobre su eje', 'Avanza recto', 'Retrocede en diagonal', 'Se detiene'],
                answerIndex: 1
              },
              {
                prompt: 'Si la rueda derecha gira mas rapido que la izquierda, el robot:',
                options: ['Gira a la izquierda', 'Gira a la derecha', 'Avanza recto', 'No cambia'],
                answerIndex: 0
              },
              {
                prompt: '¿Que variable describe la orientacion en el plano 2D?',
                options: ['X', 'Y', 'Theta', 'RPM'],
                answerIndex: 2
              }
            ]
          }
        ]
      },
      {
        id: 'rb-101-m3',
        title: 'Modulo 3. Actuadores y alimentacion',
        duration: '2 semanas',
        summary: 'Selecciona motores y calcula requerimientos de par, corriente y autonomia.',
        lessons: [
          'Motores DC, servos y reductores',
          'Drivers, PWM y control de velocidad',
          'Baterias, regulacion y proteccion electrica'
        ],
        practices: [
          {
            kind: 'checklist',
            id: 'rb-101-p3',
            title: 'Checklist: energia y actuadores',
            description: 'Deja listo un set minimo de decisiones tecnicas.',
            items: [
              'Seleccionar motor segun torque y voltaje',
              'Elegir driver adecuado para corriente maxima',
              'Estimar autonomia basica con baterias y consumo'
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'sistemas-de-control',
    badge: 'ID: SC-205',
    title: 'SISTEMAS DE CONTROL',
    subtitle: 'Control retroalimentado para estabilizar, corregir y optimizar robots.',
    description: 'Lazos de retroalimentacion PID, estabilizacion de giroscopios y respuesta dinamica.',
    overview:
      'Aprenderas a modelar sistemas de control, interpretar su respuesta temporal y ajustar estrategias PID para mejorar precision y estabilidad. El curso conecta teoria con pruebas experimentales sobre sensores inerciales y motores.',
    progress: 89,
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    project: {
      title: 'Proyecto integrador: Plataforma autoestabilizada',
      objective:
        'Implementar un sistema de control que mantenga la orientacion de una plataforma ante perturbaciones externas usando un sensor IMU.',
      deliverables: [
        'Modelo de planta y supuestos del sistema',
        'Curvas de respuesta antes y despues del ajuste PID',
        'Video de prueba con perturbaciones controladas',
        'Informe tecnico con analisis de sobreimpulso y tiempo de establecimiento'
      ],
      tools: ['ESP32 o Arduino Nano', 'IMU MPU6050', 'Servo o motor DC', 'Serial Plotter o herramienta de graficacion']
    },
    modules: [
      {
        id: 'sc-205-m1',
        title: 'Modulo 1. Bases del control',
        duration: '2 semanas',
        summary: 'Relaciona entrada, salida, error y estabilidad dentro de un lazo cerrado.',
        lessons: [
          'Sistemas de lazo abierto y lazo cerrado',
          'Variables de proceso, referencia y error',
          'Estabilidad y sensibilidad a perturbaciones'
        ],
        practices: [
          {
            kind: 'quiz',
            id: 'sc-205-p1',
            title: 'Quiz: lazo cerrado',
            description: 'Valida conceptos de referencia, error y perturbacion.',
            questions: [
              {
                prompt: 'En un lazo cerrado, la señal que se minimiza es:',
                options: ['La salida', 'El error', 'La referencia', 'El ruido'],
                answerIndex: 1
              },
              {
                prompt: '¿Que hace la retroalimentacion ante perturbaciones?',
                options: ['Las amplifica siempre', 'No afecta', 'Tiende a corregir', 'Elimina sensores'],
                answerIndex: 2
              }
            ]
          }
        ]
      },
      {
        id: 'sc-205-m2',
        title: 'Modulo 2. PID aplicado',
        duration: '3 semanas',
        summary: 'Ajusta controladores proporcionales, integrales y derivativos en contextos reales.',
        lessons: [
          'Efecto de cada termino del PID',
          'Metodos de sintonia inicial',
          'Antiwindup y filtrado de ruido'
        ],
        practices: [
          {
            kind: 'quiz',
            id: 'sc-205-p2',
            title: 'Quiz: terminos PID',
            description: 'Selecciona el efecto correcto de cada termino del PID.',
            questions: [
              {
                prompt: 'El termino integral ayuda principalmente a:',
                options: ['Reducir error estacionario', 'Aumentar ruido', 'Apagar el sistema', 'Saturar sensores'],
                answerIndex: 0
              },
              {
                prompt: 'El termino derivativo es mas sensible a:',
                options: ['Ruido', 'Referencias constantes', 'Voltaje estable', 'Motor apagado'],
                answerIndex: 0
              }
            ]
          }
        ]
      },
      {
        id: 'sc-205-m3',
        title: 'Modulo 3. Validacion experimental',
        duration: '2 semanas',
        summary: 'Compara desempeno mediante metricas temporales y perturbaciones repetibles.',
        lessons: [
          'Tiempo de subida, sobreimpulso y error estacionario',
          'Registro de datos y lectura de graficas',
          'Iteracion del controlador sobre hardware'
        ],
        practices: [
          {
            kind: 'checklist',
            id: 'sc-205-p3',
            title: 'Checklist: valida con metricas',
            description: 'Marca cuando completes la verificacion del controlador.',
            items: [
              'Registrar respuesta ante un cambio de referencia',
              'Calcular sobreimpulso y tiempo de establecimiento',
              'Comparar antes y despues de la sintonia'
            ]
          }
        ]
      }
    ]
  },
  {
    slug: 'robot-seguidor-de-linea',
    badge: 'ID: DR-100',
    title: 'ROBOT SEGUIDOR DE LINEA',
    subtitle: 'MVP educativo para integrar mecanica, electronica y programacion en una pista real.',
    description:
      'Sistema autonomo capaz de detectar una trayectoria marcada y seguirla de manera precisa.',
    overview:
      'Este curso toma como base el MVP del Robot Seguidor de Linea de RoboTech Academy. El estudiante construye un sistema autonomo que detecta una linea negra sobre fondo blanco, interpreta el estado de dos sensores TCRT5000 y ejecuta una logica on-off para corregir su trayectoria en tiempo real.',
    progress: 12,
    image:
      'https://www.shutterstock.com/image-illustration/tech-love-3d-arduino-heart-260nw-2430159711.jpg',
    project: {
      title: 'Proyecto integrador: Seguidor de linea para pista competitiva',
      objective:
        'Construir un robot autonomo que complete una pista con curvas cerradas, rectas y cambios de contraste manteniendo estabilidad y velocidad.',
      deliverables: [
        'Matriz de calibracion de sensores infrarrojos',
        'Algoritmo de lectura, decision y actuacion documentado',
        'Video del recorrido completo sobre pista',
        'Analisis de errores y mejoras de iteracion'
      ],
      tools: ['Arreglo de sensores IR', 'Chasis diferencial', 'Driver de motores', 'Pista de pruebas en blanco y negro']
    },
    specs: {
      introTitle: 'Introduccion al proyecto',
      introText:
        'El Robot Seguidor de Linea es un sistema autonomo capaz de detectar una trayectoria marcada y seguirla de manera precisa. Este MVP integra las tres areas fundamentales de la robotica: mecanica, electronica y programacion.',
      referenceVideo: 'Video de referencia: Como hacer un robot seguidor de lineas | Tutorial facil',
      materialsTitle: 'Kit de materiales detallado (Bill of Materials)',
      materialsGroups: [
        {
          title: 'A. Unidad de control (cerebro)',
          items: [
            'Arduino Uno R3 con ATmega328P para procesar señales y controlar actuadores.',
            'Cable USB Tipo B para cargar el codigo y representarlo en el simulador.'
          ]
        },
        {
          title: 'B. Sistema de traccion (actuadores)',
          items: [
            '2 motores DC con reductora de 3V a 6V para alto torque.',
            '2 ruedas de goma de 65 mm para asegurar agarre y estabilidad.',
            'Puente H L298N para controlar sentido de giro y velocidad PWM hasta 2A.'
          ]
        },
        {
          title: 'C. Sistema de percepcion (sensores)',
          items: [
            '2 modulos infrarrojos TCRT5000 con LED emisor y fototransistor receptor.',
            'Sobre blanco la luz rebota y el receptor detecta senal; sobre negro la luz se absorbe y la lectura cambia.'
          ]
        },
        {
          title: 'D. Chasis y energia',
          items: [
            'Chasis de acrilico como estructura del robot.',
            'Rueda loca frontal para giros de 360 grados.',
            'Portapilas de 4 baterias AA como fuente de energia de 6V.'
          ]
        }
      ],
      connectionsTitle: 'Logica de conexiones para la vista 2D',
      connections: [
        {
          component: 'Sensor IR izquierdo',
          componentPin: 'VCC / GND / Digital Out',
          arduinoPin: '5V / GND / Pin 2'
        },
        {
          component: 'Sensor IR derecho',
          componentPin: 'VCC / GND / Digital Out',
          arduinoPin: '5V / GND / Pin 3'
        },
        {
          component: 'Puente H L298N (Motor A)',
          componentPin: 'IN1 / IN2',
          arduinoPin: 'Pin 4 / Pin 5'
        },
        {
          component: 'Puente H L298N (Motor B)',
          componentPin: 'IN3 / IN4',
          arduinoPin: 'Pin 6 / Pin 7'
        }
      ],
      controlTitle: 'Algoritmo de control on-off para el IDE',
      controlStates: [
        {
          state: 'De frente',
          behavior: 'Ambos sensores detectan blanco y los dos motores giran hacia adelante.'
        },
        {
          state: 'Corregir izquierda',
          behavior: 'El sensor izquierdo detecta negro; el motor izquierdo se detiene y el derecho avanza.'
        },
        {
          state: 'Corregir derecha',
          behavior: 'El sensor derecho detecta negro; el motor derecho se detiene y el izquierdo avanza.'
        },
        {
          state: 'Parada',
          behavior: 'Ambos sensores detectan negro, indicando meta o condicion de error.'
        }
      ]
    },
    modules: [
      {
        id: 'dr-100-m1',
        title: 'Modulo 1. Materiales y arquitectura del MVP',
        duration: '2 semanas',
        summary: 'Identifica cada componente fisico del robot y la funcion que cumple dentro del sistema.',
        lessons: [
          'Rol del Arduino Uno R3 como unidad de control',
          'Funcion del L298N, motores DC, ruedas y chasis',
          'Energia, montaje y seguridad del kit educativo'
        ],
        practices: [
          {
            kind: 'checklist',
            id: 'dr-100-p1',
            title: 'Checklist: BOM del MVP',
            description: 'Completa la lista de materiales basicos del seguidor de linea.',
            items: [
              'Arduino Uno R3 y cable USB Tipo B',
              'L298N y dos motores DC con reductora',
              'Dos sensores TCRT5000 y chasis con rueda loca',
              'Portapilas de 4 AA como fuente de 6V'
            ]
          }
        ]
      },
      {
        id: 'dr-100-m2',
        title: 'Modulo 2. Sensado y conexiones',
        duration: '3 semanas',
        summary: 'Configura sensores y cableado virtual siguiendo el esquematico del proyecto.',
        lessons: [
          'Funcionamiento del TCRT5000 sobre blanco y negro',
          'Conexion de sensores a 5V, GND y pines digitales 2 y 3',
          'Conexion del puente H L298N a los pines 4, 5, 6 y 7'
        ],
        practices: [
          {
            kind: 'quiz',
            id: 'dr-100-p2',
            title: 'Quiz: lectura del TCRT5000',
            description: 'Comprueba que entiendes el contraste blanco/negro y los pines del MVP.',
            questions: [
              {
                prompt: 'Sobre superficie blanca, la luz infrarroja:',
                options: ['Se absorbe', 'Rebota y se detecta', 'Apaga el sensor', 'Invierte el PWM'],
                answerIndex: 1
              },
              {
                prompt: 'Para este MVP, ¿que pines digitales leen los sensores?',
                options: ['Pin 8 y 9', 'Pin 2 y 3', 'Pin A0 y A1', 'Pin 10 y 11'],
                answerIndex: 1
              }
            ]
          }
        ]
      },
      {
        id: 'dr-100-m3',
        title: 'Modulo 3. Logica de control y prueba en pista',
        duration: '2 semanas',
        summary: 'Programa la logica on-off y valida el comportamiento del robot en la trayectoria.',
        lessons: [
          'Estado de frente y avance continuo',
          'Correccion a izquierda y derecha segun lectura de sensores',
          'Condicion de parada por meta o error'
        ],
        practices: [
          {
            kind: 'quiz',
            id: 'dr-100-p3',
            title: 'Quiz: decisiones on-off',
            description: 'Elige la accion correcta para cada lectura de sensores.',
            questions: [
              {
                prompt: 'Si ambos sensores detectan BLANCO, el robot debe:',
                options: ['Parar', 'Avanzar', 'Girar izquierda', 'Girar derecha'],
                answerIndex: 1
              },
              {
                prompt: 'Si el sensor izquierdo detecta NEGRO, la correccion es:',
                options: ['Detener izquierdo y avanzar derecho', 'Detener derecho y avanzar izquierdo', 'Parar', 'Retroceder'],
                answerIndex: 0
              }
            ]
          }
        ]
      },
      {
        id: 'dr-100-m4',
        title: 'Modulo 4. Laboratorio interactivo (exclusivo)',
        duration: '1 semana',
        summary: 'Valida conexiones y algoritmo del MVP en una practica guiada.',
        lessons: [
          'Cableado virtual siguiendo el esquematico',
          'Tabla de estados del controlador on-off',
          'Revision final antes de la pista'
        ],
        practices: [
          {
            kind: 'wiring',
            id: 'dr-100-p4',
            title: 'Practica: conexiones del MVP',
            description: 'Selecciona el pin correcto en Arduino para cada componente.',
            rows: [
              {
                component: 'Sensor IR izquierdo',
                componentPin: 'VCC / GND / Digital Out',
                expectedArduinoPin: '5V / GND / Pin 2',
                choices: ['5V / GND / Pin 2', '5V / GND / Pin 3', 'Pin 4 / Pin 5', 'Pin 6 / Pin 7']
              },
              {
                component: 'Sensor IR derecho',
                componentPin: 'VCC / GND / Digital Out',
                expectedArduinoPin: '5V / GND / Pin 3',
                choices: ['5V / GND / Pin 2', '5V / GND / Pin 3', 'Pin 4 / Pin 5', 'Pin 6 / Pin 7']
              },
              {
                component: 'Puente H L298N (Motor A)',
                componentPin: 'IN1 / IN2',
                expectedArduinoPin: 'Pin 4 / Pin 5',
                choices: ['5V / GND / Pin 2', '5V / GND / Pin 3', 'Pin 4 / Pin 5', 'Pin 6 / Pin 7']
              },
              {
                component: 'Puente H L298N (Motor B)',
                componentPin: 'IN3 / IN4',
                expectedArduinoPin: 'Pin 6 / Pin 7',
                choices: ['5V / GND / Pin 2', '5V / GND / Pin 3', 'Pin 4 / Pin 5', 'Pin 6 / Pin 7']
              }
            ]
          },
          {
            kind: 'state-machine',
            id: 'dr-100-p5',
            title: 'Practica: tabla de estados on-off',
            description: 'Define la accion correcta segun la lectura de los sensores.',
            actions: ['MOTORES ADELANTE', 'DETENER IZQ / AVANZAR DER', 'DETENER DER / AVANZAR IZQ', 'PARAR'],
            cases: [
              { left: 'BLANCO', right: 'BLANCO', expectedAction: 'MOTORES ADELANTE' },
              { left: 'NEGRO', right: 'BLANCO', expectedAction: 'DETENER IZQ / AVANZAR DER' },
              { left: 'BLANCO', right: 'NEGRO', expectedAction: 'DETENER DER / AVANZAR IZQ' },
              { left: 'NEGRO', right: 'NEGRO', expectedAction: 'PARAR' }
            ]
          }
        ]
      }
    ]
  }
];

export const COURSE_MAP = new Map(COURSE_CATALOG.map((course) => [course.slug, course]));
