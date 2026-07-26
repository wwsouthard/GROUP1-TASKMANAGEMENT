import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProjectDetailsComponent } from './project-details.component';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;

  const mockProject: Project = {
    projectId: 223,
    name: 'Test Project',
    description: 'Test description',
    startDate: new Date(),
    endDate: null,
    dateCreated: new Date(),
    dateModified: new Date()
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('223')
      }
    }
  };

  beforeEach(async () => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'getProjectById'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ProjectDetailsComponent
      ],
      providers: [
        provideRouter([]),
        {
          provide: ProjectService,
          useValue: projectServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a project when the page loads', () => {
    projectServiceMock.getProjectById.and.returnValue(
      of({
        message: 'Project retrieved successfully',
        project: mockProject
      })
    );

    fixture.detectChanges();

    expect(projectServiceMock.getProjectById)
      .toHaveBeenCalledWith(223);

    expect(component.project)
      .toEqual(mockProject);

    expect(component.isLoading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe('');
  });

  it('should show failed to load project error when service returns an error', () => {
    projectServiceMock.getProjectById.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    fixture.detectChanges();

    expect(projectServiceMock.getProjectById)
      .toHaveBeenCalledWith(223);

    expect(component.errorMessage)
      .toBe('Failed to load project.');

    expect(component.isLoading)
      .toBeFalse();

    expect(component.project)
      .toBeUndefined();
  });
});
