import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  tasks: Task[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load tasks';
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

  isOverdue(dueDate: string | Date | null | undefined): boolean {
    if (!dueDate) {
      return false;
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }
}
