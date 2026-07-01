import type {
  Lab2dComponent,
  Lab2dConnection
} from '../../components/p5-lab2d-canvas/p5-lab2d-canvas.component';
import { kitCardSizeFor, labPortsFromKitId } from './lab-kit-layout';

function tplComponent(
  id: string,
  kitId: string,
  label: string,
  x: number,
  y: number
): Lab2dComponent {
  const size = kitCardSizeFor(kitId);
  return {
    id,
    kitId,
    label,
    x,
    y,
    w: size.w,
    h: size.h,
    ports: labPortsFromKitId(kitId)
  };
}

/** Plantilla del laboratorio de curso (seguidor de línea y similares). */
export function buildCourseLabTemplate(): {
  components: Lab2dComponent[];
  connections: Lab2dConnection[];
} {
  return {
    components: [
      tplComponent('arduino-uno-r3-1', 'arduino-uno-r3', 'ARDUINO UNO R3', 100, 48),
      tplComponent('l298n-1', 'l298n', 'L298N', 380, 32),
      tplComponent('tcrt5000-left-1', 'tcrt5000', 'TCRT5000 (IZQ)', 380, 180),
      tplComponent('tcrt5000-right-1', 'tcrt5000', 'TCRT5000 (DER)', 540, 180),
      tplComponent('motor-dc-left-1', 'motor-dc-gear-6v', 'MOTOR DC (IZQ)', 600, 48),
      tplComponent('motor-dc-right-1', 'motor-dc-gear-6v', 'MOTOR DC (DER)', 760, 48),
      tplComponent('battery-1', 'battery-holder-4aa', 'BATERÍA 4xAA', 100, 328)
    ],
    connections: []
  };
}

export function isCourseLabSlug(_slug: string | null | undefined): boolean {
  return !!_slug;
}
