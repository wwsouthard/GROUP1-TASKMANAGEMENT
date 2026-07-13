import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TaskService } from '../services/task.service';
import { TaskListComponent } from './task-list.component';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj<TaskService>('TaskService', ['getTasks']);

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskServiceMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    taskServiceMock.getTasks.and.returnValue(of({
      message: 'Tasks retrieved successfully',
      tasks: []
    }));

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display tasks returned from the service', () => {
    taskServiceMock.getTasks.and.returnValue(of({
      message: 'Tasks retrieved successfully',
      tasks: [
        {
          _id: 'task-1',
          taskId: 23,
          title: 'Design login screen',
          status: 'Pending',
          priority: 'High',
          projectId: 1000
        }
      ]
    }));

    fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(taskServiceMock.getTasks).toHaveBeenCalled();
    expect(compiled.textContent).toContain('Design login screen');
    expect(compiled.textContent).toContain('Pending');
    expect(compiled.textContent).toContain('High');
  });

  it('should display an error message when tasks cannot be loaded', () => {
    taskServiceMock.getTasks.and.returnValue(throwError(() => new Error('API error')));

    fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Unable to load tasks');
  });
});
