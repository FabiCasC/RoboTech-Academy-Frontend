import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface CodeLine {
  html: string;
}

@Component({
  selector: 'app-ide-programacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ide-programacion.component.html',
  styleUrls: ['./ide-programacion.component.css'],
})
export class IdeProgramacionComponent {

  constructor(private router: Router) {}

  codeLines: CodeLine[] = [
    { html: `<span class="c-dim">#include </span><span class="c-string">&lt;Arduino.h&gt;</span>` },
    { html: `<span class="c-dim">#include </span><span class="c-string">&lt;RoboCore.h&gt;</span>` },
    { html: `` },
    { html: `<span class="c-keyword">void </span><span class="c-func">setup</span><span class="c-plain">() {</span>` },
    { html: `<span class="c-plain">  </span><span class="c-comment">// Initialize telemetry link</span>` },
    { html: `<span class="c-func">  Serial</span><span class="c-plain">.</span><span class="c-func">begin</span><span class="c-plain">(</span><span class="c-number">115200</span><span class="c-plain">);</span>` },
    { html: `` },
    { html: `<span class="c-plain">  </span><span class="c-comment">// Configure motor pins</span>` },
    { html: `<span class="c-func">  pinMode</span><span class="c-plain">(MOTOR_L_PIN, </span><span class="c-keyword">OUTPUT</span><span class="c-plain">);</span>` },
    { html: `<span class="c-func">  pinMode</span><span class="c-plain">(MOTOR_R_PIN, </span><span class="c-keyword">OUTPUT</span><span class="c-plain">);</span>` },
    { html: `` },
    { html: `<span class="c-plain">}</span><span class="c-func">RoboCore</span><span class="c-plain">.</span><span class="c-func">statusLight</span><span class="c-plain">(RED_NEON);</span>` },
    { html: `` },
    { html: `` },
    { html: `<span class="c-keyword">void </span><span class="c-func">loop</span><span class="c-plain">() {</span>` },
    { html: `<span class="c-plain">  </span><span class="c-comment">// Awaiting payload...</span>` },
    { html: `<span class="c-func">  delay</span><span class="c-plain">(</span><span class="c-number">100</span><span class="c-plain">);</span>` },
    { html: `<span class="c-func">  blinkActivity</span><span class="c-plain">();</span>` },
    { html: `<span class="c-plain">}</span>` },
  ];

  cargarCodigo(): void {
    console.log('Cargando código al robot...');
  }

  copiarCodigo(): void {
    const texto = this.codeLines.map(l => l.html.replace(/<[^>]+>/g, '')).join('\n');
    navigator.clipboard.writeText(texto);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}