export type PortType =
  | 'DIGITAL'
  | 'ANALOG'
  | 'POWER_IN'
  | 'POWER_OUT'
  | 'MOTOR_TERMINAL'
  | 'MECHANICAL';

export interface PortSpec {
  id: string;
  type: PortType;
  x: number;
  y: number;
}

export interface PortEndpoint {
  kitId: string;
  port: PortSpec;
}

const ARDUINO_IDS = new Set(['arduino-uno-r3']);
const MOTOR_KIT_IDS = new Set(['dc-motor', 'motores-dc', 'motor-dc-gear-6v']);
const DRIVER_KIT_IDS = new Set(['l298n']);

function digitalPorts(ids: string[], x: number, yStart: number, yEnd: number): PortSpec[] {
  const step = ids.length > 1 ? (yEnd - yStart) / (ids.length - 1) : 0;
  return ids.map((id, i) => ({
    id,
    type: 'DIGITAL' as const,
    x,
    y: yStart + i * step
  }));
}

function analogPorts(ids: string[], y: number, xStart: number, xEnd: number): PortSpec[] {
  const step = ids.length > 1 ? (xEnd - xStart) / (ids.length - 1) : 0;
  return ids.map((id, i) => ({
    id,
    type: 'ANALOG' as const,
    x: xStart + i * step,
    y
  }));
}

export function getComponentPorts(kitId: string): PortSpec[] {
  switch (kitId) {
    case 'arduino-uno-r3':
      return [
        ...digitalPorts(
          ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'],
          80,
          -74,
          74
        ),
        ...analogPorts(['A0', 'A1', 'A2', 'A3', 'A4', 'A5'], 110, -42, 42),
        { id: '5V', type: 'POWER_OUT', x: -70, y: -90 },
        { id: 'GND', type: 'POWER_OUT', x: -70, y: 90 }
      ];

    case 'l298n':
      return [
        ...digitalPorts(['IN1', 'IN2', 'IN3', 'IN4'], -70, -30, 30),
        { id: 'OUT1', type: 'MOTOR_TERMINAL', x: -42, y: 50 },
        { id: 'OUT2', type: 'MOTOR_TERMINAL', x: -14, y: 50 },
        { id: 'OUT3', type: 'MOTOR_TERMINAL', x: 14, y: 50 },
        { id: 'OUT4', type: 'MOTOR_TERMINAL', x: 42, y: 50 },
        { id: '12V', type: 'POWER_IN', x: -60, y: -50 },
        { id: 'GND', type: 'POWER_IN', x: 60, y: -50 }
      ];

    case 'tcrt5000':
      return [
        { id: 'OUT', type: 'DIGITAL', x: -50, y: 0 },
        { id: 'VCC', type: 'POWER_IN', x: 0, y: -25 },
        { id: 'GND', type: 'POWER_IN', x: 50, y: 0 }
      ];

    case 'dc-motor':
    case 'motores-dc':
    case 'motor-dc-gear-6v':
      return [
        { id: 'M+', type: 'MOTOR_TERMINAL', x: -58, y: -6 },
        { id: 'M-', type: 'MOTOR_TERMINAL', x: -58, y: 6 }
      ];

    case 'battery-holder-4aa':
    case 'battery':
    case 'bateria':
      return [
        { id: '+', type: 'POWER_OUT', x: -62, y: 0 },
        { id: '−', type: 'POWER_OUT', x: 62, y: 0 }
      ];

    case 'usb-b':
      return [{ id: 'VBUS', type: 'POWER_IN', x: 48, y: 0 }];

    case 'wheel-65mm':
      return [{ id: 'HUB', type: 'MECHANICAL', x: 0, y: 0 }];

    case 'caster-wheel':
      return [{ id: 'MOUNT', type: 'MECHANICAL', x: 0, y: -30 }];

    case 'acrylic-chassis':
      return [
        { id: 'M1', type: 'MECHANICAL', x: -68, y: -98 },
        { id: 'M2', type: 'MECHANICAL', x: 68, y: -98 },
        { id: 'M3', type: 'MECHANICAL', x: -68, y: 98 },
        { id: 'M4', type: 'MECHANICAL', x: 68, y: 98 },
        { id: 'M5', type: 'MECHANICAL', x: 0, y: -98 },
        { id: 'M6', type: 'MECHANICAL', x: 0, y: 98 }
      ];

    case 'nucleo-rx1':
      return [
        ...digitalPorts(['PA0', 'PA1', 'PA2', 'PA3', 'PA4', 'PA5', 'PA6', 'PA7'], -82, -30, 30),
        ...digitalPorts(['PB0', 'PB1', 'PB2', 'PB3', 'PB4', 'PB5', 'PB6', 'PB7'], 82, -30, 30),
        { id: '3V3', type: 'POWER_OUT', x: -70, y: -45 },
        { id: 'GND', type: 'POWER_OUT', x: 70, y: -45 }
      ];

    case 'lidar-v2':
      return [
        { id: 'TX', type: 'DIGITAL', x: -32, y: 0 },
        { id: 'RX', type: 'DIGITAL', x: 32, y: 0 },
        { id: 'VCC', type: 'POWER_IN', x: 0, y: -32 },
        { id: 'GND', type: 'POWER_IN', x: 0, y: 32 }
      ];

    case 'servo-ht90':
      return [
        { id: 'SIG', type: 'DIGITAL', x: -8, y: 32 },
        { id: 'VCC', type: 'POWER_IN', x: 0, y: 32 },
        { id: 'GND', type: 'POWER_IN', x: 8, y: 32 }
      ];

    case 'rf-link':
      return [
        { id: 'DATA', type: 'DIGITAL', x: -32, y: 0 },
        { id: 'VCC', type: 'POWER_IN', x: 0, y: -18 },
        { id: 'GND', type: 'POWER_IN', x: 32, y: 0 }
      ];

    default:
      return [{ id: 'P0', type: 'DIGITAL', x: 0, y: 0 }];
  }
}

