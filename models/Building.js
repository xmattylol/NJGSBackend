import mongoose from 'mongoose';
import FloorSchema from './floor.js'; // Ensure this is the correct path and filename

const BuildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true }
  },
  floors: [FloorSchema],  // Embed Floor documents directly
  amenities: [{ type: String }]  // List of amenities
}, {
  timestamps: true
});

export default mongoose.model('Building', BuildingSchema);
