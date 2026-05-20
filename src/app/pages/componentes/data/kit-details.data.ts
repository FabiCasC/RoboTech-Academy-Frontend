import { KitDetail } from '../models/kit.models';

export const KIT_DETAILS: Record<string, KitDetail> = {
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
