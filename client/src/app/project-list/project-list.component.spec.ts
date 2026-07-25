import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectService } from '../services/project.service';
import { ProjectListComponent } from './project-list.component';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects']);

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects and store results', () => {
    const mockProjects = [
      {
        _id: 'project-1',
        projectId: 1000,
        name: 'Website Redesign',
        description: 'Update the company website',
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2026-08-01T00:00:00.000Z'
      }
    ];

    projectServiceSpy.getProjects.and.returnValue(of({
      message: 'Projects retrieved successfully',
      projects: mockProjects
    }));

    component.ngOnInit();

    expect(projectServiceSpy.getProjects).toHaveBeenCalled();
    expect(component.projects).toEqual(mockProjects);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should show an error message when projects fail to load', () => {
    projectServiceSpy.getProjects.and.returnValue(
      throwError(() => new Error('Load failed'))
    );

    component.ngOnInit();

    expect(component.projects).toEqual([]);
    expect(component.errorMessage).toBe('Unable to load projects');
    expect(component.isLoading).toBeFalse();
  });
});
