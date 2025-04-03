import { getHomeworkByClass, addHomework } from "../services/homeworkService.js";

export const getHomework = async (req, res) => {
  try {
    const { class: className, section } = req.query;
    
    if (!className || !section) {
      return res.status(400).json({ error: "Class and section are required" });
    }
    
    const homework = await getHomeworkByClass(className, section);
    return res.status(200).json(homework);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const sendHomework = async (req, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const homeworkData = {
      ...req.body,
      uploadedBy: req.user.userId
    };
    
    const result = await addHomework(homeworkData);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};