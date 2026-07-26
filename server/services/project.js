/**
 * Sprint 3 — Project service
 * Contains project-related database operations.
 */
const Project = require('../models/project');
const Counter = require('../models/counter');

function buildValidationError(message) {
  const error = new Error(message);
  error.name = 'ProjectValidationError';
  error.statusCode = 400;
  return error;
}

function buildConflictError(message) {
  const error = new Error(message);
  error.name = 'ProjectConflictError';
  error.statusCode = 409;
  return error;
}

async function getNextProjectId() {
  let floor = 0;

  try {
    const query = Project.findOne({ projectId: { $type: 'number' } });
    if (query && typeof query.sort === 'function') {
      const maxDoc = await query.sort({ projectId: -1 }).select({ projectId: 1 }).lean();
      if (maxDoc && typeof maxDoc.projectId === 'number') {
        floor = maxDoc.projectId;
      }
    }
  } catch (_) {
    // Fall through with floor 0; Counter increment still proceeds.
  }

  await Counter.findByIdAndUpdate(
    'projectId',
    { $max: { sequence: floor } },
    { upsert: true }
  );

  const counter = await Counter.findByIdAndUpdate(
    'projectId',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return counter.sequence;
}

function validateCreateProjectInput(payload = {}) {
  const missingFields = [];

  if (payload.name === undefined || payload.name === null || String(payload.name).trim() === '') {
    missingFields.push('name');
  }
  if (payload.startDate === undefined || payload.startDate === null || payload.startDate === '') {
    missingFields.push('startDate');
  }

  if (missingFields.length > 0) {
    throw buildValidationError(`Missing required field(s): ${missingFields.join(', ')}`);
  }

  const startDateObj = new Date(payload.startDate);
  if (Number.isNaN(startDateObj.getTime())) {
    throw buildValidationError('startDate must be a valid date');
  }

  if (payload.endDate !== undefined && payload.endDate !== null && payload.endDate !== '') {
    const endDateObj = new Date(payload.endDate);
    if (Number.isNaN(endDateObj.getTime())) {
      throw buildValidationError('endDate must be a valid date');
    }
    if (endDateObj <= startDateObj) {
      throw buildValidationError('endDate must be later than startDate');
    }
  }
}

/**
 * List all project documents.
 * Sorts newest modified projects first so the UI is consistent.
 */
async function listProjects() {
  return Project.find({}).sort({ dateModified: -1 });
}

async function createProject(payload) {
  validateCreateProjectInput(payload);

  const name = String(payload.name).trim();

  const existingProject = await Project.findOne({ name });
  if (existingProject) {
    throw buildConflictError('A project with this name already exists');
  }

  const description =
    payload.description === undefined || payload.description === null || payload.description === ''
      ? null
      : payload.description;

  const endDate =
    payload.endDate === undefined || payload.endDate === null || payload.endDate === ''
      ? null
      : payload.endDate;

  const now = new Date();
  const projectData = {
    projectId: await getNextProjectId(),
    name,
    description,
    startDate: payload.startDate,
    endDate,
    dateCreated: now,
    dateModified: now
  };

  try {
    return await Project.create(projectData);
  } catch (error) {
    if (error && error.code === 11000) {
      throw buildConflictError('A project with this name already exists');
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      const firstMessage = Object.values(error.errors || {})
        .map((err) => err.message)
        .filter(Boolean)[0];
      throw buildValidationError(firstMessage || error.message || 'Invalid project data');
    }

    throw error;
  }
}

module.exports = {
  listProjects,
  createProject,
  validateCreateProjectInput
};
