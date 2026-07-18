/**
 * Task routes
 * Mounted at /api/tasks in app.js (same /api/... pattern as the health check).
 */
const express = require('express');
const taskController = require('../controllers/task');

const router = express.Router();

// List All Tasks API — GET /api/tasks
router.get('/', taskController.getTasks);

// Read Task By taskId — GET /api/tasks/:taskId
router.get('/:taskId', taskController.getTaskById);

// Create Task API — POST /api/tasks
router.post('/', taskController.createTask);

// Update Task By taskId — PUT /api/tasks/:taskId
router.put('/:taskId', taskController.updateTask);

module.exports = router;
