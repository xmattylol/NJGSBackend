/*

A failed attempt at adding saving

import mongoose from 'mongoose';

const DrawingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  drawing: { type: String, required: true }, // Store drawing as JSON string
});

const Drawing = mongoose.model('Drawing', DrawingSchema);

export default Drawing;
*/ 

