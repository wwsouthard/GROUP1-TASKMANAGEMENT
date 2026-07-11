/**
 * Sprint 1 — Create Task component tests (Karma + Jasmine).
 * TaskService is mocked; no real HTTP requests are made.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TaskCreateComponent } from './task-create.component';
import { TaskService } from '../services/task.service';
import { CreateTaskResponse } from '../models/task';

describe('TaskCreateComponent', () => {
  let component: TaskCreateComponent;
  let fixture: ComponentFixture<TaskCreateComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['createTask']);

    await TestBed.configureTestingModule({
      imports: [TaskCreateComponent],
      providers: [{ provide: TaskService, useValue: taskServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: component bootstraps successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: required fields drive form validity
  it('should be invalid when required fields are empty and valid when they are filled', () => {
    expect(component.taskForm.invalid).toBeTrue();

    component.taskForm.setValue({
      title: 'Write sprint documentation',
      description: 'Optional details',
      status: 'Pending',
      priority: 'High',
      dueDate: '2026-07-20',
      projectId: 1000
    });

    expect(component.taskForm.valid).toBeTrue();
  });

  // Test 3: valid submit calls createTask once and handles success
  it('should call createTask once with the expected payload and handle success', () => {
    const apiResponse: CreateTaskResponse = {
      message: 'Task created successfully',
      task: {
        _id: '507f1f77bcf86cd799439011',
        title: 'Write sprint documentation',
        description: 'Optional details',
        status: 'Pending',
        priority: 'High',
        dueDate: '2026-07-20',
        projectId: 1000
      }
    };

    taskServiceSpy.createTask.and.returnValue(of(apiResponse));

    component.taskForm.setValue({
      title: 'Write sprint documentation',
      description: 'Optional details',
      status: 'Pending',
      priority: 'High',
      dueDate: '2026-07-20',
      projectId: 1000
    });

    component.onSubmit();

    expect(taskServiceSpy.createTask).toHaveBeenCalledTimes(1);
    expect(taskServiceSpy.createTask).toHaveBeenCalledWith({
      title: 'Write sprint documentation',
      description: 'Optional details',
      status: 'Pending',
      priority: 'High',
      dueDate: '2026-07-20',
      projectId: 1000
    });
    expect(component.successMessage).toBe('Task created successfully');
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  });
});
