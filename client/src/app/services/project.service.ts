/**
 * Sprint 4 — Project API service.
 * Uses the configured environment apiBaseUrl for all HTTP calls.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectByIdResponse,
  GetProjectsResponse,
  UpdateProjectRequest,
  UpdateProjectResponse
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

  /** Search projects via GET /api/projects/search?query=value */
  searchProjects(query: string): Observable<GetProjectsResponse> {
    const params = new HttpParams().set('query', query);
    return this.http.get<GetProjectsResponse>(`${this.apiBaseUrl}/api/projects/search`, { params });
  }

  /** Get a project by its projectId via GET /api/projects/:projectId */
  getProjectById(projectId: number): Observable<GetProjectByIdResponse> {
    return this.http.get<GetProjectByIdResponse>(`${this.apiBaseUrl}/api/projects/${projectId}`);
  }

  /** Update an existing project via PUT /api/projects/:projectId */
  updateProject(projectId: number, payload: UpdateProjectRequest): Observable<UpdateProjectResponse> {
    return this.http.put<UpdateProjectResponse>(`${this.apiBaseUrl}/api/projects/${projectId}`, payload);
  }
}
