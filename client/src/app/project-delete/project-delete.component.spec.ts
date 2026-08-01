import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProjectDeleteComponent } from './project-delete.component';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project';

describe('ProjectDeleteComponent', () => {
  let component: ProjectDeleteComponent;
  let fixture: ComponentFixture<ProjectDeleteComponent>;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let router: Router;

  const mockProject: Project = {
    projectId: 223,
    name: 'Test Project',
    description: 'Test description',
  };

  beforeEach(async () => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'deleteProject',
      'getProjectById'
    ]);

    projectServiceMock.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        ProjectDeleteComponent
      ],
      providers: [
        provideRouter([]),
        {
          provide: ProjectService,
          useValue: projectServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '223'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDeleteComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the project on init', () => {
    expect(projectServiceMock.getProjectById).toHaveBeenCalledWith(223);
    expect(component.project).toEqual(mockProject);
    expect(component.isLoading).toBeFalse();
  });

  it('should call deleteProject service and reroute to api/projects after success', () => {
    projectServiceMock.deleteProject.and.returnValue(of({ message: 'Project deleted successfully' }));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.deleteProject();

    expect(projectServiceMock.deleteProject).toHaveBeenCalledWith(223);
    expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('should return an error when it fails to delete project', () => {
    projectServiceMock.deleteProject.and.returnValue(
      throwError(() => new Error('Delete failed'))
    );
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.deleteProject();

    expect(projectServiceMock.deleteProject).toHaveBeenCalledWith(223);
    expect(component.errorMessage).toBe('Failed to delete project.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('Should navigate back to the project details when deletion is cancelled', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/projects', 223]);
  });
});
