/**
 * Sprint 1 — Task controller
 * Handles HTTP for create-task: calls the service and returns standard JSON responses.
 * Does not expose stack traces or raw database errors to the client.
 */
const taskService = require('../services/task');

/**
 * GET /api/tasks
 * Success: 200 { message, tasks }
 * Server errors: 500 { message }
 */
async function getTasks(req, res) {
  try {
    const tasks = await taskService.listTasks();

    return res.status(200).json({
      message: 'Tasks retrieved successfully',
      tasks
    });
  } catch (error) {
    console.error('Error retrieving tasks:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve tasks'
    });
  }
}

/** * GET /api/tasks/:taskId * Success: 200 { message, task } * Server errors: 500 { message } */
async function getTaskById(req, res) {
  try {
    const taskId = Number(req.params.taskId);

    if(Number.isNaN(taskId)) {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }

    const task = await taskService.getTask(taskId);
    
    return res.status(200).json({
      message: 'Task retrieved successfully', task
    });
  } catch (error) {
      console.error('Error retrieving task:', error.message);
      return res.status(500).json({
        message: 'Unable to retrieve task'
      });
    }
  }

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
  createTask,
  getTaskById,
  getTasks
};
