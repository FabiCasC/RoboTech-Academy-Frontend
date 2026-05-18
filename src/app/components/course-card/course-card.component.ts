import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  @Input() badge: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() progress: number = 0;
  @Input() image: string = '';
}
