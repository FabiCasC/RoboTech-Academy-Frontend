import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent {
  currentUser = {
    avatar: 'perfil.png'
  };

  posts = [
    {
      authorName: 'Dr. Sarah Vance',
      authorAvatar: 'sarah_avatar.png',
      authorTitle: 'Lvl 42 Architect',
      time: '2h ago',
      title: 'Módulo de estabilización cinemática bípeda',
      content: 'Finalmente, se logró una latencia inferior al milisegundo en el bucle de retroalimentación giroscópica. El nuevo chasis de fibra de carbono absorbe la energía cinética residual, lo que sitúa el umbral de equilibrio dentro del parámetro objetivo de 0,02 delta.',
      badges: [
        { label: 'LATENCY', value: '0.8ms' },
        { label: 'DELTA', value: '0.015' },
        { label: 'STATE', value: 'STABLE' }
      ],
      mediaUrl: 'foro_post.png',
      likes: 342,
      comments: 48
    }
  ];

  topEngineers = [
    { rank: '01', name: 'M. Corvey', xp: '14,200 XP', avatar: 'corvey_avatar.png' },
    { rank: '02', name: 'E. Thorne', xp: '12,850 XP', avatar: 'thorne_avatar.png' },
    { rank: '03', name: 'J. Denton', xp: '11,400 XP', initials: 'JD' }
  ];

  bounties = [
    {
      title: 'Optimize Optical Flow Alg',
      detail: 'Reduce frame processing time by 15% on edge devices.',
      tag: 'PRIORITY: HIGH',
      xp: '+500 XP'
    },
    {
      title: 'Thermal Dissipation Design',
      detail: 'Design a passive cooling shell for Class 4 servos.',
      tag: 'HARDWARE',
      xp: '+350 XP'
    }
  ];
}
