import Homework from "../models/homeworkModel.js";

export const getHomeworkByClass = async (className, section) => {
  const homework = await Homework.find({ class: className, section })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'name');
  return homework;
};

export const addHomework = async (homeworkData) => {
  const { title, description, class: className, section, subject, dueDate, uploadedBy, attachmentUrl } = homeworkData;
  
  const newHomework = new Homework({
    title,
    description,
    class: className,
    section,
    subject,
    dueDate,
    uploadedBy,
    attachmentUrl
  });
  
  await newHomework.save();
  return newHomework;
};