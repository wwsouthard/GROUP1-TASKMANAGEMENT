/**
 * Task service
 * Contains create/update business rules: required-field checks, enum validation,
 * unique title enforcement, and persistence via the Task model.
 */
const Task = require('../models/task');
const { VALID_STATUSES, VALID_PRIORITIES } = require('../models/task');

/**
 * Sprint 2 - Task Creation Upgrade
 * Uses the new counter schema to generate taskId on the server to prevent duplicate values from being used
 */
const Counter = require('../models/counter');

// Function to generate the next taskId in the counter
async function getNextTaskId() {
  const counter = await Counter.findByIdAndUpdate(
    'taskId',
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  return counter.sequence;
}

// Build a 400-style error the controller can map to a client response
function buildValidationError(message) {
  const error = new Error(message);
  error.name = 'TaskValidationError';
  error.statusCode = 400;
  return error;
}

// Build a 409-style error for duplicate titles
function buildConflictError(message) {
  const error = new Error(message);
  error.name = 'TaskConflictError';
  error.statusCode = 409;
  return error;
}

// Build a 404-style error when a taskId does not match any document
function buildNotFoundError(message) {
  const error = new Error(message);
  error.name = 'TaskNotFoundError';
  error.statusCode = 404;
  return error;
}

/**
 * Validate create-task payload before any database write.
 * Required: title, status, priority, projectId (projectId required by Atlas schema).
 */
function validateCreateTaskInput(payload = {}) {
  const missingFields = [];

  // Collect missing required fields so the client gets one clear message
  if (payload.title === undefined || payload.title === null || String(payload.title).trim() === '') {
    missingFields.push('title');
  }
  if (payload.status === undefined || payload.status === null || payload.status === '') {
    missingFields.push('status');
  }
  if (payload.priority === undefined || payload.priority === null || payload.priority === '') {
    missingFields.push('priority');
  }
  if (payload.projectId === undefined || payload.projectId === null || payload.projectId === '') {
    missingFields.push('projectId');
  }

  if (missingFields.length > 0) {
    throw buildValidationError(`Missing required field(s): ${missingFields.join(', ')}`);
  }

  // Reinforce schema enums at the service layer
  if (!VALID_STATUSES.includes(payload.status)) {
    throw buildValidationError('status must be Pending, In Progress, or Completed');
  }

  if (!VALID_PRIORITIES.includes(payload.priority)) {
    throw buildValidationError('priority must be Low, Medium, or High');
  }

  // Atlas expects projectId as an integer foreign key
  if (typeof payload.projectId !== 'number' || !Number.isInteger(payload.projectId)) {
    throw buildValidationError('projectId must be an integer');
  }
}

/** * Retreive a specific task by it's taskId */
async function getTask(taskId) {
  return await Task.findOne({ taskId });
}

/**
 * Delete a specific task by its taskId
 */
async function deleteTask(taskId) {
  return await Task.findOneAndDelete({ taskId });
}

/**
 * List all task documents.
 * Sorts newest modified tasks first so the list is consistent for the UI.
 */
async function listTasks() {
  return Task.find({}).sort({ dateModified: -1 });
}


/**
 * Search task documents by title, description, status, priority, projectId, or taskId.
 * Empty searches return an empty array so the UI does not accidentally load everything.
 */
async function searchTasks(query = '') {
  const searchTerm = String(query || '').trim();

  if (searchTerm === '') {
    return [];
  }

  // Escape special regex characters so user input is treated as text
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchRegex = new RegExp(escapedSearchTerm, 'i');

  const searchConditions = [
    { title: searchRegex },
    { description: searchRegex },
    { status: searchRegex },
    { priority: searchRegex }
  ];

  const numericSearchTerm = Number(searchTerm);

  if (!Number.isNaN(numericSearchTerm)) {
    searchConditions.push({ projectId: numericSearchTerm });
    searchConditions.push({ taskId: numericSearchTerm });
  }

  return Task.find({ $or: searchConditions }).sort({ dateModified: -1 });
}

/**
 * Create a new task document.
 * Sets dateCreated/dateModified, checks title uniqueness, then saves.
 */
async function createTask(payload) {
  // Fail fast on invalid input (no DB write)
  validateCreateTaskInput(payload);

  const title = String(payload.title).trim();

  // Application-level unique title check (business rule)
  const existingTask = await Task.findOne({ title });

  if (existingTask) {
    throw buildConflictError('A task with this title already exists');
  }

  // Normalize empty optional strings so Mongoose does not attempt invalid Date casts
  const description =
    payload.description === undefined || payload.description === null || payload.description === ''
      ? null
      : payload.description;
  const dueDate =
    payload.dueDate === undefined || payload.dueDate === null || payload.dueDate === ''
      ? null
      : payload.dueDate;

  // Atlas requires dateCreated and dateModified on every task document
  const now = new Date();
  const taskData = {
    taskId: await getNextTaskId(),
    title,
    status: payload.status,
    priority: payload.priority,
    projectId: payload.projectId,
    description,
    dueDate,
    dateCreated: now,
    dateModified: now
  };

  try {
    return await Task.create(taskData);
  } catch (error) {
    // Mongo duplicate-key fallback (title unique index, or taskId sparse unique index)
    if (error && error.code === 11000) {
      if (error.keyPattern && error.keyPattern.taskId) {
        throw buildConflictError('A task with this taskId already exists');
      }
      throw buildConflictError('A task with this title already exists');
    }

    // Convert Mongoose ValidationError / CastError into a client-safe 400 message
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      const firstMessage = Object.values(error.errors || {})
        .map((err) => err.message)
        .filter(Boolean)[0];
      throw buildValidationError(firstMessage || error.message || 'Invalid task data');
    }

    // Unexpected errors bubble to the controller as 500
    throw error;
  }
}

