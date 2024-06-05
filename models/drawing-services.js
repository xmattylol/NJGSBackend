
import Drawing from './drawing.js';

const addDrawing = async (drawingData) => {
  const drawing = new Drawing(drawingData);
  return drawing.save();
};

const getDrawings = async (userId, pdfUrl) => {
  return Drawing.find({ userId, pdfUrl });
};

const updateDrawing = async (userId, pdfUrl, pageNumber, drawing) => {
  return Drawing.findOneAndUpdate(
    { userId, pdfUrl, pageNumber },
    { drawing },
    { new: true, upsert: true }
  );
};

export default { addDrawing, getDrawings, updateDrawing };
