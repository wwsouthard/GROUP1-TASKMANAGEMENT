import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetProjectByIdResponse } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /** * Get a project by it's projectId via GET /api/projects/:projectId */
  getProjectById(projectId: number): Observable<GetProjectByIdResponse> {
    return this.http.get<GetProjectByIdResponse>(`${this.apiBaseUrl}/api/projects/${projectId}`);
  }
}
