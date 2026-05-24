import { KitItem } from '../models/kit.models';

export const KIT_CATALOG: KitItem[] = [
  {
    id: 'arduino-uno-r3',
    category: 'MICROCONTROLADOR',
    title: 'ARDUINO UNO R3',
    description: 'Microcontrolador basado en ATmega328P para control y prototipado rápido.',
    inStock: true,
    image: 'https://store.arduino.cc/cdn/shop/files/A000066_00.front_1000x750.jpg'
  },
  {
    id: 'usb-b',
    category: 'CABLEADO',
    title: 'CABLE USB TIPO B',
    description: 'Cable para carga de código y alimentación desde PC (Arduino Uno R3).',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71hAHwYh7PL.jpg'
  },
  {
    id: 'motor-dc-gear-6v',
    category: 'ACTUADOR',
    title: 'MOTORES DC CON REDUCTORA (x2)',
    description: 'Motores de torque alto (3V-6V) para tracción de un chasis diferencial.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61k3gXr5u6L.jpg'
  },
  {
    id: 'wheel-65mm',
    category: 'MECANICA',
    title: 'RUEDAS DE GOMA 65MM (x2)',
    description: 'Ruedas de 65mm para mejorar agarre, estabilidad y velocidad del robot.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61uFqg9xQ2L.jpg'
  },
  {
    id: 'l298n',
    category: 'ACTUADOR',
    title: 'PUENTE H L298N',
    description: 'Driver dual para controlar sentido de giro y velocidad (PWM) de dos motores.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71lqQnN3H0L.jpg'
  },
  {
    id: 'tcrt5000',
    category: 'SENSOR',
    title: 'SENSORES IR TCRT5000 (x2)',
    description: 'Módulos infrarrojos para detección de línea (negro/blanco) con salida digital.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61D6WZKxw0L.jpg'
  },
  {
    id: 'acrylic-chassis',
    category: 'MECANICA',
    title: 'CHASIS DE ACRÍLICO',
    description: 'Estructura base del robot para montar sensores, motores y electrónica.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/71B1l8mP5mL.jpg'
  },
  {
    id: 'caster-wheel',
    category: 'MECANICA',
    title: 'RUEDA LOCA (CASTER WHEEL)',
    description: 'Soporte frontal que permite giros suaves de 360° en robots móviles.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61p3oHqzWcL.jpg'
  },
  {
    id: 'battery-holder-4aa',
    category: 'ENERGIA',
    title: 'PORTAPILAS 4xAA (6V)',
    description: 'Fuente de energía típica para robots educativos (4 pilas AA).',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61sOZcQe5gL.jpg'
  },
  {
    id: 'nucleo-rx1',
    category: 'MICROCONTROLADOR',
    title: 'STM32 Nucleo',
    description:
      'Placa de desarrollo principal de 32-bits con conectividad avanzada y múltiples interfaces I/O.',
    inStock: true,
    image: 'https://m.media-amazon.com/images/I/61DX7isVBBL.jpg'
  },
  {
    id: 'lidar-v2',
    category: 'SENSOR',
    title: 'LIDAR ÓPTICO V2',
    description:
      'Módulo de escaneo láser de 360 grados para mapeo y navegación autónoma de alta precisión.',
    inStock: false,
    image:
      'https://core-electronics.com.au/media/catalog/product/cache/d5cf359726a1656c2b36f3682d3bbc67/s/e/sen-13680-03.jpg'
  },
  {
    id: 'servo-ht90',
    category: 'ACTUADOR',
    title: 'SERVO MOTOR SG-90',
    description:
      'Actuador de alta torsión con engranajes metálicos para aplicaciones robóticas exigentes.',
    inStock: true,
    image:
      'https://www.electromania.pe/wp-content/uploads/Micro-Servo-SG90_Electromania-Peru.jpg'
  },
  {
    id: 'rf-link',
    category: 'CONECTIVIDAD',
    title: 'MÓDULO RF-LINK',
    description:
      'Transmisor de radiofrecuencia de largo alcance para comunicación inalámbrica entre nodos.',
    inStock: true,
    image:
      'https://mecatronica.saisac.pe/wp-content/uploads/2020/03/MODULO-RF-433-MHZ-TRANSMISOR-600x600.jpg'
  }
];

export function getKitItemById(id: string): KitItem | undefined {
  return KIT_CATALOG.find((item) => item.id === id);
}
