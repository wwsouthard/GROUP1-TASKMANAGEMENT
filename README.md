# GROUP1-TASKMANAGEMENT

Task Management App built for WEB450 (MEAN stack).

## Contributors

- Daniella Bertoldi
- Dustin Craven
- Will Southard

## Overview

Sprint 1 covers **create**, **list**, and **read** for tasks. Sprint 2 adds **update**, **delete**, and **search**, plus **server-generated numeric `taskId`** values via a MongoDB counter. Sprint 3 adds **create**, **list**, and **read** for projects (server-generated numeric `projectId`), with Angular routes for create, list, and details. Sprint 4 completes the project CRUD operations with **update**, **delete**, and **search** for projects.

The Angular client talks to an Express API that persists to the existing MongoDB Atlas `task_management_system` database (`tasks` and `projects` collections).

| Layer | Path | Stack |
| --- | --- | --- |
| Client | `client/` | Angular 18 (standalone components) |
| Server | `server/` | Express 5, Mongoose 9, Jest |

## Running locally

### Server

```bash
cd server
cp .env.example .env   # set MONGO_URI and optional PORT (default 3000)
npm install
npm run dev            # or: npm start
npm test
```

### Client

```bash
cd client
npm install
npm start              # http://localhost:4200 (API base: http://localhost:3000)
npm test               # ChromeHeadless by default
npm run test:firefox   # FirefoxHeadless
npm run build          # production build
```

## Navigation

The app shell (`AppComponent`) includes a primary nav:

- **Task Management** (brand) → `/tasks` (task list)
- **Tasks** → `/tasks`
- **Create Task** → `/tasks/create`
- **Search Tasks** → `/tasks/search`
- **Projects** → `/projects`
- **Create Project** → `/projects/create`
- **Search Projects** → `/projects/search` (Sprint 4)

From the task list, tasks with a numeric `taskId` link to `/tasks/:taskId`. Details pages include **Back to tasks**, **Edit Task** (`/tasks/:taskId/edit`), and **Delete Task** (`/tasks/:taskId/delete`) when `taskId` is present. After a successful create, the app navigates to that task’s details page (`/tasks/:taskId`) and shows the assigned Task ID. After a successful delete, the app navigates to the task list. After a successful update, the app returns to that task’s details page.

From the project list, each project links to `/projects/:projectId`. After a successful project create, the app navigates to `/projects/:projectId` and shows the assigned Project ID. Project details include **Back to projects**, **Edit Project** (`/projects/:projectId/edit`), and **Delete Project** (`/projects/:projectId/delete`) (Sprint 4). After a successful project update, the app returns to that project's details page. After a successful project delete, the app navigates to the project list.

## Angular components

### `AppComponent` (`client/src/app/app.component.*`)

Root shell. Renders the brand, primary navigation, and `<router-outlet>` for feature pages.

### `TaskListComponent` (`client/src/app/task-list/`)

- **Route:** `/tasks` (also the default redirect from `/`)
- **How it works:** On init, calls `TaskService.getTasks()` → `GET /api/tasks`. Shows loading, empty, error, or a table of tasks.
- **Navigation:** “Create Task” goes to the create form. Title / **View** open details when `taskId` is present; otherwise the row shows **No ID** (details, edit, and delete require `taskId`).

### `TaskCreateComponent` (`client/src/app/task-create/`)

- **Route:** `/tasks/create`
- **How it works:** Reactive form for title, description, status, priority, due date, and `projectId`. Submits via `TaskService.createTask()` → `POST /api/tasks`. Does **not** send `taskId` (assigned by the server). Shows the returned Task ID and navigates to `/tasks/:taskId` on success. Shows API validation/conflict errors on failure.

### `TaskDetailsComponent` (`client/src/app/task-details/`)

- **Route:** `/tasks/:taskId`
- **How it works:** Reads `taskId` from the route, calls `TaskService.getTaskById()` → `GET /api/tasks/:taskId`, and displays title, description, status, priority, due date, and ID. Includes a back link to the list, **Edit Task**, and **Delete Task** when the task has loaded with a numeric `taskId`. Direct navigation and browser refresh work for this route.

### `TaskUpdateComponent` (`client/src/app/task-update/`) — Sprint 2

- **Route:** `/tasks/:taskId/edit`
- **How it works:** Loads the existing task, populates a reactive form with editable fields only (title, description, status, priority, due date, `projectId`). Submits via `TaskService.updateTask()` → `PUT /api/tasks/:taskId`. Does not change `_id`, `taskId`, or `dateCreated`. On success, navigates back to `/tasks/:taskId`.

### `TaskDeleteComponent` (`client/src/app/task-delete/`) — Sprint 2

