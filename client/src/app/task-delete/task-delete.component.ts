import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-delete.component.html',
  styleUrl: './task-delete.component.css'
})
export class TaskDeleteComponent {
  private readonly taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  taskId = Number(this.route.snapshot.paramMap.get('taskId'));
  errorMessage = '';

  deleteTask(): void {
    this.taskService.deleteTask(this.taskId).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      }, error: () => {
        this.errorMessage = 'Failed to delete task.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/tasks', this.taskId]);
  }
}
