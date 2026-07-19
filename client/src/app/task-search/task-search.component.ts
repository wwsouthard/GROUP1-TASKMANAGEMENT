import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-search.component.html',
  styleUrl: './task-search.component.css'
})
export class TaskSearchComponent {
  private readonly taskService = inject(TaskService);

  searchQuery = '';
  tasks: Task[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  searchTasks(): void {
    const query = this.searchQuery.trim();

    this.hasSearched = true;
    this.errorMessage = '';

    if (query === '') {
      this.tasks = [];
      this.errorMessage = 'Enter a search term';
      return;
    }

    this.isLoading = true;

    this.taskService.searchTasks(query).subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to search tasks';
        this.tasks = [];
        this.isLoading = false;
      }
    });
  }

  statusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case 'In Progress':
        return 'badge badge--progress';
      case 'Completed':
        return 'badge badge--completed';
      default:
        return 'badge badge--pending';
    }
  }

  priorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case 'High':
        return 'badge badge--high';
      case 'Medium':
        return 'badge badge--medium';
      default:
        return 'badge badge--low';
    }
  }
}
