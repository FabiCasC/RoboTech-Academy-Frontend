import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './control.component.html',
  styleUrl: './control.component.css'
})
export class ControlComponent {
  projects = [
    { id: 'PRJ-ALPHA-09', status: 'SIMULANDO', statusClass: 'status-simulating', date: 'Hace 12 min' },
    { id: 'SYS-BETA-V2', status: 'PAUSADO', statusClass: 'status-paused', date: 'Ayer, 14:30' },
    { id: 'TEST-ENV-01', status: 'ARCHIVADO', statusClass: 'status-archived', date: '02 Nov 2023' }
  ];

  filteredProjects = [...this.projects];

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value.toLowerCase().trim();
    this.filteredProjects = this.projects.filter(p =>
      p.id.toLowerCase().includes(term) || p.status.toLowerCase().includes(term)
    );
  }
}
