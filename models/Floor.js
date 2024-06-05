import mongoose from 'mongoose';
import RoomSchema from './room.js'; // Ensure this is the correct path and filename

const FloorSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  rooms: [RoomSchema]  // Embed Room documents directly
}, {
  timestamps: true
});

export default FloorSchema; // Export the schema
