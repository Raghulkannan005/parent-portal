import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

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
    parentId: user?.role === 'parent' ? user?._id : '',
  });
  
  // Define options for dropdowns
  const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    // Ensure parentId is set if user is a parent
    if (user?.role === 'parent' && user?._id) {
      setFormData(prev => ({
        ...prev,
        parentId: user._id
      }));
    }
    
    // Fetch parents if user is teacher or admin
    if (user?.role === 'teacher' || user?.role === 'admin') {
      const fetchParents = async () => {
        try {
          const response = await api.get('/users/available');
          const parentUsers = response.data.filter(u => u.role === 'parent');
          setParents(parentUsers);
        } catch (error) {
          console.error('Error fetching parents:', error);
          toast.error('Could not load parents');
        }
      };

      fetchParents();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.rollNumber || !formData.class || 
        !formData.section || !formData.parentId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/students', formData);
      toast.success('Student added successfully');
      navigate(`/students/${response.data._id}`);
    } catch (error) {
      console.error('Error adding student:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to add student');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter roll number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <div className="form-group">
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                Parent
              </label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                className="form-select"
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
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;