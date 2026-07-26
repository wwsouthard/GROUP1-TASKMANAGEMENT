/**
 * Sprint 1 — Create Task component.
 * Reactive form that submits a new task through TaskService.createTask.
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import {
  CreateTaskRequest,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskPriority,
  TaskStatus
} from '../models/task';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css'
})
export class TaskCreateComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  /** Dropdown options matching backend enums */
  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;

  /** True while the create request is in flight (prevents duplicate submits) */
  isSubmitting = false;

  /** User-facing feedback after submit */
  successMessage: string | null = null;
  errorMessage: string | null = null;

  /** Server-assigned taskId from the create response (shown after success) */
  createdTaskId: number | null = null;

  /**
   * Create Task form.
   * Required: title, status, priority, projectId (API/Atlas require projectId).
   * Optional: description, dueDate.
   */
  readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    status: ['' as '' | TaskStatus, [Validators.required]],
    priority: ['' as '' | TaskPriority, [Validators.required]],
    dueDate: [''],
    projectId: [null as number | null, [Validators.required]]
  });

  /** Convenience accessors for template validation messages */
  get title() {
    return this.taskForm.controls.title;
  }

  get status() {
    return this.taskForm.controls.status;
  }

  get priority() {
    return this.taskForm.controls.priority;
  }

  get projectId() {
    return this.taskForm.controls.projectId;
  }

  /**
   * Submit the form when valid; call createTask once and show success or error.
   */
  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.createdTaskId = null;

    if (this.taskForm.invalid || this.isSubmitting) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    this.taskService.createTask(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.errorMessage = null;

        const taskId = response.task?.taskId;
        this.createdTaskId =
          typeof taskId === 'number' && !Number.isNaN(taskId) ? taskId : null;

        // Expose the server-assigned taskId so reviewers can confirm create → read-by-id.
        this.successMessage =
          this.createdTaskId != null
            ? `Task created successfully. Task ID: ${this.createdTaskId}`
            : response.message || 'Task created successfully';

        if (this.createdTaskId != null) {
          void this.router.navigate(['/tasks', this.createdTaskId]);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.createdTaskId = null;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  /** Build the POST /api/tasks body from form values */
  private buildPayload(): CreateTaskRequest {
    const raw = this.taskForm.getRawValue();
    const payload: CreateTaskRequest = {
      title: raw.title.trim(),
      status: raw.status as TaskStatus,
      priority: raw.priority as TaskPriority,
      projectId: Number(raw.projectId)
    };

    const description = raw.description.trim();
    payload.description = description === '' ? null : description;

    payload.dueDate = raw.dueDate === '' ? null : raw.dueDate;

    return payload;
  }

  /** Map API error bodies to a clear client message (includes duplicate title) */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Unable to create task. Please try again.';
  }
}
