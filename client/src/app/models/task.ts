/**
 * Sprint 1 — Task domain types.
 * Aligned with the Create Task API contract and Atlas `tasks` collection.
 */

/** Allowed status values for a task */
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

/** Allowed priority values for a task */
export type TaskPriority = 'Low' | 'Medium' | 'High';

/** Task document shape returned by the API */
export interface Task {
  _id?: string;
  taskId: number,
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | Date | null;
  dateCreated?: string | Date;
  dateModified?: string | Date;
  projectId: number;
}

/**
 * Request body for POST /api/tasks
 * Sprint 2 Alteration:
 * taskId removed from ANgular interface as it is now generation on the server
 */
export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: number;
}

/** Standard success response from the List All Tasks API */
export interface GetTasksResponse {
  message: string;
  tasks: Task[];
}

/** Standard success response from the Get Task By Id API */
export interface GetTaskByIdResponse {
  message: string;
  task: Task;
}

/** Standard success response from the Create Task API */
export interface CreateTaskResponse {
  message: string;
  task: Task;
}

/** Standard success response from the Delete Task API */
export interface DeleteTaskResponse {
  message: string;
}

export const TASK_STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
