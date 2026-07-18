/**
 * Sprint 1 — Task API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTaskRequest, CreateTaskResponse, GetTasksResponse, GetTaskByIdResponse } from '../models/task';

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
   * Search tasks via GET /api/tasks/search?query=value
   */
  searchTasks(query: string): Observable<GetTasksResponse> {
    const params = new HttpParams().set('query', query);
    return this.http.get<GetTasksResponse>(`${this.apiBaseUrl}/api/tasks/search`, { params });
  }

  /**
   * Create a new task via POST /api/tasks
   */
  createTask(payload: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(`${this.apiBaseUrl}/api/tasks`, payload);
  }
}
