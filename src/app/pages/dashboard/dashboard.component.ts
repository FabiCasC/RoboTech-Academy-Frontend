import { Component } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CourseCardComponent, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  courses = [
    {
      badge: 'ID: RB-101',
      title: 'ROBOTICA BASICA',
      description: 'fundamentos de cinemática, dinámica de actuadores y...',
      progress: 45,
      image: 'https://png.pngtree.com/thumb_back/fh260/background/20230623/pngtree-futuristic-robot-arms-in-3d-render-on-black-background-image_3658036.jpg'
    },
    {
      badge: 'ID: SC-205',
      title: 'SISTEMAS DE CONTROL',
      description: 'Lazos de retroalimentación PID, estabilización de giroscopios y...',
      progress: 89,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      badge: 'ID: DR-100',
      title: 'ROBOT DEGUIDOR DE LINEA',
      description: 'sistema autónomo capaz de detectar una trayectoria marcada y seguirla de manera precisa.',
      progress: 12,
      image: 'https://www.shutterstock.com/image-illustration/tech-love-3d-arduino-heart-260nw-2430159711.jpg'
    }
  ];
}
