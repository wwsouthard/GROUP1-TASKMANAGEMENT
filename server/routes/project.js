/**
 * Sprint 3 — Project routes
 * Mounted at /api/projects in app.js.
 */
const express = require('express');
const projectController = require('../controllers/project');

const router = express.Router();

// List All Projects API — GET /api/projects
router.get('/', projectController.getProjects);

// Create Project API — POST /api/projects
router.post('/', projectController.createProject);

// Update Project By projectId — PUT /api/projects/:projectId
router.put('/:projectId', projectController.updateProject);

// Read Project By projectId — GET /api/projects/:projectId
router.get('/:projectId', projectController.getProjectById);

module.exports = router;