/**
 * Update an existing task document by numeric taskId.
 * Applies only editable fields, refreshes dateModified, and enforces unique title
 * while excluding the task being updated. Does not change _id, taskId, or dateCreated.
 */
async function updateTask(taskId, payload) {
  // Same required-field / enum / projectId rules as create (editable fields only)
  validateCreateTaskInput(payload);

  const task = await Task.findOne({ taskId });

  if (!task) {
    throw buildNotFoundError('Task not found');
  }

  const title = String(payload.title).trim();

  // Unique title among other tasks — allow keeping the same title on this task
  const duplicateTitle = await Task.findOne({ title, taskId: { $ne: taskId } });

  if (duplicateTitle) {
    throw buildConflictError('A task with this title already exists');
  }

  // Normalize empty optional strings so Mongoose does not attempt invalid Date casts
  const description =
    payload.description === undefined || payload.description === null || payload.description === ''
      ? null
      : payload.description;
  const dueDate =
    payload.dueDate === undefined || payload.dueDate === null || payload.dueDate === ''
      ? null
      : payload.dueDate;

  // Assign only editable fields; never overwrite _id, taskId, or dateCreated
  task.title = title;
  task.description = description;
  task.status = payload.status;
  task.priority = payload.priority;
  task.dueDate = dueDate;
  task.projectId = payload.projectId;
  task.dateModified = new Date();

  try {
    // save() runs Mongoose schema validators (required, enum, etc.)
    return await task.save();
  } catch (error) {
    // Mongo duplicate-key fallback (title unique index)
    if (error && error.code === 11000) {
      throw buildConflictError('A task with this title already exists');
    }

    // Convert Mongoose ValidationError / CastError into a client-safe 400 message
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      const firstMessage = Object.values(error.errors || {})
        .map((err) => err.message)
        .filter(Boolean)[0];
      throw buildValidationError(firstMessage || error.message || 'Invalid task data');
    }

    // Unexpected errors bubble to the controller as 500
    throw error;
  }
}

module.exports = {
  createTask,
  getTask,
  listTasks,
  deleteTask,
  searchTasks,
  updateTask,
  validateCreateTaskInput
};
