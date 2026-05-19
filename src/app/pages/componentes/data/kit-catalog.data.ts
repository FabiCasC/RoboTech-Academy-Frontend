import { KitItem } from '../models/kit.models';

export const KIT_CATALOG: KitItem[] = [
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
