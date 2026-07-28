/**
 * Sprint 4 — Update Project component tests (Karma + Jasmine).
 * ProjectService is mocked; no real HTTP requests are made.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectUpdateComponent } from './project-update.component';
import { ProjectService } from '../services/project.service';
import { Project, UpdateProjectResponse } from '../models/project';

describe('ProjectUpdateComponent', () => {
  let component: ProjectUpdateComponent;
  let fixture: ComponentFixture<ProjectUpdateComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let router: Router;

  const mockProject: Project = {
    _id: '507f1f77bcf86cd799439020',
    projectId: 223,
    name: 'Website Redesign',
    description: 'Redesign the company website',
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
    dateCreated: '2026-07-20T10:00:00.000Z',
    dateModified: '2026-07-20T10:00:00.000Z'
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('223')
      }
    }
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjectById', 'updateProject']);

    await TestBed.configureTestingModule({
      imports: [ProjectUpdateComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectUpdateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 1: route projectId loads the project and populates editable form controls
  it('should load the project and populate the form when the page loads', () => {
    projectServiceSpy.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    fixture.detectChanges();

    expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith('projectId');
    expect(projectServiceSpy.getProjectById).toHaveBeenCalledWith(223);
    expect(component.projectId).toBe(223);
    expect(component.isProjectLoaded).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.projectForm.getRawValue()).toEqual({
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    });
  });

  // Test 2: valid submit calls updateProject once with editable fields only and navigates to details
  it('should call updateProject once with the expected payload and handle success', () => {
    projectServiceSpy.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    const apiResponse: UpdateProjectResponse = {
      message: 'Project updated successfully',
      project: {
        ...mockProject,
        name: 'Updated Website Redesign',
        description: 'Revised scope for Q4',
        startDate: '2026-09-01',
        endDate: '2027-01-15'
      }
    };

    projectServiceSpy.updateProject.and.returnValue(of(apiResponse));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges();

    component.projectForm.setValue({
      name: 'Updated Website Redesign',
      description: 'Revised scope for Q4',
      startDate: '2026-09-01',
      endDate: '2027-01-15'
    });

    component.onSubmit();

    expect(projectServiceSpy.updateProject).toHaveBeenCalledTimes(1);
    expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(223, {
      name: 'Updated Website Redesign',
      description: 'Revised scope for Q4',
      startDate: '2026-09-01',
      endDate: '2027-01-15'
    });

    const submittedPayload = projectServiceSpy.updateProject.calls.mostRecent().args[1];
    expect('projectId' in submittedPayload).toBeFalse();
    expect('_id' in submittedPayload).toBeFalse();
    expect('dateCreated' in submittedPayload).toBeFalse();
    expect('dateModified' in submittedPayload).toBeFalse();

    expect(component.successMessage).toBe('Project updated successfully');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/projects', 223]);
  });

  // Test 3: endDate not after startDate blocks updateProject and marks controls touched
  it('should not call updateProject when endDate is not later than startDate', () => {
    projectServiceSpy.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    fixture.detectChanges();

    component.projectForm.setValue({
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-07-01'
    });

    expect(component.projectForm.invalid).toBeTrue();
    expect(component.projectForm.errors?.['endDateNotAfterStartDate']).toBeTrue();

    component.onSubmit();

    expect(projectServiceSpy.updateProject).not.toHaveBeenCalled();
    expect(component.endDate.touched).toBeTrue();
    expect(component.startDate.touched).toBeTrue();
  });

  // Test 4: service error is handled without navigating away
  it('should set errorMessage and not navigate when updateProject returns an error', () => {
    projectServiceSpy.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    projectServiceSpy.updateProject.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'A project with this name already exists' } }))
    );

    fixture.detectChanges();

    component.projectForm.setValue({
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('A project with this name already exists');
    expect(component.successMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
