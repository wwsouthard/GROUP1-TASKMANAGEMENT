/**
 * Application routes.
 * Create Task is available at /tasks/create.
 * Search Tasks is available at /tasks/search.
 * Update Task is available at /tasks/:taskId/edit.
 * List All Tasks is available at /tasks.
 */
import { Routes } from '@angular/router';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskDeleteComponent } from './task-delete/task-delete.component';
import { TaskSearchComponent } from './task-search/task-search.component';
import { TaskUpdateComponent } from './task-update/task-update.component';
import { ProjectCreateComponent } from './project-create/project-create.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: 'tasks/search', component: TaskSearchComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:taskId/edit', component: TaskUpdateComponent },
  { path: 'tasks/:taskId/delete', component: TaskDeleteComponent },
  { path: 'tasks/:taskId', component: TaskDetailsComponent },
  { path: '**', redirectTo: 'tasks' }
];
