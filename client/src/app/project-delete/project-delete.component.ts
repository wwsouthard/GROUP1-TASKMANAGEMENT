import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-delete',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-delete.component.html',
  styleUrl: './project-delete.component.css'
})
export class ProjectDeleteComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projectId = Number(this.route.snapshot.paramMap.get('projectId'));
  project: Project | null = null;
  isLoading = false;
  isDeleting = false;
  errorMessage = '';

  get hasValidProjectId(): boolean {
    return !Number.isNaN(this.projectId);
  }

  ngOnInit(): void {
    if (!this.hasValidProjectId) {
      this.errorMessage = 'Invalid task ID.';
      return;
    }

    this.isLoading = true;

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        this.project = response.project ?? null;
        if (!this.project) {
          this.errorMessage = 'Project not found.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load project.';
        this.isLoading = false;
      }
    });
  }

  deleteProject(): void {
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.errorMessage = 'Failed to delete project.';
        this.isDeleting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
}
