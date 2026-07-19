/**
 * Sprint 1 — Task routes
 * Mounted at /api/tasks in app.js (same /api/... pattern as the health check).
 */
const express = require('express');
const taskController = require('../controllers/task');

const router = express.Router();

// List All Tasks API — GET /api/tasks
router.get('/', taskController.getTasks);

// Search Tasks API — GET /api/tasks/search?query=value
router.get('/search', taskController.searchTasks);

// Read Task By taskId — GET /api/tasks/:taskId
router.get('/:taskId', taskController.getTaskById);

// Create Task API — POST /api/tasks
router.post('/', taskController.createTask);

// Delete Task using its taskId - DELETE /api/tasks/:taskId
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
