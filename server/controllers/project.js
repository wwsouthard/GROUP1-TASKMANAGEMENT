/**
 * Sprint 4 — Project controller
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
 * GET /api/projects/search?query=value
 * Success: 200 { message, projects }
 * Server errors: 500 { message }
 */
async function searchProjects(req, res) {
  try {
    const projects = await projectService.searchProjects(req.query.query);

    return res.status(200).json({
      message: 'Projects searched successfully',
      projects
    });
  } catch (error) {
    console.error('Error searching projects:', error.message);

    return res.status(500).json({
      message: 'Unable to search projects'
    });
  }
}

/**
 * GET /api/projects/:projectId
 * Success: 200 { message, project }
 * Client errors: 400 { message }
 * Server errors: 500 { message }
 */
async function getProjectById(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: 'Invalid project ID'
      });
    }

    const project = await projectService.getProject(projectId);

    return res.status(200).json({
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    console.error('Error retrieving project:', error.message);
    return res.status(500).json({
      message: 'Unable to retrieve project'
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

/**
 * PUT /api/projects/:projectId
 * Success: 200 { message, project }
 * Client errors: 400 / 404 / 409 { message }
 * Server errors: 500 { message }
 */
async function updateProject(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: 'Invalid project ID'
      });
    }

    const project = await projectService.updateProject(projectId, req.body);

    return res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    console.error('Error updating project:', error.message);

    return res.status(500).json({
      message: 'Unable to update project'
    });
  }
}

module.exports = { getProjects, searchProjects, getProjectById, createProject, updateProject };