/** Resuelve un puerto del canvas (P0, D2, OUT1…) al spec del catálogo. */
export function resolvePortSpec(kitId: string, portId: string): PortSpec | undefined {
  const ports = getComponentPorts(kitId);
  const direct = ports.find((p) => p.id === portId);
  if (direct) return direct;

  const legacy = /^P(\d+)$/.exec(portId);
  if (legacy) {
    const idx = parseInt(legacy[1], 10);
    return ports[idx] ?? ports[0];
  }

  return undefined;
}

function isL298nMotorOut(kitId: string, port: PortSpec): boolean {
  return DRIVER_KIT_IDS.has(kitId) && port.type === 'MOTOR_TERMINAL' && port.id.startsWith('OUT');
}

function isMotorDirectToArduino(
  kitA: string,
  portA: PortSpec,
  kitB: string,
  portB: PortSpec
): boolean {
  const motorToArduino =
    (MOTOR_KIT_IDS.has(kitA) && ARDUINO_IDS.has(kitB) && portB.type === 'DIGITAL') ||
    (MOTOR_KIT_IDS.has(kitB) && ARDUINO_IDS.has(kitA) && portA.type === 'DIGITAL');

  const terminalToArduino =
    (portA.type === 'MOTOR_TERMINAL' && ARDUINO_IDS.has(kitB) && portB.type === 'DIGITAL') ||
    (portB.type === 'MOTOR_TERMINAL' && ARDUINO_IDS.has(kitA) && portA.type === 'DIGITAL');

  return motorToArduino || terminalToArduino;
}

function typesCompatible(typeA: PortType, typeB: PortType): boolean {
  if (typeA === 'MECHANICAL' || typeB === 'MECHANICAL') {
    return typeA === 'MECHANICAL' && typeB === 'MECHANICAL';
  }

  if (typeA === 'POWER_OUT' && typeB === 'POWER_OUT') {
    return false;
  }

  if (
    (typeA === 'POWER_OUT' && typeB === 'POWER_IN') ||
    (typeA === 'POWER_IN' && typeB === 'POWER_OUT')
  ) {
    return true;
  }

  if (typeA === 'DIGITAL' && typeB === 'DIGITAL') {
    return true;
  }

  if (typeA === 'ANALOG' && typeB === 'ANALOG') {
    return true;
  }

  if (typeA === 'MOTOR_TERMINAL' || typeB === 'MOTOR_TERMINAL') {
    return false;
  }

  if (typeA === 'POWER_IN' && typeB === 'POWER_IN') {
    return false;
  }

  return false;
}

export function areCompatible(portA: PortEndpoint, portB: PortEndpoint): { ok: boolean; reason?: string } {
  const { kitId: kitA, port: a } = portA;
  const { kitId: kitB, port: b } = portB;

  if (a.id === b.id && kitA === kitB) {
    return { ok: false, reason: 'No se puede conectar un puerto consigo mismo.' };
  }

  if (isMotorDirectToArduino(kitA, a, kitB, b)) {
    return {
      ok: false,
      reason:
        'Los motores requieren un driver (L298N); conectarlos directo al Arduino puede dañar el pin por sobrecorriente.'
    };
  }

  if (a.type === 'POWER_OUT' && b.type === 'POWER_OUT') {
    return {
      ok: false,
      reason: 'Corto circuito: no se pueden unir dos salidas de alimentación.'
    };
  }

  if (a.type === 'MOTOR_TERMINAL' || b.type === 'MOTOR_TERMINAL') {
    const motorPort = a.type === 'MOTOR_TERMINAL' ? a : b;
    const motorKit = a.type === 'MOTOR_TERMINAL' ? kitA : kitB;
    const otherPort = a.type === 'MOTOR_TERMINAL' ? b : a;
    const otherKit = a.type === 'MOTOR_TERMINAL' ? kitB : kitA;

    if (isL298nMotorOut(otherKit, otherPort) && MOTOR_KIT_IDS.has(motorKit)) {
      return { ok: true };
    }

    if (isL298nMotorOut(motorKit, motorPort) && MOTOR_KIT_IDS.has(otherKit)) {
      return { ok: true };
    }

    if (MOTOR_KIT_IDS.has(motorKit) && DRIVER_KIT_IDS.has(otherKit) && otherPort.type === 'DIGITAL') {
      return { ok: false, reason: 'Las entradas IN del L298N son digitales; conecta el motor a OUT1–OUT4.' };
    }

    if (MOTOR_KIT_IDS.has(otherKit) && DRIVER_KIT_IDS.has(motorKit) && motorPort.type === 'DIGITAL') {
      return { ok: false, reason: 'Las entradas IN del L298N son digitales; conecta el motor a OUT1–OUT4.' };
    }

    return {
      ok: false,
      reason: 'Los terminales de motor solo deben conectarse a las salidas OUT del driver L298N.'
    };
  }

  if (a.type === 'MECHANICAL' || b.type === 'MECHANICAL') {
    if (a.type === 'MECHANICAL' && b.type === 'MECHANICAL') {
      return { ok: true };
    }
    return {
      ok: false,
      reason: 'Los acoples mecánicos (ruedas, chasis) no se cablean a pines eléctricos.'
    };
  }

  if (typesCompatible(a.type, b.type)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: `Incompatibles: ${a.id} (${a.type}) no puede unirse con ${b.id} (${b.type}).`
  };
}
