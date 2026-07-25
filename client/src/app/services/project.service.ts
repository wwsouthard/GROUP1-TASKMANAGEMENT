/**
 * Sprint 3 — Project API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetProjectsResponse } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /**
   * List all projects via GET /api/projects
   */
  getProjects(): Observable<GetProjectsResponse> {
    return this.http.get<GetProjectsResponse>(`${this.apiBaseUrl}/api/projects`);
  }
}
