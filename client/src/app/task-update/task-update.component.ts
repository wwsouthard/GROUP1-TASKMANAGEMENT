/**
 * Sprint 2 — Update Task component.
 * Loads an existing task by route taskId, populates a reactive form,
 * and submits changes through TaskService.updateTask.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest
} from '../models/task';

@Component({
  selector: 'app-task-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-update.component.html',
  styleUrl: './task-update.component.css'
})
export class TaskUpdateComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Dropdown options matching backend enums */
  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;

  /** Numeric taskId from the route (set after successful parse) */
  taskId: number | null = null;

  /** True while getTaskById is in flight */
  isLoading = false;

  /** True after the existing task has been loaded into the form */
  isTaskLoaded = false;

  /** True while the update request is in flight (prevents duplicate submits) */
  isSubmitting = false;

  /** User-facing feedback after load or submit */
  successMessage: string | null = null;
  errorMessage: string | null = null;

  /**
   * Update Task form.
   * Required: title, status, priority, projectId.
   * Optional: description, dueDate.
   * Immutable fields (_id, taskId, dateCreated, dateModified) are not included.
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

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (Number.isNaN(taskId)) {
      this.errorMessage = 'Invalid task ID';
      return;
    }

    this.taskId = taskId;
    this.loadTask(taskId);
  }

  /**
   * Submit the form when valid; call updateTask once and show success or error.
   */
  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.taskId === null || this.taskForm.invalid || this.isSubmitting) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    this.taskService.updateTask(this.taskId, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Task updated successfully';
        this.errorMessage = null;
        void this.router.navigate(['/tasks', this.taskId]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  /** Load the existing task and patch the form with editable values */
  private loadTask(taskId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.taskService.getTaskById(taskId).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (!response.task) {
          this.errorMessage = 'Task not found.';
          return;
        }

        this.populateForm(response.task);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getLoadErrorMessage(error);
      }
    });
  }

  /** Patch only editable fields from the loaded task document */
  private populateForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: this.formatDueDateForInput(task.dueDate),
      projectId: task.projectId
    });
    this.isTaskLoaded = true;
  }

  /** Convert API dueDate to yyyy-MM-dd for an HTML date input.
   * Atlas stores date-only values as UTC midnight; prefer the UTC calendar
   * date (or a leading yyyy-MM-dd prefix) so the form does not shift a day.
   */
  private formatDueDateForInput(dueDate: string | Date | null | undefined): string {
    if (dueDate === undefined || dueDate === null || dueDate === '') {
      return '';
    }

    if (typeof dueDate === 'string') {
      const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})/.exec(dueDate);
      if (dateOnlyMatch) {
        return dateOnlyMatch[1];
      }
    }

    const date = dueDate instanceof Date ? dueDate : new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  /** Build the PUT /api/tasks/:taskId body from form values */
  private buildPayload(): UpdateTaskRequest {
    const raw = this.taskForm.getRawValue();
    const payload: UpdateTaskRequest = {
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

  /** Map update API error bodies to a clear client message */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Unable to update task. Please try again.';
  }

  /** Map get-by-id failures (including 404) to a clear load message */
  private getLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Failed to load task.';
  }
}