- **Route:** `/tasks/:taskId/delete`
- **How it works:** Confirmation page with **Yes, Delete Task** and **Cancel**. Confirm calls `TaskService.deleteTask()` → `DELETE /api/tasks/:taskId` and navigates to `/tasks`. Cancel returns to `/tasks/:taskId` without deleting.

### `TaskSearchComponent` (`client/src/app/task-search/`) — Sprint 2

- **Route:** `/tasks/search`
- **How it works:** Search form calls `TaskService.searchTasks(query)` → `GET /api/tasks/search?query=…`. Matches title, description, status, priority, and (when numeric) `taskId` / `projectId`. Empty query returns no results. Includes a link back to the task list.

### `ProjectCreateComponent` (`client/src/app/project-create/`) — Sprint 3

- **Route:** `/projects/create`
- **How it works:** Reactive form for name, description, start date, and optional end date (end must be after start when both are set). Submits via `ProjectService.createProject()` → `POST /api/projects`. Does **not** send `projectId` (assigned by the server). Shows the returned Project ID and navigates to `/projects/:projectId` on success.

### `ProjectListComponent` (`client/src/app/project-list/`) — Sprint 3

- **Route:** `/projects`
- **How it works:** On init, calls `ProjectService.getProjects()` → `GET /api/projects`. Shows loading, empty, error, or a table of projects (project ID, name, description, start/end dates). Project name / ID link to `/projects/:projectId`.

### `ProjectDetailsComponent` (`client/src/app/project-details/`) — Sprint 3

- **Route:** `/projects/:projectId`
- **How it works:** Reads `projectId` from the route, calls `ProjectService.getProjectById()` → `GET /api/projects/:projectId`, and displays name, description, dates, and Project ID. Missing projects show **Project not found.** Includes **Back to projects**, **Edit Project**, and **Delete Project** (Sprint 4). Direct navigation and browser refresh work for this route.

### `ProjectUpdateComponent` (`client/src/app/project-update/`) — Sprint 4

- **Route:** `/projects/:projectId/edit`
- **How it works:** Loads the existing project, populates a reactive form with editable fields (name, description, start date, end date). Submits via `ProjectService.updateProject()` → `PUT /api/projects/:projectId`. Does not change `_id`, `projectId`, or `dateCreated`. On success, navigates back to `/projects/:projectId`.

### `ProjectDeleteComponent` (`client/src/app/project-delete/`) — Sprint 4

- **Route:** `/projects/:projectId/delete`
- **How it works:** Confirmation page with **Yes, Delete Project** and **Cancel**. Confirm calls `ProjectService.deleteProject()` → `DELETE /api/projects/:projectId` and navigates to `/projects`. Cancel returns to `/projects/:projectId` without deleting.

### `ProjectSearchComponent` (`client/src/app/project-search/`) — Sprint 4

- **Route:** `/projects/search`
- **How it works:** Search form calls `ProjectService.searchProjects(query)` → `GET /api/projects/search?query=…`. Matches name, description, and (when numeric) `projectId`. Empty query returns no results. Includes a link back to the project list.

### Shared client pieces

- **`TaskService`** — HTTP wrapper for list, get-by-id, create, update, delete, and search.
- **`ProjectService`** — HTTP wrapper for list, get-by-id, create, update, delete, and search (Sprint 4 adds update, delete, and search).
- **`models/task.ts`** — TypeScript types and status/priority enums aligned with the API/Atlas schema (`CreateTaskRequest` / `UpdateTaskRequest` omit client-supplied `taskId`).
- **`models/project.ts`** — Project types aligned with the Atlas `projects` collection (`CreateProjectRequest` / `UpdateProjectRequest` omit client-supplied `projectId`).
- **`environment.ts`** — `apiBaseUrl` (default `http://localhost:3000`).

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | List all tasks (newest `dateModified` first) |
| `GET` | `/api/tasks/search?query=` | Search tasks (Sprint 2) |
| `GET` | `/api/tasks/:taskId` | Read one task by numeric `taskId` |
| `POST` | `/api/tasks` | Create a task (server assigns `taskId`) |
| `PUT` | `/api/tasks/:taskId` | Update a task (Sprint 2) |
| `DELETE` | `/api/tasks/:taskId` | Delete a task (Sprint 2) |
| `GET` | `/api/projects` | List all projects (Sprint 3) |
| `GET` | `/api/projects/search?query=` | Search projects (Sprint 4) |
| `POST` | `/api/projects` | Create a project (server assigns `projectId`) (Sprint 3) |
| `GET` | `/api/projects/:projectId` | Read one project by numeric `projectId` (Sprint 3) |
| `PUT` | `/api/projects/:projectId` | Update a project (Sprint 4) |
| `DELETE` | `/api/projects/:projectId` | Delete a project (Sprint 4) |

