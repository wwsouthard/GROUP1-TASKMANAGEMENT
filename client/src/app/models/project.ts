/** Project document shape returned by the API */
export interface Project {
  _id?: string;
  projectId: number;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  dateCreated?: string | Date;
  dateModified?: string | Date;
}

/** Request body for POST /api/projects (server assigns projectId, dateCreated, dateModified) */
export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
}

/** Standard success response from the Create Project API */
export interface CreateProjectResponse {
  message: string;
  project: Project;
}
