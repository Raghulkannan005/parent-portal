import Student from "../models/studentModel.js";

export const getStudentsByParentId = async (parentId) => {
  const students = await Student.find({ parentId });
  return students;
};

export const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    return { error: "Student not found" };
  }
  return student;
};

export const addStudent = async (studentData) => {
  const { name, rollNumber, class: className, section, parentId } = studentData;
  
  // Check if student with same roll number exists
  const existingStudent = await Student.findOne({ rollNumber });
  if (existingStudent) {
    return { error: "Student with this roll number already exists" };
  }
  
  const newStudent = new Student({
    name,
    rollNumber,
    class: className,
    section,
    parentId
  });
  
  await newStudent.save();
  return newStudent;
};

export const updateStudentAttendance = async (studentId, attendanceData) => {
  const student = await Student.findById(studentId);
  if (!student) {
    return { error: "Student not found" };
  }
  
  student.attendance = {
    ...student.attendance,
    ...attendanceData,
    total: attendanceData.present + attendanceData.absent
  };
  
  await student.save();
  return student;
};

export const getStudentsByClassAndSection = async (className, section) => {
  if (!className || !section) {
    return { error: "Class and section are required" };
  }
  
  const students = await Student.find({ 
    class: className, 
    section: section 
  });
  
  return students;
};