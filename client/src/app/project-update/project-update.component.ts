/**
 * Sprint 4 — Update Project component.
 * Loads an existing project by route projectId, populates a reactive form,
 * and submits changes through ProjectService.updateProject.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { Project, UpdateProjectRequest } from '../models/project';

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
  selector: 'app-project-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-update.component.html',
  styleUrl: './project-update.component.css'
})
export class ProjectUpdateComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Numeric projectId from the route (set after successful parse) */
  projectId: number | null = null;

  /** True while getProjectById is in flight */
  isLoading = false;

  /** True after the existing project has been loaded into the form */
  isProjectLoaded = false;

  /** True while the update request is in flight (prevents duplicate submits) */
  isSubmitting = false;

  /** User-facing feedback after load or submit */
  successMessage: string | null = null;
  errorMessage: string | null = null;

  /**
   * Update Project form.
   * Required: name, startDate.
   * Optional: description, endDate.
   * Immutable fields (_id, projectId, dateCreated, dateModified) are not included.
   */
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

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    if (Number.isNaN(projectId)) {
      this.errorMessage = 'Invalid project ID';
      return;
    }

    this.projectId = projectId;
    this.loadProject(projectId);
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.projectId === null || this.projectForm.invalid || this.isSubmitting) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    this.projectService.updateProject(this.projectId, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Project updated successfully';
        this.errorMessage = null;
        void this.router.navigate(['/projects', this.projectId]);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private loadProject(projectId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.projectService.getProjectById(projectId).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (!response.project) {
          this.errorMessage = 'Project not found.';
          return;
        }

        this.populateForm(response.project);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getLoadErrorMessage(error);
      }
    });
  }

  private populateForm(project: Project): void {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description ?? '',
      startDate: this.formatDateForInput(project.startDate),
      endDate: this.formatDateForInput(project.endDate)
    });
    this.isProjectLoaded = true;
  }

  /** Convert API date values to yyyy-MM-dd for HTML date inputs. */
  private formatDateForInput(dateValue: string | Date | null | undefined): string {
    if (dateValue === undefined || dateValue === null || dateValue === '') {
      return '';
    }

    if (typeof dateValue === 'string') {
      const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})/.exec(dateValue);
      if (dateOnlyMatch) {
        return dateOnlyMatch[1];
      }
    }

    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private buildPayload(): UpdateProjectRequest {
    const raw = this.projectForm.getRawValue();
    const payload: UpdateProjectRequest = {
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

    return 'Unable to update project. Please try again.';
  }

  private getLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }

    return 'Failed to load project.';
  }
}
