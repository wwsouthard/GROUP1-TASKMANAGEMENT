const projectService = require('../services/project');

/**
 * GET /api/project/:projectId
 * Success: 200 { message, task }
 * Server errors: 500 { message }
 */
async function getProjectById(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    if(Number.isNaN(projectId)) {
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

module.exports = { getProjectById };