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

module.exports = {
  getProjects
};
