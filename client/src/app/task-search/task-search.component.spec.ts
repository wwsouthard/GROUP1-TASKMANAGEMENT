import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TaskService } from '../services/task.service';
import { TaskSearchComponent } from './task-search.component';

describe('TaskSearchComponent', () => {
  let component: TaskSearchComponent;
  let fixture: ComponentFixture<TaskSearchComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['searchTasks']);

    await TestBed.configureTestingModule({
      imports: [TaskSearchComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search tasks and store matching results', () => {
    const mockTasks = [
      {
        _id: 'task-1',
        title: 'Design login screen',
        status: 'Pending' as const,
        priority: 'High' as const,
        projectId: 1000
      }
    ];

    taskServiceSpy.searchTasks.and.returnValue(of({
      message: 'Tasks searched successfully',
      tasks: mockTasks
    }));

    component.searchQuery = 'login';
    component.searchTasks();

    expect(taskServiceSpy.searchTasks).toHaveBeenCalledWith('login');
    expect(component.tasks).toEqual(mockTasks);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should show an error message when search fails', () => {
    taskServiceSpy.searchTasks.and.returnValue(
      throwError(() => new Error('Search failed'))
    );

    component.searchQuery = 'login';
    component.searchTasks();

    expect(component.tasks).toEqual([]);
    expect(component.errorMessage).toBe('Unable to search tasks');
    expect(component.isLoading).toBeFalse();
  });
});
