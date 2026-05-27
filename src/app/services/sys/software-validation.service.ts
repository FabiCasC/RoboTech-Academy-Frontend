import { Injectable } from '@angular/core';

export interface SoftwareValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  metrics: {
    lineCount: number;
    hasSetup: boolean;
    hasLoop: boolean;
    braceBalance: number;
  };
}

/**
 * SYS-ROLE · Analizador sintáctico del IDE (Arduino/C++ simplificado).
 */
@Injectable({ providedIn: 'root' })
export class SoftwareValidationService {
  validate(source: string): SoftwareValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = source.split('\n');
    const lineCount = lines.length;

    const hasSetup = /\bvoid\s+setup\s*\(\s*\)/.test(source);
    const hasLoop = /\bvoid\s+loop\s*\(\s*\)/.test(source);

    if (!hasSetup) {
      errors.push('Falta la función void setup().');
    }
    if (!hasLoop) {
      errors.push('Falta la función void loop().');
    }

    const braceBalance = this.countBraceBalance(source);
    if (braceBalance !== 0) {
      errors.push(
        braceBalance > 0
          ? `Llaves desbalanceadas: faltan ${braceBalance} cierre(s) "}".`
          : `Llaves desbalanceadas: sobran ${Math.abs(braceBalance)} cierre(s) "}".`
      );
    }

    const parenBalance = this.countCharBalance(source, '(', ')');
    if (parenBalance !== 0) {
      errors.push('Paréntesis desbalanceados en el código.');
    }

    if (!/#include\s*<Arduino\.h>/i.test(source)) {
      warnings.push('Se recomienda incluir <Arduino.h>.');
    }

    if (/RoboCore\.statusLight\s*\([^)]*\)\s*;?\s*$/.test(source.replace(/\s/g, ''))) {
      warnings.push('Código fuera de función detectado (posible línea suelta).');
    }

    lines.forEach((line, index) => {
      if (/;\s*;/.test(line)) {
        warnings.push(`Línea ${index + 1}: punto y coma duplicado.`);
      }
    });

    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 5;
    score = Math.max(0, Math.min(100, score));

    return {
      valid: errors.length === 0,
      score,
      errors,
      warnings,
      metrics: { lineCount, hasSetup, hasLoop, braceBalance }
    };
  }

  stripHtml(htmlLines: string[]): string {
    return htmlLines
      .map((line) => line.replace(/<[^>]+>/g, ''))
      .join('\n');
  }

  private countBraceBalance(source: string): number {
    let balance = 0;
    let inString = false;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      const next = source[i + 1];

      if (inLineComment) {
        if (ch === '\n') inLineComment = false;
        continue;
      }
      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (inString) {
        if (ch === '\\') {
          i++;
          continue;
        }
        if (ch === '"') inString = false;
        continue;
      }

      if (ch === '/' && next === '/') {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === '{') balance++;
      if (ch === '}') balance--;
    }

    return balance;
  }

  private countCharBalance(source: string, open: string, close: string): number {
    let balance = 0;
    for (const ch of source) {
      if (ch === open) balance++;
      if (ch === close) balance--;
    }
    return balance;
  }
}
