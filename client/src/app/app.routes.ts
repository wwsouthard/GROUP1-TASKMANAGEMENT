/**
 * Application routes.
 * Create Task is available at /tasks/create.
 * Update Task is available at /tasks/:taskId/edit.
 * List All Tasks is available at /tasks.
 */
import { Routes } from '@angular/router';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskUpdateComponent } from './task-update/task-update.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: 'tasks/:taskId/edit', component: TaskUpdateComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:taskId', component: TaskDetailsComponent },
  { path: '**', redirectTo: 'tasks' }
];
