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
      minlength: [1, 'name is required'],
      unique: true
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

module.exports = mongoose.model('Project', projectSchema);