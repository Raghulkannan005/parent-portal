import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${user.id}`);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || ''
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [user.id]);

  const validateProfileForm = () => {
    const errors = {};
    if (formData.name.length < 2) errors.name = 'Name must have at least 2 letters';
    if (!/^\S+@\S+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Phone must be 10 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    if (passwordData.currentPassword.length < 6) {
      errors.currentPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Passwords did not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, formData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    setChangingPassword(true);
    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      alert('Password changed successfully');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container">
      <h2 className="page-title">My Profile</h2>
      
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.name?.charAt(0)}
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-role">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </div>
        
        <div className="profile-main">
          <div className="card">
            {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
            
            <div className="card-header">
              <h3>Account Details</h3>
            </div>
            
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className={`form-input ${formErrors.phone ? 'error' : ''}`}
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="card mt-4">
            <div className="card-header">
              <h3>Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                  placeholder="Enter your current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordErrors.currentPassword && <div className="error-message">{passwordErrors.currentPassword}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                  placeholder="Enter your new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordErrors.newPassword && <div className="error-message">{passwordErrors.newPassword}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordErrors.confirmPassword && <div className="error-message">{passwordErrors.confirmPassword}</div>}
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;