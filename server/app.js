const express = require('express');
const cors = require('cors');
// Sprint 1: Create Task route module (POST /api/tasks)
const taskRoutes = require('./routes/task');

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Task Management System API is running'
  });
});

// Sprint 1: mount create-task (and future task) endpoints under /api/tasks
app.use('/api/tasks', taskRoutes);

module.exports = app;
