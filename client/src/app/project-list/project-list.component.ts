import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  projects: Project[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.projectService.getProjects().subscribe({
      next: (response) => {
        this.projects = response.projects;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load projects';
        this.projects = [];
        this.isLoading = false;
      }
    });
  }

  isPastEndDate(endDate: string | Date | null | undefined): boolean {
    if (!endDate) {
      return false;
    }

    const date = new Date(endDate);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }
}
