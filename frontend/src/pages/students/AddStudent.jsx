import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function AddStudent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    class: '',
    section: '',
    parentId: user.role === 'parent' ? user.id : '',
  });
  
  // Define options for dropdowns
  const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (user.role === 'teacher' || user.role === 'admin') {
      const fetchParents = async () => {
        try {
          const response = await api.get('/users/available');
          setParents(response.data.filter((u) => u.role === 'parent'));
        } catch (error) {
          console.error('Error fetching parents:', error);
          alert('Could not load parents');
        }
      };

      fetchParents();
    }
  }, [user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.rollNumber || !formData.class || 
        !formData.section || !formData.parentId) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/students', formData);
      alert('Student added successfully');
      navigate(`/students/${response.data._id}`);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <button onClick={() => navigate('/students')} className="btn btn-outline">
          Back to Students
        </button>
        <h2>Add New Student</h2>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Student Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                id="rollNumber"
                type="text"
                className="form-input"
                placeholder="Roll number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <select
                id="class"
                className="form-select"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="section">Section</label>
              <select
                id="section"
                className="form-select"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
          </div>
          
          {user.role !== 'parent' && (
            <div className="form-group">
              <label htmlFor="parentId">Parent</label>
              <select
                id="parentId"
                className="form-select"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                required
              >
                <option value="">Select Parent</option>
                {parents.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;