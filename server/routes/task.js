/**
 * Sprint 1 — Task routes
 * Mounted at /api/tasks in app.js (same /api/... pattern as the health check).
 */
const express = require('express');
const taskController = require('../controllers/task');

const router = express.Router();

// Create Task API — POST /api/tasks
router.post('/', taskController.createTask);

module.exports = router;
