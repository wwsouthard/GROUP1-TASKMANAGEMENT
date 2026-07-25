/**
 * Sprint 3 — Project domain types.
 * Aligned with the Atlas `projects` collection.
 */

/** Project document shape returned by the API */
export interface Project {
  _id?: string;
  projectId?: number | null;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  dateCreated?: string | Date;
  dateModified?: string | Date;
}

/** Standard success response from the List All Projects API */
export interface GetProjectsResponse {
  message: string;
  projects: Project[];
}
