import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TaskDeleteComponent } from './task-delete.component';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task';

describe('TaskDeleteComponent', () => {
  let component: TaskDeleteComponent;
  let fixture: ComponentFixture<TaskDeleteComponent>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let router: Router;

  const mockTask: Task = {
    taskId: 23,
    title: 'Test Task',
    description: 'Test description',
    status: 'Pending',
    priority: 'High',
    dueDate: null,
    projectId: 1
  };

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'deleteTask',
      'getTaskById'
    ]);

    taskServiceMock.getTaskById.and.returnValue(
      of({
        message: 'Task retrieved successfully',
        task: mockTask
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        TaskDeleteComponent
      ],
      providers: [
        provideRouter([]),
        {
          provide: TaskService,
          useValue: taskServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '23'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDeleteComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the task on init', () => {
    expect(taskServiceMock.getTaskById).toHaveBeenCalledWith(23);
    expect(component.task).toEqual(mockTask);
    expect(component.isLoading).toBeFalse();
  });

  it('should call deleteTask service and reroute to api/tasks after success', () => {
    taskServiceMock.deleteTask.and.returnValue(of({ message: 'Task deleted successfully' }));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.deleteTask();

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith(23);
    expect(navigateSpy).toHaveBeenCalledWith(['/tasks']);
  });

  it('should return an error when it fails to delete task', () => {
    taskServiceMock.deleteTask.and.returnValue(
      throwError(() => new Error('Delete failed'))
    );
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.deleteTask();

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith(23);
    expect(component.errorMessage).toBe('Failed to delete task.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('Should navigate back to the task details when deletion is cancelled', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/tasks', 23]);
  });
});
