require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Project = require('./models/Project');
const Task = require('./models/Task');

const app = express();

// Configure CORS with allowed origins
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'https://taskflowkj.netlify.app',  // Your Netlify domain
  'https://taskflow-v4pt.onrender.com'  // Your Render backend domain
];

// Add a simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: ['/api/projects', '/api/tasks']
  });
});

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS check for origin:', origin);
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Remove trailing slashes for comparison
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    console.error(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

app.use(express.json());

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Add connection event handlers
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Project routes
app.post('/api/projects', async (req, res) => {
  try {
    const existing = await Project.findOne({ name: req.body.name });
    if (existing) {
      return res.status(409).json({ error: 'Project name already exists.' });
    }
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    console.log('Fetching projects...');
    const projects = await Project.find();
    console.log(`Found ${projects.length} projects`);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Task routes
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const { projectId, status, search } = req.query;
    let query = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };
    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
