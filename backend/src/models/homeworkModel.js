import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachmentUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Homework = mongoose.model('Homework', homeworkSchema);

export default Homework;