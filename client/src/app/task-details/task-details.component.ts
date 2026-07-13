import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { Task } from '../models/task';
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
        this.task = response.task;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load task.';
        this.isLoading = false;
      }
    });
  }
}
