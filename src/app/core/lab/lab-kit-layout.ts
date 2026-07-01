import type { LabPort } from '../../components/p5-lab2d-canvas/p5-lab2d-canvas.component';
import { getComponentPorts } from '../../components/p5-kit-viewer/kit-compatibility';

/** Tamaños de tarjeta en canvas 2D (modelo + padding). */
export const KIT_CARD_SIZE_MAP: Record<string, { w: number; h: number }> = {
  'arduino-uno-r3': { w: 200, h: 300 },
  'usb-b': { w: 120, h: 100 },
  'motor-dc-gear-6v': { w: 150, h: 150 },
  'dc-motor': { w: 150, h: 150 },
  'motores-dc': { w: 150, h: 150 },
  'wheel-65mm': { w: 110, h: 150 },
  'l298n': { w: 180, h: 180 },
  'tcrt5000': { w: 140, h: 130 },
  'acrylic-chassis': { w: 200, h: 300 },
  'caster-wheel': { w: 80, h: 150 },
  'battery-holder-4aa': { w: 160, h: 135 },
  'battery': { w: 130, h: 115 },
  'bateria': { w: 130, h: 115 },
  'nucleo-rx1': { w: 220, h: 180 },
  'lidar-v2': { w: 110, h: 150 },
  'servo-ht90': { w: 100, h: 140 },
  'rf-link': { w: 110, h: 130 }
};

export const DEFAULT_KIT_CARD_SIZE = { w: 140, h: 130 };

export function kitCardSizeFor(kitId: string): { w: number; h: number } {
  return KIT_CARD_SIZE_MAP[kitId] ?? DEFAULT_KIT_CARD_SIZE;
}

/** Convierte PortSpec del catálogo en LabPort para el canvas 2D. */
export function labPortsFromKitId(kitId: string): LabPort[] {
  const specs = getComponentPorts(kitId);
  if (!specs.length) return [];

  const ys = specs.map((s) => s.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const range = yMax - yMin || 1;

  return specs.map((spec) => ({
    id: spec.id,
    side: spec.x < 0 ? 'left' : 'right',
    offset: (spec.y - yMin) / range,
    active: true
  }));
}
