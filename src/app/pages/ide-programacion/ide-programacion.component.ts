import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  SoftwareValidationService,
  type SoftwareValidationResult
} from '../../services/sys/software-validation.service';
import { RenderOrchestratorService } from '../../services/sys/render-orchestrator.service';

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
export class IdeProgramacionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly softwareValidation = inject(SoftwareValidationService);
  private readonly sysOrchestrator = inject(RenderOrchestratorService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.persistCodeSnapshot();
  }

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
    { html: `<span class="c-plain">}</span>` },
    { html: `` },
    { html: `<span class="c-keyword">void </span><span class="c-func">loop</span><span class="c-plain">() {</span>` },
    { html: `<span class="c-plain">  </span><span class="c-comment">// Awaiting payload...</span>` },
    { html: `<span class="c-func">  delay</span><span class="c-plain">(</span><span class="c-number">100</span><span class="c-plain">);</span>` },
    { html: `<span class="c-func">  blinkActivity</span><span class="c-plain">();</span>` },
    { html: `<span class="c-plain">}</span>` },
  ];

  validationReport: SoftwareValidationResult | null = null;
  uploadMessage = '';

  cargarCodigo(): void {
    const source = this.softwareValidation.stripHtml(
      this.codeLines.map((l) => l.html)
    );
    this.validationReport = this.softwareValidation.validate(source);
    this.sysOrchestrator.orchestrateSoftwareValidation(
      this.validationReport.valid,
      this.validationReport.score
    );

    if (this.validationReport.valid) {
      this.uploadMessage = 'SYS-ROLE: código válido · listo para simulación.';
    } else {
      this.uploadMessage = 'SYS-ROLE: corrige los errores antes de cargar al robot.';
    }
    this.persistCodeSnapshot();
  }

  private persistCodeSnapshot(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const source = this.softwareValidation.stripHtml(this.codeLines.map((l) => l.html));
    window.sessionStorage.setItem('robotech_ide_last_code', source);
  }

  copiarCodigo(): void {
    const texto = this.codeLines.map((l) => l.html.replace(/<[^>]+>/g, '')).join('\n');
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
