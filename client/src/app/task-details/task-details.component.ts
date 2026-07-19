import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private route = inject(ActivatedRoute);

  task?: Task;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (Number.isNaN(taskId)) {
      this.errorMessage = 'Invalid task ID';
      return;
    }

    this.isLoading = true;

    this.taskService.getTaskById(taskId).subscribe({
      next: (response) => {
        this.task = response.task ?? undefined;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load task.';
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
