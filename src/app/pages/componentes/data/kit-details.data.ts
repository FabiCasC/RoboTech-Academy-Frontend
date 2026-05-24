import { KitDetail } from '../models/kit.models';

export const KIT_DETAILS: Record<string, KitDetail> = {
  'arduino-uno-r3': {
    id: 'arduino-uno-r3',
    category: 'MICROCONTROLADOR',
    title: 'ARDUINO UNO R3',
    subtitle: 'Placa basada en ATmega328P',
    description:
      'Microcontrolador para prototipado rápido. Procesa señales de sensores y controla actuadores en proyectos educativos.',
    inStock: true,
    image: 'https://store.arduino.cc/cdn/shop/files/A000066_00.front_1000x750.jpg',
    tags: ['MICROCONTROLADOR', 'ATMEGA328P', '5V'],
    pins: [
      { name: '5V', label: 'Alimentación 5V', color: 'accent' },
      { name: 'GND', label: 'Tierra (0V)', color: 'ground' },
      { name: 'D2', label: 'Entrada digital (IR Izq)', color: 'signal' },
      { name: 'D3', label: 'Entrada digital (IR Der)', color: 'signal' },
      { name: 'D4', label: 'Salida digital (L298N IN1)', color: 'signal' },
      { name: 'D5', label: 'Salida digital (L298N IN2 / PWM)', color: 'signal' },
      { name: 'D6', label: 'Salida digital (L298N IN3 / PWM)', color: 'signal' },
      { name: 'D7', label: 'Salida digital (L298N IN4)', color: 'signal' }
    ],
    specs: [
      { label: 'MCU', value: 'ATmega328P' },
      { label: 'LÓGICA', value: '5V' },
      { label: 'USB', value: 'Tipo B' }
    ],
    whatIs:
      'Arduino Uno R3 es una placa de desarrollo que permite programar y controlar circuitos electrónicos de forma sencilla. Se usa ampliamente en robótica educativa.',
    howItWorks:
      'El microcontrolador ejecuta un programa (sketch) que lee pines de entrada, toma decisiones y escribe salidas digitales/PWM para controlar actuadores como motores mediante drivers.',
    howToUse: [
      'Cargar el código por USB',
      'Conectar sensores a pines digitales y 5V/GND',
      'Controlar motores a través de un puente H (ej: L298N)'
    ],
    codeFile: 'SEGUIDOR_LINEA.INO',
    codeSnippet: `const int IR_LEFT = 2;
const int IR_RIGHT = 3;

const int IN1 = 4;
const int IN2 = 5;
const int IN3 = 6;
const int IN4 = 7;

void setup() {
  pinMode(IR_LEFT, INPUT);
  pinMode(IR_RIGHT, INPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
}

void forward() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void stopAll() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

void correctLeft() {
  digitalWrite(IN1, LOW);  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void correctRight() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);  digitalWrite(IN4, LOW);
}

void loop() {
  int left = digitalRead(IR_LEFT);
  int right = digitalRead(IR_RIGHT);

  bool leftBlack = left == LOW;
  bool rightBlack = right == LOW;

  if (!leftBlack && !rightBlack) forward();
  else if (leftBlack && !rightBlack) correctLeft();
  else if (!leftBlack && rightBlack) correctRight();
  else stopAll();
}`
  },
  'usb-b': {
    id: 'usb-b',
    category: 'CABLEADO',
    title: 'CABLE USB TIPO B',
    subtitle: 'Carga de código y alimentación por USB',
    description:
      'Cable para conectar la placa al PC. Permite programar el microcontrolador y alimentar el circuito en pruebas.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71hAHwYh7PL.jpg',
    tags: ['CABLEADO', 'USB'],
    pins: [],
    specs: [
      { label: 'TIPO', value: 'USB-A a USB-B' },
      { label: 'USO', value: 'Programación y energía' }
    ],
    whatIs:
      'Cable de datos y energía usado para enlazar el PC con una placa como Arduino Uno R3.',
    howItWorks:
      'Transporta datos seriales/USB para cargar el programa y, al mismo tiempo, puede suministrar 5V para pruebas.',
    howToUse: ['Conectar al puerto USB de la PC', 'Conectar al conector USB-B del Arduino'],
    codeFile: 'N/A',
    codeSnippet: 'Sin código: accesorio de conexión.'
  },
  'motor-dc-gear-6v': {
    id: 'motor-dc-gear-6v',
    category: 'ACTUADOR',
    title: 'MOTORES DC CON REDUCTORA (x2)',
    subtitle: 'Tracción para robot diferencial',
    description:
      'Motores DC de 3V-6V con reductora. Proporcionan torque para mover el chasis y permitir giros.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61k3gXr5u6L.jpg',
    tags: ['ACTUADOR', 'MOTOR', 'DC'],
    pins: [
      { name: 'M+', label: 'Terminal positivo del motor', color: 'signal' },
      { name: 'M-', label: 'Terminal negativo del motor', color: 'ground' }
    ],
    specs: [
      { label: 'VOLTAJE', value: '3V – 6V' },
      { label: 'USO', value: 'Tracción (alto torque)' }
    ],
    whatIs:
      'Un motor DC con reductora convierte energía eléctrica en movimiento rotatorio con más torque y menos velocidad.',
    howItWorks:
      'La reductora multiplica el torque a la salida. Se controla típicamente con un puente H para invertir el giro y con PWM para ajustar la velocidad.',
    howToUse: [
      'Conectar el motor a las salidas OUT del L298N',
      'Asegurar montaje firme al chasis',
      'Ajustar velocidad con PWM (si se usa ENA/ENB)'
    ],
    codeFile: 'N/A',
    codeSnippet: 'Se controla indirectamente desde el L298N.'
  },
  'wheel-65mm': {
    id: 'wheel-65mm',
    category: 'MECANICA',
    title: 'RUEDAS DE GOMA 65MM (x2)',
    subtitle: 'Tracción y estabilidad',
    description:
      'Ruedas de goma de 65 mm para mejorar agarre en pista y dar estabilidad al robot.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61uFqg9xQ2L.jpg',
    tags: ['MECANICA', 'TRACCION'],
    pins: [],
    specs: [
      { label: 'DIÁMETRO', value: '65mm' },
      { label: 'MATERIAL', value: 'Goma' }
    ],
    whatIs: 'Elemento mecánico que transmite el giro del motor al desplazamiento del robot.',
    howItWorks:
      'La goma incrementa fricción sobre el suelo, reduciendo deslizamiento y mejorando la precisión al seguir la línea.',
    howToUse: ['Montar en el eje del motor', 'Verificar alineación y fricción uniforme'],
    codeFile: 'N/A',
    codeSnippet: 'Sin código: componente mecánico.'
  },
  'l298n': {
    id: 'l298n',
    category: 'ACTUADOR',
    title: 'PUENTE H L298N',
    subtitle: 'Driver dual para motores DC',
    description:
      'Módulo controlador que permite manejar sentido de giro y velocidad (PWM) de dos motores DC. Soporta hasta ~2A (dependiendo del módulo y disipación).',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71lqQnN3H0L.jpg',
    tags: ['DRIVER', 'PWM', 'MOTORES'],
    pins: [
      { name: 'VCC', label: 'Alimentación motores (ej: 6V)', color: 'accent' },
      { name: 'GND', label: 'Tierra (0V)', color: 'ground' },
      { name: 'IN1', label: 'Control Motor A', color: 'signal' },
      { name: 'IN2', label: 'Control Motor A', color: 'signal' },
      { name: 'IN3', label: 'Control Motor B', color: 'signal' },
      { name: 'IN4', label: 'Control Motor B', color: 'signal' },
      { name: 'OUT1/OUT2', label: 'Salida Motor A', color: 'signal' },
      { name: 'OUT3/OUT4', label: 'Salida Motor B', color: 'signal' }
    ],
    specs: [
      { label: 'CANALES', value: '2 motores' },
      { label: 'PWM', value: 'ENA/ENB (según módulo)' }
    ],
    whatIs:
      'El L298N es un puente H doble que permite controlar dos motores DC: cambiar dirección y controlar velocidad.',
    howItWorks:
      'Recibe señales lógicas IN1–IN4 desde el microcontrolador. Internamente conmuta transistores para invertir polaridad en el motor. Con PWM en ENA/ENB se controla la velocidad.',
    howToUse: [
      'Conectar IN1/IN2 a pines 4 y 5 (Motor A) y IN3/IN4 a pines 6 y 7 (Motor B)',
      'Conectar motores a OUT1/OUT2 y OUT3/OUT4',
      'Alimentar motores con 6V y compartir GND con Arduino'
    ],
    codeFile: 'L298N_CONTROL.INO',
    codeSnippet: `const int IN1 = 4;
const int IN2 = 5;
const int IN3 = 6;
const int IN4 = 7;

void setup() {
  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
}

void motorAForward() { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
void motorAStop()    { digitalWrite(IN1, LOW);  digitalWrite(IN2, LOW); }
void motorBForward() { digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); }
void motorBStop()    { digitalWrite(IN3, LOW);  digitalWrite(IN4, LOW); }
`
  },
  'tcrt5000': {
    id: 'tcrt5000',
    category: 'SENSOR',
    title: 'SENSORES IR TCRT5000 (x2)',
    subtitle: 'Detección de línea negro/blanco',
    description:
      'Módulos infrarrojos con emisor LED IR y fototransistor. Salida digital para detectar contraste en pista.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61D6WZKxw0L.jpg',
    tags: ['SENSOR', 'IR', 'DIGITAL'],
    pins: [
      { name: 'VCC', label: 'Alimentación 5V', color: 'accent' },
      { name: 'GND', label: 'Tierra (0V)', color: 'ground' },
      { name: 'D0', label: 'Salida digital (BLANCO/NEGRO)', color: 'signal' }
    ],
    specs: [
      { label: 'SALIDA', value: 'Digital (D0)' },
      { label: 'USO', value: 'Seguimiento de línea' }
    ],
    whatIs:
      'Sensor reflectivo infrarrojo usado para detectar variaciones de contraste (línea negra sobre fondo blanco).',
    howItWorks:
      'El LED IR emite luz. En blanco, la luz se refleja y el fototransistor recibe señal; en negro, la luz se absorbe y la lectura cambia. El comparador del módulo entrega D0 como nivel lógico.',
    howToUse: [
      'Conectar VCC a 5V, GND a GND',
      'Conectar D0 a un pin digital (ej: D2 / D3)',
      'Ajustar potenciómetro del módulo para calibrar umbral'
    ],
    codeFile: 'TCRT5000_READ.INO',
    codeSnippet: `const int IR_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
}

void loop() {
  int v = digitalRead(IR_PIN);
  Serial.println(v == LOW ? "NEGRO" : "BLANCO");
  delay(100);
}`
  },
  'acrylic-chassis': {
    id: 'acrylic-chassis',
    category: 'MECANICA',
    title: 'CHASIS DE ACRÍLICO',
    subtitle: 'Base estructural para el robot',
    description:
      'Estructura para montar motores, sensores, batería y placa de control en un robot seguidor de línea.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71B1l8mP5mL.jpg',
    tags: ['MECANICA', 'CHASIS'],
    pins: [],
    specs: [
      { label: 'MATERIAL', value: 'Acrílico' },
      { label: 'USO', value: 'Montaje de componentes' }
    ],
    whatIs:
      'Plataforma mecánica donde se instalan los subsistemas del robot: tracción, sensores y energía.',
    howItWorks:
      'El chasis brinda rigidez y puntos de fijación. Una buena distribución de peso mejora tracción y reduce vibraciones.',
    howToUse: ['Montar motores y rueda loca', 'Alinear sensores IR cerca del piso', 'Asegurar batería y control'],
    codeFile: 'N/A',
    codeSnippet: 'Sin código: componente mecánico.'
  },
  'caster-wheel': {
    id: 'caster-wheel',
    category: 'MECANICA',
    title: 'RUEDA LOCA (CASTER WHEEL)',
    subtitle: 'Soporte frontal para giros suaves',
    description:
      'Permite estabilizar el chasis y girar en curvas sin fricción excesiva ni trabas.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61p3oHqzWcL.jpg',
    tags: ['MECANICA', 'SOPORTE'],
    pins: [],
    specs: [
      { label: 'GIRO', value: '360°' },
      { label: 'USO', value: 'Apoyo frontal' }
    ],
    whatIs: 'Rueda de apoyo que se orienta libremente para facilitar cambios de dirección.',
    howItWorks:
      'Al girar, el punto de apoyo frontal se adapta a la dirección del movimiento reduciendo resistencia y evitando levantamientos.',
    howToUse: ['Montar al frente del chasis', 'Verificar altura para buen contacto con el suelo'],
    codeFile: 'N/A',
    codeSnippet: 'Sin código: componente mecánico.'
  },
  'battery-holder-4aa': {
    id: 'battery-holder-4aa',
    category: 'ENERGIA',
    title: 'PORTAPILAS 4xAA (6V)',
    subtitle: 'Alimentación para robots educativos',
    description:
      'Portapilas para 4 baterías AA (aprox. 6V) usado para alimentar motores y/o electrónica según el diseño.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61sOZcQe5gL.jpg',
    tags: ['ENERGIA', '6V'],
    pins: [
      { name: '+', label: 'Salida positiva', color: 'accent' },
      { name: '-', label: 'Salida negativa (GND)', color: 'ground' }
    ],
    specs: [
      { label: 'SALIDA', value: '≈ 6V' },
      { label: 'FORMATO', value: '4xAA' }
    ],
    whatIs: 'Módulo de energía para alimentar el sistema del robot con baterías AA.',
    howItWorks:
      'Las baterías en serie suman voltajes. Se recomienda compartir GND con el microcontrolador cuando se controlan motores con drivers.',
    howToUse: [
      'Conectar a VCC/GND del L298N para motores',
      'Evitar alimentar Arduino por 5V directamente desde 6V',
      'Asegurar polaridad correcta y fusible/protección si aplica'
    ],
    codeFile: 'N/A',
    codeSnippet: 'Sin código: componente de energía.'
  },
  'lidar-v2': {
    id: 'lidar-v2',
    category: 'SENSOR',
    title: 'LIDAR ÓPTICO V2',
    subtitle: 'Módulo de Escaneo Láser de 360°',
    description:
      'Módulo de escaneo láser de 360 grados para mapeo y navegación autónoma de alta precisión.',
    inStock: false,
    image:
      'https://core-electronics.com.au/media/catalog/product/cache/d5cf359726a1656c2b36f3682d3bbc67/s/e/sen-13680-03.jpg',
    tags: ['SENSOR', 'DIGITAL'],
    pins: [
      { name: 'VCC', label: 'Alimentación 5V', color: 'accent' },
      { name: 'TX', label: 'Salida serial (datos)', color: 'signal' },
      { name: 'RX', label: 'Entrada serial (comandos)', color: 'signal' },
      { name: 'GND', label: 'Tierra (0V)', color: 'ground' }
    ],
    specs: [
      { label: 'RANGO', value: '0.15m – 12m' },
      { label: 'PRECISIÓN', value: '± 2cm' }
    ],
    whatIs:
      'El LIDAR Óptico V2 es un sensor de distancia basado en láser que realiza un barrido de 360° para generar mapas del entorno. Es ideal para robots móviles, vehículos autónomos y sistemas de localización en interiores.',
    howItWorks:
      'Un diodo láser emite pulsos de luz infrarroja mientras un motor interno rota el cabezal. El receptor captura el reflejo de cada pulso y calcula la distancia midiendo el tiempo de vuelo (ToF). Los datos se envían por UART como paquetes de puntos (ángulo + distancia).',
    howToUse: [
      'Robots autónomos y AMR',
      'Mapeo SLAM en tiempo real',
      'Navegación con evasión de obstáculos'
    ],
    codeFile: 'DISTANCIA.CPP',
    codeSnippet: `#define TRIG_PIN 9
#define ECHO_PIN 10

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // Generar pulso de 10us
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracion = pulseIn(ECHO_PIN, HIGH);
  float distancia_cm = duracion * 0.034 / 2;

  Serial.print("Distancia: ");
  Serial.println(distancia_cm);
  delay(100);
}`
  }
};

export function getKitDetailById(id: string): KitDetail | undefined {
  return KIT_DETAILS[id];
}
