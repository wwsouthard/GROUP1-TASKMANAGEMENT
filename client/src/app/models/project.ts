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

/** Standard success response from the Get Project By Id API */
export interface GetProjectByIdResponse {
  message: string;
  project: Project | null;
}
