# GROUP1-TASKMANAGEMENT

Task Management App built for WEB450 (MEAN stack).

## Contributors

- Daniella Bertoldi
- Dustin Craven
- Will Southard

## Overview

Sprint 1 covers **create**, **list**, and **read** for tasks. Sprint 2 adds **update**, **delete**, and **search**, plus **server-generated numeric `taskId`** values via a MongoDB counter. The Angular client talks to an Express API that persists to the existing MongoDB Atlas `task_management_system` database (`tasks` collection).

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
npm test
```

## Navigation

The app shell (`AppComponent`) includes a primary nav:

- **Task Management** (brand) → `/tasks` (task list)
- **Tasks** → `/tasks`
- **Create Task** → `/tasks/create`

From the list, tasks with a numeric `taskId` link to `/tasks/:taskId`. Details pages include **Back to tasks**, **Edit Task** (`/tasks/:taskId/edit`), and **Delete Task** (`/tasks/:taskId/delete`) when `taskId` is present. After a successful create or delete, the app navigates to the task list. After a successful update, the app returns to that task’s details page.

Search is available at `/tasks/search` (not linked in the primary nav).

## Angular components

### `AppComponent` (`client/src/app/app.component.*`)

Root shell. Renders the brand, primary navigation, and `<router-outlet>` for feature pages.

### `TaskListComponent` (`client/src/app/task-list/`)

- **Route:** `/tasks` (also the default redirect from `/`)
- **How it works:** On init, calls `TaskService.getTasks()` → `GET /api/tasks`. Shows loading, empty, error, or a table of tasks.
- **Navigation:** “Create Task” goes to the create form. Title / **View** open details when `taskId` is present; otherwise the row shows **No ID** (details, edit, and delete require `taskId`).

### `TaskCreateComponent` (`client/src/app/task-create/`)

- **Route:** `/tasks/create`
- **How it works:** Reactive form for title, description, status, priority, due date, and `projectId`. Submits via `TaskService.createTask()` → `POST /api/tasks`. Does **not** send `taskId` (assigned by the server). Shows API validation/conflict errors. On success, navigates to `/tasks`.

### `TaskDetailsComponent` (`client/src/app/task-details/`)

- **Route:** `/tasks/:taskId`
- **How it works:** Reads `taskId` from the route, calls `TaskService.getTaskById()` → `GET /api/tasks/:taskId`, and displays title, description, status, priority, due date, and ID. Includes a back link to the list, **Edit Task**, and **Delete Task** when the task has loaded with a numeric `taskId`.

### `TaskUpdateComponent` (`client/src/app/task-update/`) — Sprint 2

- **Route:** `/tasks/:taskId/edit`
- **How it works:** Loads the existing task, populates a reactive form with editable fields only (title, description, status, priority, due date, `projectId`). Submits via `TaskService.updateTask()` → `PUT /api/tasks/:taskId`. Does not change `_id`, `taskId`, or `dateCreated`. On success, navigates back to `/tasks/:taskId`.

### `TaskDeleteComponent` (`client/src/app/task-delete/`) — Sprint 2

- **Route:** `/tasks/:taskId/delete`
- **How it works:** Confirmation page with **Yes, Delete Task** and **Cancel**. Confirm calls `TaskService.deleteTask()` → `DELETE /api/tasks/:taskId` and navigates to `/tasks`. Cancel returns to `/tasks/:taskId` without deleting.

### `TaskSearchComponent` (`client/src/app/task-search/`) — Sprint 2

- **Route:** `/tasks/search`
- **How it works:** Search form calls `TaskService.searchTasks(query)` → `GET /api/tasks/search?query=…`. Matches title, description, status, priority, and (when numeric) `taskId` / `projectId`. Empty query returns no results. Includes a link back to the task list.

### Shared client pieces

- **`TaskService`** — HTTP wrapper for list, get-by-id, create, update, delete, and search.
- **`models/task.ts`** — TypeScript types and status/priority enums aligned with the API/Atlas schema (`CreateTaskRequest` / `UpdateTaskRequest` omit client-supplied `taskId`).
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

### Task fields

`taskId` (number, **server-generated** on create via the `counters` collection), `title` (required, unique), `description`, `status` (`Pending` \| `In Progress` \| `Completed`), `priority` (`Low` \| `Medium` \| `High`), `dueDate`, `dateCreated`, `dateModified`, `projectId` (required integer).

Server layout: `routes/task.js` → `controllers/task.js` → `services/task.js` → `models/task.js` (+ `models/counter.js` for `taskId` sequencing).

### Sprint 2 API notes

- **Create:** Assigns the next `taskId` with `Counter` (`$max` against existing task IDs, then `$inc`) so new IDs do not collide with older Atlas fixtures.
- **Update:** Validates editable fields; returns `400` / `404` / `409` as appropriate; refreshes `dateModified` only.
- **Delete:** Returns `200` on success, `404` when missing, `400` for non-numeric `:taskId`.
- **Search:** Registered as `GET /search` **before** `GET /:taskId` so `"search"` is not treated as an ID.

## Sprint 2 summary

| Contributor area | Feature | Client | API |
| --- | --- | --- | --- |
| Student A | Update task | `/tasks/:taskId/edit` | `PUT /api/tasks/:taskId` |
| Student B | Delete task + `taskId` generation | `/tasks/:taskId/delete` | `DELETE /api/tasks/:taskId`; Counter on create |
| Student C | Search tasks | `/tasks/search` | `GET /api/tasks/search?query=` |

## Project structure (high level)

```
client/src/app/
  app.component.*          # shell + nav
  app.routes.ts            # create, search, list, edit, delete, details
  models/task.ts
  services/task.service.ts
  task-list/
  task-create/
  task-details/
  task-update/             # Sprint 2
  task-delete/             # Sprint 2
  task-search/             # Sprint 2
server/
  app.js / server.js
  config/db.js
  routes/ / controllers/ / services/ / models/
  models/counter.js        # Sprint 2 taskId sequence
  tests/
```
