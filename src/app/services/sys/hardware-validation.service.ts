import { Injectable } from '@angular/core';

export interface CircuitNode {
  id: string;
  kitId: string;
  label: string;
}

export interface CircuitEdge {
  from: string;
  to: string;
}

export interface HardwareValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  graph: {
    nodeCount: number;
    edgeCount: number;
    connectedComponents: number;
    hasController: boolean;
    hasMotorDriver: boolean;
    hasSensors: boolean;
  };
}

/**
 * SYS-ROLE · Motor de validación de hardware mediante análisis de grafos.
 */
@Injectable({ providedIn: 'root' })
export class HardwareValidationService {
  validate(nodes: CircuitNode[], edges: CircuitEdge[]): HardwareValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const nodeIds = new Set(nodes.map((n) => n.id));
    const adjacency = new Map<string, Set<string>>();

    for (const id of nodeIds) {
      adjacency.set(id, new Set());
    }

    for (const edge of edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        errors.push(`Conexión inválida: ${edge.from} → ${edge.to}`);
        continue;
      }
      adjacency.get(edge.from)!.add(edge.to);
      adjacency.get(edge.to)!.add(edge.from);
    }

    const hasController = nodes.some((n) => n.kitId === 'arduino-uno-r3');
    const hasMotorDriver = nodes.some((n) => n.kitId === 'l298n');
    const hasSensors = nodes.some((n) => n.kitId === 'tcrt5000');

    if (!hasController) {
      errors.push('Falta un microcontrolador (Arduino UNO R3) en el circuito.');
    }

    if (hasMotorDriver && !hasController) {
      errors.push('El driver L298N requiere un microcontrolador conectado.');
    }

    if (nodes.length > 1 && edges.length === 0) {
      warnings.push('Hay componentes sin conexiones en el grafo.');
    }

    const controller = nodes.find((n) => n.kitId === 'arduino-uno-r3');
    if (controller && hasMotorDriver) {
      const motor = nodes.find((n) => n.kitId === 'l298n');
      if (motor && !this.areConnected(controller.id, motor.id, adjacency)) {
        errors.push('El L298N debe estar conectado al Arduino en el grafo.');
      }
    }

    if (hasSensors && controller) {
      const sensors = nodes.filter((n) => n.kitId === 'tcrt5000');
      const disconnected = sensors.filter((s) => !this.areConnected(controller.id, s.id, adjacency));
      if (disconnected.length > 0) {
        warnings.push(`${disconnected.length} sensor(es) IR sin ruta al controlador.`);
      }
    }

    const connectedComponents = this.countConnectedComponents(adjacency);
    if (connectedComponents > 1 && nodes.length > 1) {
      warnings.push(
        `El circuito tiene ${connectedComponents} subgrafos desconectados.`
      );
    }

    const orphans = nodes.filter((n) => (adjacency.get(n.id)?.size ?? 0) === 0);
    if (orphans.length > 0 && nodes.length > 1) {
      warnings.push(`Componentes aislados: ${orphans.map((o) => o.label).join(', ')}`);
    }

    let score = 100;
    score -= errors.length * 25;
    score -= warnings.length * 8;
    score = Math.max(0, Math.min(100, score));

    return {
      valid: errors.length === 0,
      score,
      errors,
      warnings,
      graph: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        connectedComponents,
        hasController,
        hasMotorDriver,
        hasSensors
      }
    };
  }

  private areConnected(a: string, b: string, adjacency: Map<string, Set<string>>): boolean {
    const visited = new Set<string>();
    const queue = [a];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === b) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const next of adjacency.get(current) ?? []) {
        queue.push(next);
      }
    }
    return false;
  }

  private countConnectedComponents(adjacency: Map<string, Set<string>>): number {
    const visited = new Set<string>();
    let count = 0;

    for (const nodeId of adjacency.keys()) {
      if (visited.has(nodeId)) continue;
      count++;
      const stack = [nodeId];
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (visited.has(id)) continue;
        visited.add(id);
        for (const next of adjacency.get(id) ?? []) {
          stack.push(next);
        }
      }
    }

    return count;
  }
}
