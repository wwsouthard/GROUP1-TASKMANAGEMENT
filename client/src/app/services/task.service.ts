/**
 * Sprint 1 — Task API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTaskRequest, CreateTaskResponse, GetTasksResponse, GetTaskByIdResponse, DeleteTaskResponse } from '../models/task';

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
   * Delete a task via DELETE /api/tasks/:taskId
   */
  deleteTask(taskId: number): Observable<DeleteTaskResponse> {
    return this.http.delete<DeleteTaskResponse>(`${this.apiBaseUrl}/api/tasks/${taskId}`);
  }
}
