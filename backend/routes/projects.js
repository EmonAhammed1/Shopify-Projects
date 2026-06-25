const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects (sorted by order)
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📦 GET /api/projects');
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    console.log(`✅ Found ${projects.length} projects`);
    res.json({ projects });
  } catch (err) {
    console.error('❌ Get projects error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:slug
// @desc    Get single project by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    console.log('📦 GET /api/projects/' + req.params.slug);
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('✅ Found project:', project.title);
    res.json({ project });
  } catch (err) {
    console.error('❌ Get project error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('📦 POST /api/projects', req.body.title);
    const project = await Project.create(req.body);
    console.log('✅ Project created:', project.title);
    res.status(201).json({ project });
  } catch (err) {
    console.error('❌ Create project error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists — use a unique slug' });
    }
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('📦 PUT /api/projects/' + req.params.id);
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('✅ Project updated:', project.title);
    res.json({ project });
  } catch (err) {
    console.error('❌ Update project error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('📦 DELETE /api/projects/' + req.params.id);
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log('✅ Project deleted:', project.title);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('❌ Delete project error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
