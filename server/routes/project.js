const express = require('express');
const projectController = require('../controllers/project');

const router = express.Router();

// Create Project API — POST /api/projects
router.post('/', projectController.createProject);

module.exports = router;
