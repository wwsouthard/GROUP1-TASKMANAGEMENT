/**
 * Sprint 4 — Project routes
 * Mounted at /api/projects in app.js.
 */
const express = require('express');
const projectController = require('../controllers/project');

const router = express.Router();

// List All Projects API — GET /api/projects
router.get('/', projectController.getProjects);

// Search Projects API — GET /api/projects/search?query=value
// This must stay before /:projectId so "search" is not treated as an ID.
router.get('/search', projectController.searchProjects);

// Create Project API — POST /api/projects
router.post('/', projectController.createProject);

// Update Project By projectId — PUT /api/projects/:projectId
router.put('/:projectId', projectController.updateProject);

// Read Project By projectId — GET /api/projects/:projectId
router.get('/:projectId', projectController.getProjectById);

// Delete Project using its projectId - DELETE /api/projects/:projectId
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;
