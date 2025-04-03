import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState([]);
  const [editingAttendance, setEditingAttendance] = useState(false);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/students/${id}`);
        setStudent(response.data);
        setAttendance({
          present: response.data.attendance.present,
          absent: response.data.attendance.absent,
        });
      } catch (error) {
        console.error('Error fetching student details:', error);
        alert('Unable to load student details');
      } finally {
        setLoading(false);
      }
    };

    const fetchHomework = async () => {
      try {
        if (student) {
          const response = await api.get('/homework', {
            params: { class: student.class, section: student.section },
          });
          setHomework(response.data);
        }
      } catch (error) {
        console.error('Error fetching homework:', error);
      }
    };

    fetchStudent();
    if (student) {
      fetchHomework();
    }
  }, [id, student?.class, student?.section]);

  const handleAttendanceSubmit = async () => {
    try {
      const response = await api.put(`/students/${id}/attendance`, attendance);
      setStudent({
        ...student,
        attendance: response.data.attendance,
      });
      setEditingAttendance(false);
      alert('Attendance updated successfully');
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const attendancePercentage =
    student?.attendance?.total > 0
      ? Math.round((student.attendance.present / student.attendance.total) * 100)
      : 0;

  return (
    <div className="container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="header-row">
            <button onClick={() => navigate('/students')} className="btn btn-outline">
              Back to Students
            </button>
            <h2>{student.name}</h2>
            <span>Class {student.class}</span>
            <span>Section {student.section}</span>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <button
                onClick={() => setEditingAttendance(true)}
                className="btn btn-primary"
              >
                Update Attendance
              </button>
            )}
          </div>

          <div className="student-details">
            <div className="student-card">
              <h3>Attendance Overview</h3>
              <p>Present: {student.attendance.present} days</p>
              <p>Absent: {student.attendance.absent} days</p>
              <p>Total: {student.attendance.total} days</p>
              <p>Attendance Percentage: {attendancePercentage}%</p>
            </div>

            <div className="homework-list">
              <h3>Recent Homework</h3>
              {homework.length === 0 ? (
                <p>No homework assigned yet</p>
              ) : (
                <ul>
                  {homework.map((hw) => (
                    <li key={hw._id}>
                      <h4>{hw.title}</h4>
                      <p>{hw.description}</p>
                      <p>Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {editingAttendance && (
            <div className="modal">
              <h3>Update Attendance</h3>
              <label>
                Present Days:
                <input
                  type="number"
                  value={attendance.present}
                  onChange={(e) =>
                    setAttendance({ ...attendance, present: e.target.value })
                  }
                />
              </label>
              <label>
                Absent Days:
                <input
                  type="number"
                  value={attendance.absent}
                  onChange={(e) =>
                    setAttendance({ ...attendance, absent: e.target.value })
                  }
                />
              </label>
              <button onClick={handleAttendanceSubmit} className="btn btn-primary">
                Save
              </button>
              <button
                onClick={() => setEditingAttendance(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentDetail;