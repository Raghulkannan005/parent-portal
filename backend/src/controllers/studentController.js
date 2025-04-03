import { 
  getStudentsByParentId, 
  getStudentById, 
  addStudent, 
  updateStudentAttendance,
  getStudentsByClassAndSection
} from "../services/studentService.js";

export const getStudents = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    if (role === 'parent') {
      const students = await getStudentsByParentId(userId);
      return res.status(200).json(students);
    } else if (role === 'teacher' || role === 'admin') {
      const { class: className, section, parentId } = req.query;
      
      if (className && section) {
        const students = await getStudentsByClassAndSection(className, section);
        return res.status(200).json(students);
      }
      
      const students = await getStudentsByParentId(parentId || null);
      return res.status(200).json(students);
    }
    
    return res.status(403).json({ error: "Unauthorized access" });
  } catch (error) {
    console.error("Error in getStudents:", error);
    return res.status(500).json({ 
      error: "Server error", 
      message: error.message 
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await getStudentById(id);
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    if (req.user.role === 'parent' && student.parentId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    return res.status(200).json(student);
  } catch (error) {
    console.error("Error in getStudent:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const uploadStudentDetail = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const studentData = req.body;
    const result = await addStudent(studentData);
    
    if (!result) {
      return res.status(400).json({ error: "Failed to add student" });
    }
    
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error in uploadStudentDetail:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const { id } = req.params;
    const attendanceData = req.body;
    
    const result = await updateStudentAttendance(id, attendanceData);
    
    if (!result) {
      return res.status(404).json({ error: "Failed to update attendance" });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    return res.status(500).json({ error: "Server error" });
  }
};