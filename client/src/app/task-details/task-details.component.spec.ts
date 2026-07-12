import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TaskDetailsComponent } from './task-details.component';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task';

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;

  const mockTask: Task = {
    taskId: 23,
    title: 'Test Task',
    description: 'Test description',
    status: 'Pending',
    priority: 'High',
    dueDate: null,
    projectId: 1,
    dateCreated: new Date(),
    dateModified: new Date()
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('23')
      }
    }
  };

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'getTaskById'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TaskDetailsComponent
      ],
      providers: [
        {
          provide: TaskService,
          useValue: taskServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a task when the page loads', () => {
    taskServiceMock.getTaskById.and.returnValue(
      of({
        message: 'Task retrieved successfully',
        task: mockTask
      })
    );

    fixture.detectChanges();

    expect(taskServiceMock.getTaskById)
      .toHaveBeenCalledWith(23);

    expect(component.task)
      .toEqual(mockTask);

    expect(component.isLoading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe('');
  });

  it('should show failed to load task error when service returns an error', () => {
    taskServiceMock.getTaskById.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    fixture.detectChanges();

    expect(taskServiceMock.getTaskById)
      .toHaveBeenCalledWith(23);

    expect(component.errorMessage)
      .toBe('Failed to load task.');

    expect(component.isLoading)
      .toBeFalse();

    expect(component.task)
      .toBeUndefined();
  });
});
