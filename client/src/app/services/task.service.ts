/**
 * Sprint 1 — Task API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateTaskRequest,
  CreateTaskResponse,
  GetTasksResponse,
  GetTaskByIdResponse,
  UpdateTaskRequest,
  UpdateTaskResponse
} from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /**
   * List all tasks via GET /api/tasks
   */
  getTasks(): Observable<GetTasksResponse> {
    return this.http.get<GetTasksResponse>(`${this.apiBaseUrl}/api/tasks`);
  }

  /** * Get a task by it's taskId via GET /api/tasks/:taskId */
  getTaskById(taskId: number): Observable<GetTaskByIdResponse> {
    return this.http.get<GetTaskByIdResponse>(`${this.apiBaseUrl}/api/tasks/${taskId}`);
  }

  /**
   * Create a new task via POST /api/tasks
   */
  createTask(payload: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(`${this.apiBaseUrl}/api/tasks`, payload);
  }

  /**
   * Update an existing task via PUT /api/tasks/:taskId
   */
  updateTask(taskId: number, payload: UpdateTaskRequest): Observable<UpdateTaskResponse> {
    return this.http.put<UpdateTaskResponse>(`${this.apiBaseUrl}/api/tasks/${taskId}`, payload);
  }
}
