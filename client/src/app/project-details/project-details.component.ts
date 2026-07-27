import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);

  project?: Project;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    if(Number.isNaN(projectId)) {
      this.errorMessage = 'Invalid project ID';
      return;
    }

    this.isLoading = true;

    this.projectService.getProjectById(projectId).subscribe({
      next: (response) => {
        this.project = response.project ?? undefined;
        this.isLoading = false;
        if (!this.project) {
          this.errorMessage = 'Project not found.';
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load project.';
        this.isLoading = false;
      }
    });
  }

  isOverdue(endDate: string | Date | null | undefined): boolean {
    if(!endDate) {
      return false;
    }

    const date = new Date(endDate);
    if(Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }
}
