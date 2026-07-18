/**
 * Sprint 1 — Task model
 * Maps to the existing MongoDB Atlas `tasks` collection in `task_management_system`.
 * Does not recreate the database; only defines the Mongoose schema used by the API.
 */
const mongoose = require('mongoose');

// Allowed values enforced by both the API service and this schema (matches Atlas $jsonSchema enums)
const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema(
  {
    // Updated from Sprint 1 design to now require taskId since it is the field used for task Details and task deletion
    // taskId will be generated on the server automatically when new create task requests are generated
    taskId: {
      type: Number,
      unique: true
    },
    // Required, unique business key for tasks
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: [1, 'title is required'],
      unique: true
    },
    // Optional task details
    description: {
      type: String,
      default: null
    },
    // Required workflow state
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: VALID_STATUSES,
        message: 'status must be Pending, In Progress, or Completed'
      }
    },
    // Required priority level
    priority: {
      type: String,
      required: [true, 'priority is required'],
      enum: {
        values: VALID_PRIORITIES,
        message: 'priority must be Low, Medium, or High'
      }
    },
    // Optional due date
    dueDate: {
      type: Date,
      default: null
    },
    // Required by Atlas validator — set by the create-task service on insert
    dateCreated: {
      type: Date,
      required: true
    },
    // Required by Atlas validator — set by the create-task service on insert
    dateModified: {
      type: Date,
      required: true
    },
    // Required foreign key to projects.projectId (integer, not ObjectId)
    projectId: {
      type: Number,
      required: [true, 'projectId is required']
    }
  },
  {
    // Use the existing Atlas collection name; omit Mongoose __v
    collection: 'tasks',
    versionKey: false
  }
);

// Compile and export the model used by services/controllers
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
// Re-export enum lists so the service can validate without duplicating constants
module.exports.VALID_STATUSES = VALID_STATUSES;
module.exports.VALID_PRIORITIES = VALID_PRIORITIES;
