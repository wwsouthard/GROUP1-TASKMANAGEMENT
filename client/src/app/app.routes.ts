/**
 * Sprint 1 — Application routes.
 * Create Task is available at /tasks/create; default path redirects there.
 */
import { Routes } from '@angular/router';
import { TaskCreateComponent } from './task-create/task-create.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks/create' },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: '**', redirectTo: 'tasks/create' }
];
