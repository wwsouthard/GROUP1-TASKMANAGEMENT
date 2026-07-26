const Project = require('../models/project');

/** * Retreive a specific project by it's projectId */
async function getProject(projectId) {
  return await Project.findOne({ projectId });
}

module.exports = { getProject };