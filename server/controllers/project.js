/**
 * Sprint 3 — Project controller
 * Handles HTTP for project-related requests.
 */
const projectService = require('../services/project');

/**
 * GET /api/projects
 * Success: 200 { message, projects }
 * Server errors: 500 { message }
 */
async function getProjects(req, res) {
  try {
    const projects = await projectService.listProjects();

    return res.status(200).json({
      message: 'Projects retrieved successfully',
      projects
    });
  } catch (error) {
    console.error('Error retrieving projects:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve projects'
    });
  }
}

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

module.exports = { getProjects, createProject };
