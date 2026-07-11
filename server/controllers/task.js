/**
 * Sprint 1 — Task controller
 * Handles HTTP for create-task: calls the service and returns standard JSON responses.
 * Does not expose stack traces or raw database errors to the client.
 */
const taskService = require('../services/task');

/**
 * POST /api/tasks
 * Success: 201 { message, task }
 * Client errors: 400 / 409 { message }
 * Server errors: 500 { message }
 */
async function createTask(req, res) {
  try {
    // Delegate business rules and persistence to the service layer
    const task = await taskService.createTask(req.body);

    // Repository-style success response: message plus created resource
    return res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    // Known client errors from the service (validation or duplicate title)
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    // Log server-side detail only; return a generic message to the client
    console.error('Error creating task:', error.message);

    return res.status(500).json({
      message: 'Unable to create task'
    });
  }
}

module.exports = {
  createTask
};
