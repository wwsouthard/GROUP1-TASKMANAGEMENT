/**
 * Sprint 3 — Create Project component tests (Karma + Jasmine).
 * ProjectService is mocked; no real HTTP requests are made.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectCreateComponent } from './project-create.component';
import { ProjectService } from '../services/project.service';
import { CreateProjectResponse } from '../models/project';

describe('ProjectCreateComponent', () => {
  let component: ProjectCreateComponent;
  let fixture: ComponentFixture<ProjectCreateComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let router: Router;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['createProject']);

    await TestBed.configureTestingModule({
      imports: [ProjectCreateComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCreateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Test 1: component initializes and the form has the expected controls
  it('should create the component with name, description, startDate, and endDate controls', () => {
    expect(component).toBeTruthy();
    expect(component.projectForm.contains('name')).toBeTrue();
    expect(component.projectForm.contains('description')).toBeTrue();
    expect(component.projectForm.contains('startDate')).toBeTrue();
    expect(component.projectForm.contains('endDate')).toBeTrue();
  });

  // Test 2: form is invalid when name or startDate is missing
  it('should be invalid when name is missing', () => {
    component.projectForm.setValue({ name: '', description: '', startDate: '2026-08-01', endDate: '' });
    expect(component.projectForm.invalid).toBeTrue();
    expect(component.name.invalid).toBeTrue();
  });

  it('should be invalid when startDate is missing', () => {
    component.projectForm.setValue({ name: 'Website Redesign', description: '', startDate: '', endDate: '' });
    expect(component.projectForm.invalid).toBeTrue();
    expect(component.startDate.invalid).toBeTrue();
  });

  it('should be valid when both name and startDate are provided', () => {
    component.projectForm.setValue({ name: 'Website Redesign', description: '', startDate: '2026-08-01', endDate: '' });
    expect(component.projectForm.valid).toBeTrue();
  });

  // Test 3: form is invalid when endDate is not later than startDate
  it('should be invalid when endDate is equal to startDate', () => {
    component.projectForm.setValue({
      name: 'Website Redesign',
      description: '',
      startDate: '2026-08-01',
      endDate: '2026-08-01'
    });
    expect(component.projectForm.invalid).toBeTrue();
    expect(component.projectForm.errors?.['endDateNotAfterStartDate']).toBeTrue();
  });

  it('should be invalid when endDate is before startDate', () => {
    component.projectForm.setValue({
      name: 'Website Redesign',
      description: '',
      startDate: '2026-08-01',
      endDate: '2026-07-01'
    });
    expect(component.projectForm.invalid).toBeTrue();
    expect(component.projectForm.errors?.['endDateNotAfterStartDate']).toBeTrue();
  });

  it('should be valid when endDate is later than startDate', () => {
    component.projectForm.setValue({
      name: 'Website Redesign',
      description: '',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    });
    expect(component.projectForm.valid).toBeTrue();
  });

  // Test 4: valid form calls the project service with the correct request data
  it('should call createProject with the correct payload on valid submit', () => {
    const apiResponse: CreateProjectResponse = {
      message: 'Project created successfully',
      project: {
        projectId: 1,
        name: 'Website Redesign',
        description: 'Redesign the company website',
        startDate: '2026-08-01',
        endDate: '2026-12-31',
        dateCreated: '2026-07-20T10:00:00.000Z',
        dateModified: '2026-07-20T10:00:00.000Z'
      }
    };

    projectServiceSpy.createProject.and.returnValue(of(apiResponse));
    spyOn(router, 'navigate').and.resolveTo(true);

    component.projectForm.setValue({
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    });

    component.onSubmit();

    expect(projectServiceSpy.createProject).toHaveBeenCalledTimes(1);
    expect(projectServiceSpy.createProject).toHaveBeenCalledWith({
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    });
  });

  // Test 5: invalid form does not call the project service
  it('should not call createProject when the form is invalid', () => {
    component.projectForm.setValue({ name: '', description: '', startDate: '', endDate: '' });

    component.onSubmit();

    expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
    expect(component.name.touched).toBeTrue();
    expect(component.startDate.touched).toBeTrue();
  });

  // Test 6: successful service response updates the component appropriately
  it('should set successMessage, clear errorMessage, and navigate to /projects on success', () => {
    const apiResponse: CreateProjectResponse = {
      message: 'Project created successfully',
      project: {
        projectId: 2,
        name: 'Internal Tools',
        description: null,
        startDate: '2026-09-01',
        endDate: null,
        dateCreated: '2026-07-20T10:00:00.000Z',
        dateModified: '2026-07-20T10:00:00.000Z'
      }
    };

    projectServiceSpy.createProject.and.returnValue(of(apiResponse));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.projectForm.setValue({ name: 'Internal Tools', description: '', startDate: '2026-09-01', endDate: '' });

    component.onSubmit();

    expect(component.successMessage).toBe('Project created successfully');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/tasks']);
  });

  // Test 7: service error is handled without crashing the component
  it('should set errorMessage and not navigate when the service returns an error', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    projectServiceSpy.createProject.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'A project with this name already exists' } }))
    );

    component.projectForm.setValue({ name: 'Website Redesign', description: '', startDate: '2026-08-01', endDate: '' });

    component.onSubmit();

    expect(component.errorMessage).toBe('A project with this name already exists');
    expect(component.successMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
