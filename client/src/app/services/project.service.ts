/**
 * Sprint 3 — Project API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectByIdResponse,
  GetProjectsResponse,
  DeleteProjectResponse
} from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /** Create a new project via POST /api/projects */
  createProject(payload: CreateProjectRequest): Observable<CreateProjectResponse> {
    return this.http.post<CreateProjectResponse>(`${this.apiBaseUrl}/api/projects`, payload);
  }

  /** List all projects via GET /api/projects */
  getProjects(): Observable<GetProjectsResponse> {
    return this.http.get<GetProjectsResponse>(`${this.apiBaseUrl}/api/projects`);
  }

  /** Get a project by its projectId via GET /api/projects/:projectId */
  getProjectById(projectId: number): Observable<GetProjectByIdResponse> {
    return this.http.get<GetProjectByIdResponse>(`${this.apiBaseUrl}/api/projects/${projectId}`);
  }

  /** Delete a project via DELETE /api/projects/:projectId */
    deleteProject(projectId: number): Observable<DeleteProjectResponse> {
      return this.http.delete<DeleteProjectResponse>(`${this.apiBaseUrl}/api/projects/${projectId}`);
    }
}