### Task fields

`taskId` (number, **server-generated** on create via the `counters` collection), `title` (required, unique), `description`, `status` (`Pending` \| `In Progress` \| `Completed`), `priority` (`Low` \| `Medium` \| `High`), `dueDate`, `dateCreated`, `dateModified`, `projectId` (required integer).

Server layout: `routes/task.js` → `controllers/task.js` → `services/task.js` → `models/task.js` (+ `models/counter.js` for `taskId` sequencing).

### Project fields

`projectId` (number, **server-generated** on create via the `counters` collection), `name` (required, unique), `description`, `startDate` (required), `endDate` (optional), `dateCreated`, `dateModified`.

Server layout: `routes/project.js` → `controllers/project.js` → `services/project.js` → `models/project.js` (+ `models/counter.js` for `projectId` sequencing).

### Sprint 2 API notes

- **Create:** Assigns the next `taskId` with `Counter` (`$max` against existing task IDs, then `$inc`) so new IDs do not collide with older Atlas fixtures.
- **Update:** Validates editable fields; returns `400` / `404` / `409` as appropriate; refreshes `dateModified` only.
- **Delete:** Returns `200` on success, `404` when missing, `400` for non-numeric `:taskId`.
- **Search:** Registered as `GET /search` **before** `GET /:taskId` so `"search"` is not treated as an ID.

### Sprint 3 API notes

- **Create project:** Assigns the next `projectId` with `Counter`; validates required `name` / `startDate` and end-after-start; returns `201` with the created project.
- **List projects:** Returns `200` with `{ message, projects }`.
- **Read project:** Returns `200` with `{ message, project }` where `project` may be `null` when not found; invalid `:projectId` returns `400`. Route order mounts `GET /` and `POST /` before `GET /:projectId`.

### Sprint 4 API notes

- **Update project:** Validates editable fields; returns `400` / `404` / `409` as appropriate; refreshes `dateModified` only; does not change `_id`, `projectId`, or `dateCreated`.
- **Delete project:** Returns `200` on success, `404` when missing, `400` for non-numeric `:projectId`.
- **Search projects:** Registered as `GET /search` **before** `GET /:projectId` so `"search"` is not treated as an ID. Matches name, description, and (when numeric) `projectId`; empty query returns no results.

## Sprint 2 summary

| Contributor area | Feature | Client | API |
| --- | --- | --- | --- |
| Student A | Update task | `/tasks/:taskId/edit` | `PUT /api/tasks/:taskId` |
| Student B | Delete task + `taskId` generation | `/tasks/:taskId/delete` | `DELETE /api/tasks/:taskId`; Counter on create |
| Student C | Search tasks | `/tasks/search` | `GET /api/tasks/search?query=` |

## Sprint 3 summary

| Contributor area | Feature | Client | API |
| --- | --- | --- | --- |
| Student A (Will) | Create project | `/projects/create` | `POST /api/projects` |
| Student B (Dustin) | Read project by ID | `/projects/:projectId` | `GET /api/projects/:projectId` |
| Student C (Daniella) | List all projects | `/projects` | `GET /api/projects` |

Integrated on `dev` with create → list → details navigation, Projects nav links, and create-to-details `projectId` / `taskId` flows.

## Sprint 4 summary

| Contributor area | Feature | Client | API |
| --- | --- | --- | --- |
| Student A (Will) | Update project | `/projects/:projectId/edit` | `PUT /api/projects/:projectId` |
| Student B (Dustin) | Delete project | `/projects/:projectId/delete` | `DELETE /api/projects/:projectId` |
| Student C (Daniella) | Search projects | `/projects/search` | `GET /api/projects/search?query=` |

Integrated on `dev` with full CRUD operations for projects. Project details now include edit and delete links, and the primary nav includes Search Projects.

## Project structure (high level)

```
client/src/app/
  app.component.*          # shell + nav
  app.routes.ts            # projects + tasks routes
  models/task.ts
  models/project.ts        # Sprint 3
  services/task.service.ts
  services/project.service.ts  # Sprint 3
  task-list/
  task-create/
  task-details/
  task-update/             # Sprint 2
  task-delete/             # Sprint 2
  task-search/             # Sprint 2
  project-create/          # Sprint 3
  project-list/            # Sprint 3
  project-details/         # Sprint 3
  project-update/          # Sprint 4
  project-delete/          # Sprint 4
  project-search/          # Sprint 4
server/
  app.js / server.js
  config/db.js
  routes/ / controllers/ / services/ / models/
  routes/project.js        # Sprint 3
  controllers/project.js
  services/project.js
  models/project.js
  models/counter.js        # taskId / projectId sequence
  tests/
```
