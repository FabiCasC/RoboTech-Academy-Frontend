import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';

@Component({
  selector: 'app-estudiante-flow',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './estudiante-flow.component.html',
  styleUrl: './estudiante-flow.component.css'
})
export class EstudianteFlowComponent {
  readonly profile = ROLE_PROFILES['EST-ROLE'];

  readonly steps = [
    {
      n: '01',
      title: 'Fundamentación teórica',
      desc: 'Lecciones y módulos de aprendizaje autónomo.',
      link: '/dashboard',
      icon: 'menu_book'
    },
    {
      n: '02',
      title: 'Catálogo de componentes',
      desc: 'Explora sensores, actuadores y microcontroladores.',
      link: '/components',
      icon: 'memory'
    },
    {
      n: '03',
      title: 'Circuito virtual 2D',
      desc: 'Construye y conecta el esquemático en el laboratorio.',
      link: '/laboratorio2d',
      icon: 'account_tree'
    },
    {
      n: '04',
      title: 'Código y simulación',
      desc: 'Compila en el IDE y visualiza la simulación física.',
      link: '/ide-programacion',
      icon: 'code'
    },
    {
      n: '05',
      title: 'Foro de la comunidad',
      desc: 'Comparte avances y resuelve dudas con otros estudiantes.',
      link: '/foro',
      icon: 'forum'
    }
  ];
}
