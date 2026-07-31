import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectSearchComponent } from './project-search.component';
import { ProjectService } from '../services/project.service';

describe('ProjectSearchComponent', () => {
  let component: ProjectSearchComponent;
  let fixture: ComponentFixture<ProjectSearchComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', ['searchProjects']);

    await TestBed.configureTestingModule({
      imports: [ProjectSearchComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: component creates successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: valid search calls ProjectService and stores results
  it('should search projects and store returned results', () => {
    const projects = [
      {
        projectId: 1000,
        name: 'Website Redesign',
        description: 'Redesign the company website',
        startDate: '2026-08-01',
        endDate: '2026-12-31'
      }
    ];

    projectServiceSpy.searchProjects.and.returnValue(
      of({ message: 'Projects searched successfully', projects })
    );

    component.searchQuery = 'website';
    component.searchProjects();

    expect(projectServiceSpy.searchProjects).toHaveBeenCalledWith('website');
    expect(component.projects).toEqual(projects);
    expect(component.isLoading).toBeFalse();
    expect(component.hasSearched).toBeTrue();
    expect(component.errorMessage).toBeNull();
  });

  // Test 3: empty search does not call ProjectService
  it('should not call searchProjects when the query is empty', () => {
    component.searchQuery = '   ';
    component.searchProjects();

    expect(projectServiceSpy.searchProjects).not.toHaveBeenCalled();
    expect(component.projects).toEqual([]);
    expect(component.hasSearched).toBeFalse();
  });

  // Test 4: service error displays an error message and clears results
  it('should show an error message when search fails', () => {
    projectServiceSpy.searchProjects.and.returnValue(
      throwError(() => ({ status: 500, error: { message: 'Unable to search projects' } }))
    );

    component.searchQuery = 'website';
    component.searchProjects();

    expect(component.projects).toEqual([]);
    expect(component.errorMessage).toBe('Unable to search projects');
    expect(component.isLoading).toBeFalse();
  });
});
