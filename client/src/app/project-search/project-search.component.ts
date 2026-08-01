import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-search.component.html',
  styleUrl: './project-search.component.css'
})
export class ProjectSearchComponent {
  private readonly projectService = inject(ProjectService);

  searchQuery = '';
  projects: Project[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage: string | null = null;

  searchProjects(): void {
    const query = this.searchQuery.trim();

    this.errorMessage = null;

    if (!query) {
      this.projects = [];
      this.hasSearched = false;
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    this.projectService.searchProjects(query).subscribe({
      next: (response) => {
        this.projects = response.projects;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.projects = [];
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.projects = [];
    this.errorMessage = null;
    this.hasSearched = false;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Unable to search projects. Please try again.';
  }
}
