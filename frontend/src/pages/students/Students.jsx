import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  // Define options for dropdowns
  const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (classFilter) params.class = classFilter;
        if (sectionFilter) params.section = sectionFilter;

        const response = await api.get('/students', { params });
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        alert('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classFilter, sectionFilter]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header-row">
        <h2>Students</h2>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Link to="/students/add" className="btn btn-primary">
            Add Student
          </Link>
        )}
      </div>

      <div className="card search-container">
        <div className="search-row">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          {(user.role === 'teacher' || user.role === 'admin') && (
            <>
              <select
                className="filter-select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
              
              <select
                className="filter-select"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card">
          <p>No students found.</p>
        </div>
      ) : (
        <ul className="student-list">
          {filteredStudents.map((student) => (
            <li key={student._id} className="student-card">
              <h3>{student.name}</h3>
              <p>Class {student.class} - Section {student.section}</p>
              <p>Roll Number: {student.rollNumber}</p>
              <div className="attendance-info">
                <p>Attendance: {student.attendance.total > 0
                  ? Math.round((student.attendance.present / student.attendance.total) * 100)
                  : 0}%</p>
              </div>
              <Link to={`/students/${student._id}`} className="btn btn-outline">
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Students;