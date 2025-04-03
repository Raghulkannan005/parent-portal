import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function Homework() {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    section: '',
    subject: '',
    dueDate: '',
  });

  const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Social Studies',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Physical Education'
  ];

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      try {
        const response = await api.get('/homework', { 
          params: { 
            class: formData.class || undefined,
            section: formData.section || undefined
          } 
        });
        setHomework(response.data);
      } catch (error) {
        console.error('Error fetching homework:', error);
        alert('Failed to load homework');
      } finally {
        setLoading(false);
      }
    };

    if (formData.class && formData.section) {
      fetchHomework();
    }
  }, [formData.class, formData.section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.class || 
        !formData.section || !formData.subject || !formData.dueDate) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await api.post('/homework', formData);
      setHomework([...homework, response.data]);
      alert('Homework assigned successfully');
      
      // Reset form but keep class and section for convenience
      setFormData({
        title: '',
        description: '',
        class: formData.class,
        section: formData.section,
        subject: '',
        dueDate: '',
      });
    } catch (error) {
      console.error('Error assigning homework:', error);
      alert('Failed to assign homework');
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Homework</h2>
      
      <div className="card">
        <div className="card-header">
          <h3>Find Homework</h3>
        </div>
        
        <div className="search-row">
          <div className="form-group" style={{ marginBottom: '0' }}>
            <select
              className="form-select"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: '0' }}>
            <select
              className="form-select"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {user.role === 'teacher' && (
        <div className="card">
          <div className="card-header">
            <h3>Assign New Homework</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="Homework title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hw-class">Class</label>
                <select
                  id="hw-class"
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
                <label htmlFor="hw-section">Section</label>
                <select
                  id="hw-section"
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
              
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Provide details about the homework"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Assign Homework
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3>Homework List</h3>
        </div>
        
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        ) : homework.length === 0 ? (
          <p>{formData.class && formData.section 
            ? `No homework found for Class ${formData.class} Section ${formData.section}` 
            : 'Please select class and section to view homework'}
          </p>
        ) : (
          <div className="homework-grid">
            {homework.map((hw) => (
              <div key={hw._id} className="card homework-card">
                <div className="homework-header">
                  <h4>{hw.title}</h4>
                  <span className="badge badge-blue">{hw.subject}</span>
                </div>
                <div className="homework-description">
                  <p>{hw.description}</p>
                </div>
                <div className="divider"></div>
                <div className="homework-footer">
                  <div>
                    <small>Class {hw.class}-{hw.section}</small>
                  </div>
                  <div className="date-info">
                    <small>Due: {new Date(hw.dueDate).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homework;