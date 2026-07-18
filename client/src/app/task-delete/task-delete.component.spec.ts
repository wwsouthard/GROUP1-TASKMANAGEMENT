import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TaskDeleteComponent } from './task-delete.component';
import { TaskService } from '../services/task.service';

describe('TaskDeleteComponent', () => {
  let component: TaskDeleteComponent;
  let fixture: ComponentFixture<TaskDeleteComponent>;

  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'deleteTask'
    ]);

    routerMock = jasmine.createSpyObj('Router', [
      'navigate'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TaskDeleteComponent
      ],
      providers: [
        {
          provide: TaskService,
          useValue: taskServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call deleteTask service and reroute to api/tasks after success', () => {
    taskServiceMock.deleteTask.and.returnValue(of({ message: 'Task deleted successfully' }));

    component.deleteTask();

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith(23);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should return an error when it fails to delete task', () => {
    taskServiceMock.deleteTask.and.returnValue(
      throwError(() => new Error('Delete failed'))
    );

    component.deleteTask();

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith(23);

    expect(component.errorMessage).toBe('Failed to delete task.');

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('Should navigate back to the task details when deletion is cancelled', () => {
    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks', 23]);
  });
});
