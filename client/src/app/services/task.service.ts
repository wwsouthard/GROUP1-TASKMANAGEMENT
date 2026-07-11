/**
 * Sprint 1 — Task API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTaskRequest, CreateTaskResponse } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /**
   * Create a new task via POST /api/tasks
   */
  createTask(payload: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(`${this.apiBaseUrl}/api/tasks`, payload);
  }
}
