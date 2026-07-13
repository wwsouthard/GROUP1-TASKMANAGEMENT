import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '../models/task';
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
}
