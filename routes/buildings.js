import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Building from '../models/Building.js';

const router = express.Router();

// Middleware for handling validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Filter buildings by amenities
router.get('/filter', [
  query('amenities').isString().withMessage('Amenities must be a comma-separated string').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const { amenities } = req.query;
    const amenityList = amenities.split(',').map(amenity => amenity.trim());
    const buildings = await Building.find({ amenities: { $all: amenityList } });
    res.json(buildings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all buildings
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get a specific building by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid building ID').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (building) {
      res.json(building);
    } else {
      res.status(404).send('Building not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new building
router.post('/', [
  body('name').isString().withMessage('Name must be a string').trim().escape(),
  body('address').isString().withMessage('Address must be a string').trim().escape(),
  body('amenities').isArray().withMessage('Amenities must be an array'),
  body('amenities.*').isString().withMessage('Each amenity must be a string').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const newBuilding = new Building(req.body);
    await newBuilding.save();
    res.status(201).json(newBuilding);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Update a building by ID
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid building ID').trim().escape(),
  body('name').optional().isString().withMessage('Name must be a string').trim().escape(),
  body('address').optional().isString().withMessage('Address must be a string').trim().escape(),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('amenities.*').optional().isString().withMessage('Each amenity must be a string').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const updatedBuilding = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedBuilding) {
      res.json(updatedBuilding);
    } else {
      res.status(404).send('Building not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a building by ID
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid building ID').trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const deletedBuilding = await Building.findByIdAndDelete(req.params.id);
    if (deletedBuilding) {
      res.json(deletedBuilding);
    } else {
      res.status(404).send('Building not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
