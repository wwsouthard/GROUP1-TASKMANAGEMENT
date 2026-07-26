import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateProjectRequest, CreateProjectResponse } from '../models/project';

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
}
