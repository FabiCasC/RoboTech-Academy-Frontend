/** Mapeo kit del lienzo → `type` esperado por el validador Spring (ComponentNodeDto). */

export function mapKitToComponentType(
  kitId: string,
  label = '',
  componentId = ''
): string {
  const lbl = label.toUpperCase();
  const id = componentId.toLowerCase();

  switch (kitId) {
    case 'arduino-uno-r3':
      return 'ARDUINO';
    case 'l298n':
      return 'L298N';
    case 'tcrt5000':
      if (lbl.includes('IZQ') || lbl.includes('LEFT')) return 'IR_SENSOR_LEFT';
      if (lbl.includes('DER') || lbl.includes('RIGHT')) return 'IR_SENSOR_RIGHT';
      if (id.includes('left') || id.includes('izq')) return 'IR_SENSOR_LEFT';
      if (id.includes('right') || id.includes('der')) return 'IR_SENSOR_RIGHT';
      return 'IR_SENSOR_LEFT';
    case 'motor-dc-gear-6v':
      if (lbl.includes('IZQ') || lbl.includes('LEFT') || id.includes('left') || id.includes('izq')) {
        return 'DC_MOTOR_LEFT';
      }
      if (lbl.includes('DER') || lbl.includes('RIGHT') || id.includes('right') || id.includes('der')) {
        return 'DC_MOTOR_RIGHT';
      }
      return 'DC_MOTOR_LEFT';
    case 'dc-motor-left':
      return 'DC_MOTOR_LEFT';
    case 'dc-motor-right':
      return 'DC_MOTOR_RIGHT';
    case 'battery':
    case 'battery-holder-4aa':
      return 'BATTERY';
    default:
      return kitId.toUpperCase().replace(/-/g, '_');
  }
}

export function mapLabComponentsToDto(components: unknown[]): Record<string, unknown>[] {
  return (components as Array<Record<string, unknown>>).map((c) => {
    if (c['type'] && c['position']) {
      return { ...c };
    }

    const props = (c['properties'] ?? {}) as Record<string, unknown>;
    const pos = (c['position'] ?? {}) as Record<string, unknown>;
    const kitId = String(c['kitId'] ?? props['kitId'] ?? '');
    const label = String(c['label'] ?? props['label'] ?? '');
    const id = String(c['id'] ?? '');

    return {
      id,
      type: mapKitToComponentType(kitId, label, id),
      position: {
        x: pos['x'] ?? c['x'] ?? 0,
        y: pos['y'] ?? c['y'] ?? 0
      },
      properties: {
        kitId,
        label,
        w: props['w'] ?? c['w'],
        h: props['h'] ?? c['h'],
        ports: props['ports'] ?? c['ports']
      }
    };
  });
}

export function mapLabConnectionsToDto(connections: unknown[]): Record<string, unknown>[] {
  return (connections as Array<Record<string, unknown>>).map((c) => ({
    id: String(c['id'] ?? ''),
    fromComponentId: String(c['fromComp'] ?? c['fromComponentId'] ?? ''),
    fromPin: String(c['fromPort'] ?? c['fromPin'] ?? ''),
    toComponentId: String(c['toComp'] ?? c['toComponentId'] ?? ''),
    toPin: String(c['toPort'] ?? c['toPin'] ?? ''),
    bezierControlPoints: c['bezierControlPoints']
  }));
}
