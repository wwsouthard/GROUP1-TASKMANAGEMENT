# GROUP1-TASKMANAGEMENT

Task Management App built for WEB450 (MEAN stack).

## Contributors

- Daniella Bertoldi
- Dustin Craven
- Will Southard

## Overview

Sprint 1 covers **create**, **list**, and **read** for tasks. The Angular client talks to an Express API that persists to the existing MongoDB Atlas `task_management_system` database (`tasks` collection).

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

From the list, tasks with a numeric `taskId` link to `/tasks/:taskId`. Details pages include **Back to tasks**. After a successful create, the app navigates to the task list.

## Angular components

### `AppComponent` (`client/src/app/app.component.*`)

Root shell. Renders the brand, primary navigation, and `<router-outlet>` for feature pages.

### `TaskListComponent` (`client/src/app/task-list/`)

- **Route:** `/tasks` (also the default redirect from `/`)
- **How it works:** On init, calls `TaskService.getTasks()` → `GET /api/tasks`. Shows loading, empty, error, or a table of tasks.
- **Navigation:** “Create Task” goes to the create form. Title / **View** open details when `taskId` is present; otherwise the row shows **No ID** (details lookup requires `taskId`).

### `TaskCreateComponent` (`client/src/app/task-create/`)

- **Route:** `/tasks/create`
- **How it works:** Reactive form for title, description, status, priority, due date, and `projectId`. Submits via `TaskService.createTask()` → `POST /api/tasks`. Shows API validation/conflict errors. On success, navigates to `/tasks`.

### `TaskDetailsComponent` (`client/src/app/task-details/`)

- **Route:** `/tasks/:taskId`
- **How it works:** Reads `taskId` from the route, calls `TaskService.getTaskById()` → `GET /api/tasks/:taskId`, and displays title, description, status, priority, due date, and ID. Includes a back link to the list.

### Shared client pieces

- **`TaskService`** — HTTP wrapper for list, get-by-id, and create.
- **`models/task.ts`** — TypeScript types and status/priority enums aligned with the API/Atlas schema.
- **`environment.ts`** — `apiBaseUrl` (default `http://localhost:3000`).

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | List all tasks (newest `dateModified` first) |
| `GET` | `/api/tasks/:taskId` | Read one task by numeric `taskId` |
| `POST` | `/api/tasks` | Create a task |

### Task fields

`taskId` (optional number), `title` (required, unique), `description`, `status` (`Pending` \| `In Progress` \| `Completed`), `priority` (`Low` \| `Medium` \| `High`), `dueDate`, `dateCreated`, `dateModified`, `projectId` (required integer).

Server layout: `routes/task.js` → `controllers/task.js` → `services/task.js` → `models/task.js`.

## Project structure (high level)

```
client/src/app/
  app.component.*          # shell + nav
  app.routes.ts            # /tasks, /tasks/create, /tasks/:taskId
  models/task.ts
  services/task.service.ts
  task-list/
  task-create/
  task-details/
server/
  app.js / server.js
  config/db.js
  routes/ / controllers/ / services/ / models/
  tests/
```
