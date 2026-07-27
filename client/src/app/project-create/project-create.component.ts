import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { CreateProjectRequest } from '../models/project';

/** Cross-field validator: endDate must be later than startDate when both are present. */
function endDateAfterStartDate(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  if (!start || !end) {
    return null;
  }

  return new Date(end) > new Date(start) ? null : { endDateNotAfterStartDate: true };
}

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.css'
})
export class ProjectCreateComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  /** Server-assigned projectId from the create response (shown after success) */
  createdProjectId: number | null = null;

  readonly projectForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: ['']
    },
    { validators: endDateAfterStartDate }
  );

  get name() {
    return this.projectForm.controls.name;
  }

  get startDate() {
    return this.projectForm.controls.startDate;
  }

  get endDate() {
    return this.projectForm.controls.endDate;
  }

  get endDateError(): boolean {
    return (
      !!this.projectForm.errors?.['endDateNotAfterStartDate'] &&
      this.endDate.touched &&
      this.endDate.value !== ''
    );
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.createdProjectId = null;

    if (this.projectForm.invalid || this.isSubmitting) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    this.projectService.createProject(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.errorMessage = null;

        const projectId = response.project?.projectId;
        this.createdProjectId =
          typeof projectId === 'number' && !Number.isNaN(projectId) ? projectId : null;

        this.successMessage =
          this.createdProjectId != null
            ? `Project created successfully. Project ID: ${this.createdProjectId}`
            : response.message || 'Project created successfully';

        if (this.createdProjectId != null) {
          void this.router.navigate(['/projects', this.createdProjectId]);
        } else {
          void this.router.navigate(['/projects']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.createdProjectId = null;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private buildPayload(): CreateProjectRequest {
    const raw = this.projectForm.getRawValue();
    const payload: CreateProjectRequest = {
      name: raw.name.trim(),
      startDate: raw.startDate
    };

    const description = raw.description.trim();
    payload.description = description === '' ? null : description;
    payload.endDate = raw.endDate === '' ? null : raw.endDate;

    return payload;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Unable to create project. Please try again.';
  }
}
