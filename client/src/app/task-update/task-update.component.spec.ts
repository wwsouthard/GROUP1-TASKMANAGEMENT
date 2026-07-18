/**
 * Sprint 2 — Update Task component tests (Karma + Jasmine).
 * TaskService is mocked; no real HTTP requests are made.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskUpdateComponent } from './task-update.component';
import { TaskService } from '../services/task.service';
import { Task, UpdateTaskResponse } from '../models/task';

describe('TaskUpdateComponent', () => {
  let component: TaskUpdateComponent;
  let fixture: ComponentFixture<TaskUpdateComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let router: Router;

  const mockTask: Task = {
    _id: '507f1f77bcf86cd799439011',
    taskId: 23,
    title: 'Design login screen',
    description: 'Create the UI/UX design for the login screen.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-04-28T00:00:00.000Z',
    projectId: 1000,
    dateCreated: new Date('2025-04-10T00:00:00.000Z'),
    dateModified: new Date('2025-04-15T00:00:00.000Z')
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('23')
      }
    }
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTaskById', 'updateTask']);

    await TestBed.configureTestingModule({
      imports: [TaskUpdateComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskUpdateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  // Test 1: route taskId loads the task and populates editable form controls
  it('should load the task and populate the form when the page loads', () => {
    taskServiceSpy.getTaskById.and.returnValue(
      of({
        message: 'Task retrieved successfully',
        task: mockTask
      })
    );

    fixture.detectChanges();

    expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith('taskId');
    expect(taskServiceSpy.getTaskById).toHaveBeenCalledWith(23);
    expect(component.taskId).toBe(23);
    expect(component.isTaskLoaded).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.taskForm.getRawValue()).toEqual({
      title: 'Design login screen',
      description: 'Create the UI/UX design for the login screen.',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2025-04-28',
      projectId: 1000
    });
  });

  // Test 2: invalid required field blocks updateTask and marks controls touched
  it('should not call updateTask when the form is invalid', () => {
    taskServiceSpy.getTaskById.and.returnValue(
      of({
        message: 'Task retrieved successfully',
        task: mockTask
      })
    );

    fixture.detectChanges();

    component.taskForm.patchValue({ title: '' });

    expect(component.taskForm.invalid).toBeTrue();
    expect(component.title.invalid).toBeTrue();

    component.onSubmit();

    expect(taskServiceSpy.updateTask).not.toHaveBeenCalled();
    expect(component.title.touched).toBeTrue();
  });

  // Test 3: valid submit calls updateTask once and navigates to details
  it('should call updateTask once with the expected payload and handle success', () => {
    taskServiceSpy.getTaskById.and.returnValue(
      of({
        message: 'Task retrieved successfully',
        task: mockTask
      })
    );

    const apiResponse: UpdateTaskResponse = {
      message: 'Task updated successfully',
      task: {
        ...mockTask,
        title: 'Updated login screen',
        status: 'Completed',
        priority: 'Medium',
        description: 'Revised design notes',
        dueDate: '2025-05-01',
        projectId: 1000
      }
    };

    taskServiceSpy.updateTask.and.returnValue(of(apiResponse));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges();

    component.taskForm.setValue({
      title: 'Updated login screen',
      description: 'Revised design notes',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2025-05-01',
      projectId: 1000
    });

    component.onSubmit();

    expect(taskServiceSpy.updateTask).toHaveBeenCalledTimes(1);
    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(23, {
      title: 'Updated login screen',
      description: 'Revised design notes',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2025-05-01',
      projectId: 1000
    });
    expect(component.successMessage).toBe('Task updated successfully');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/tasks', 23]);
  });
});
