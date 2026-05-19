import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  user = {
    name: "ALEX 'TECH' RIVERA",
    role: "ARQUITECTO DE SISTEMAS SENIOR",
    id: "AX-7742",
    level: 42,
    xp: 8450,
    maxXp: 10000
  };

  stats = [
    {
      title: 'PROYECTOS COMPLETADOS',
      value: '124',
      detail: '+12% este mes',
      icon: 'precision_manufacturing',
      trendClass: 'trend-up'
    },
    {
      title: 'HORAS DE SIMULACIÓN',
      value: '4,208 H',
      detail: 'Sesión activa recientemente',
      icon: 'timer',
      activeDot: true
    },
    {
      title: 'COMPONENTES DOMINADOS',
      value: '89 / 150',
      icon: 'memory_alt',
      progressBar: true,
      progressValue: 59
    },
    {
      title: 'TASA DE PRECISIÓN',
      value: '98.4 %',
      detail: 'Óptimo',
      icon: 'center_focus_strong',
      trendClass: 'trend-nominal'
    }
  ];

  badges = [
    { name: 'MAESTRO DE CIRCUITOS', icon: 'bolt', unlocked: true },
    { name: 'NINJA DEL CÓDIGO', icon: 'code', unlocked: true },
    { name: 'PRIMER ENSAMBLAJE', icon: 'build', unlocked: true },
    { name: 'CLASE TITANIO', icon: 'lock', unlocked: false }
  ];

  activityLog = [
    {
      title: 'Proyecto Modificado: Rover-X Módulo de Tracción',
      time: 'HACE 12 MIN',
      tag: 'ACTUALIZACIÓN DE PARÁMETROS',
      pulse: true
    },
    {
      title: 'Lección Completada: Calibración de Sensores IR',
      time: 'HACE 3 HORAS',
      tag: 'MÓDULO DE APRENDIZAJE',
      xpBadge: '+150 XP'
    },
    {
      title: 'Simulación Ejecutada: Prueba de Estrés Térmico Alpha',
      time: 'AYER, 14:32',
      tag: 'ENTORNO DE PRUEBAS',
      sliders: true
    }
  ];
}
