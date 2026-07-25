/**
 * Sprint 3 — Project model
 * Maps to the existing MongoDB Atlas `projects` collection in `task_management_system`.
 * Defines the Mongoose schema used by the Project API.
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: Number,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: [1, 'name is required']
    },
    description: {
      type: String,
      default: null
    },
    startDate: {
      type: Date,
      required: [true, 'startDate is required']
    },
    endDate: {
      type: Date,
      default: null
    },
    dateCreated: {
      type: Date,
      required: true
    },
    dateModified: {
      type: Date,
      required: true
    }
  },
  {
    collection: 'projects',
    versionKey: false
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
