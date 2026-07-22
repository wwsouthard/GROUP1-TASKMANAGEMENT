import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-delete',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-delete.component.html',
  styleUrl: './task-delete.component.css'
})
export class TaskDeleteComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  taskId = Number(this.route.snapshot.paramMap.get('taskId'));
  task: Task | null = null;
  isLoading = false;
  isDeleting = false;
  errorMessage = '';

  get hasValidTaskId(): boolean {
    return !Number.isNaN(this.taskId);
  }

  ngOnInit(): void {
    if (!this.hasValidTaskId) {
      this.errorMessage = 'Invalid task ID.';
      return;
    }

    this.isLoading = true;

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response) => {
        this.task = response.task ?? null;
        if (!this.task) {
          this.errorMessage = 'Task not found.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load task.';
        this.isLoading = false;
      }
    });
  }

  deleteTask(): void {
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.taskService.deleteTask(this.taskId).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.errorMessage = 'Failed to delete task.';
        this.isDeleting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/tasks', this.taskId]);
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
