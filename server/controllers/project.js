const projectService = require('../services/project');

/**
 * POST /api/projects
 * Success: 201 { message, project }
 * Client errors: 400 / 409 { message }
 * Server errors: 500 { message }
 */
async function createProject(req, res) {
  try {
    const project = await projectService.createProject(req.body);

    return res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    console.error('Error creating project:', error.message);

    return res.status(500).json({
      message: 'Unable to create project'
    });
  }
}

module.exports = { createProject };
