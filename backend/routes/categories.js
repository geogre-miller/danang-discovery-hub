const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET /api/categories/:id - Get specific category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// GET /api/categories/search/:name - Find category by name (fuzzy matching)
router.get('/search/:name', async (req, res) => {
  try {
    const category = await Category.findByNameFuzzy(req.params.name);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error searching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching category',
      error: error.message
    });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      pinConfig,
      keywords,
      sortOrder,
      parentCategory
    } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Name and display name are required'
      });
    }

    // Check if category with this name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name,
      displayName,
      description,
      pinConfig: {
        icon: pinConfig?.icon || '📍',
        color: pinConfig?.color || '#e74c3c',
        svgIcon: pinConfig?.svgIcon,
        size: pinConfig?.size || { width: 32, height: 40 }
      },
      keywords: keywords || [],
      sortOrder: sortOrder || 0,
      parentCategory: parentCategory || null
    });

    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete category (soft delete by setting isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deactivated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// GET /api/categories/pin-config/:name - Get pin configuration for a category name
router.get('/pin-config/:name', async (req, res) => {
  try {
    const category = await Category.findByNameFuzzy(req.params.name);
    
    if (!category) {
      // Return default pin config if category not found
      const defaultCategory = await Category.getDefault();
      if (defaultCategory) {
        return res.json({
          success: true,
          data: defaultCategory.getPinConfig()
        });
      }
      
      return res.json({
        success: true,
        data: {
          icon: '📍',
          color: '#e74c3c',
          size: { width: 32, height: 40 }
        }
      });
    }
    
    res.json({
      success: true,
      data: category.getPinConfig()
    });
  } catch (error) {
    console.error('Error getting pin config:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting pin configuration',
      error: error.message
    });
  }
});

module.exports = router;
