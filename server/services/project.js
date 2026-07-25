/**
 * Sprint 3 — Project service
 * Contains project-related database operations.
 */
const Project = require('../models/project');

/**
 * List all project documents.
 * Sorts newest modified projects first so the UI is consistent.
 */
async function listProjects() {
  return Project.find({}).sort({ dateModified: -1 });
}

module.exports = {
  listProjects
};
