/**
 * Sprint 1 — Application routes.
 * Create Task is available at /tasks/create.
 * List All Tasks is available at /tasks.
 */
import { Routes } from '@angular/router';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:taskId', component: TaskDetailsComponent },
  { path: '**', redirectTo: 'tasks' }
];
