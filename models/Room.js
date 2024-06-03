import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true }
  },
  floor: { type: Number, required: true },
  occupancy: { type: Boolean, required: false },
  openHours: { type: String, required: false },  // For non-classroom spaces like cafes
  additionalInfo: { type: Map, of: String }  // For any additional data
}, {
  timestamps: true
});

export default RoomSchema; // Export the schema
