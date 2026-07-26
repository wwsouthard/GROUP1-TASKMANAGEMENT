const express = require('express');
const projectController = require('../controllers/project');

const router = express.Router();

// Read Project By projectId — GET /api/projects/:projectId
router.get('/:projectId', projectController.getProjectById);

module.exports = router;