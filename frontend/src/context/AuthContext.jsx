import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

// Demo users for testing without backend
const demoUsers = {
  parent: {
    _id: 'user1',
    name: 'John Parent',
    email: 'parent@example.com',
    role: 'parent',
    phone: '555-0300'
  },
  teacher: {
    _id: 'user2',
    name: 'Mary Teacher',
    email: 'teacher@example.com',
    role: 'teacher',
    phone: '555-0200'
  },
  admin: {
    _id: 'user3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '555-0100'
  }
};

// Create auth context
const AuthContext = createContext(null);

// Helper to standardize user object
const standardizeUser = (userData) => {
  if (!userData) return null;
  
  // Create a copy to avoid mutating the original
  const user = { ...userData };
  
  // Ensure ID field standardization
  if (user.id && !user._id) {
    user._id = user.id;
  } else if (user._id && !user.id) {
    user.id = user._id;
  }
  
  return user;
};

// Create a separate component for protected routes
// This avoids using navigation hooks at the provider level
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState(null);

  // Check for stored authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Get user data from localStorage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (userData && Object.keys(userData).length > 0) {
            // Standardize user object
            const standardizedUser = standardizeUser(userData);
            
            // Set auth headers for API requests
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            
            setUser(standardizedUser);
            setToken(storedToken);
            
            // For demo tokens, don't set up token refresh
            if (!storedToken.startsWith('demo-token-')) {
              // Set up token refresh interval if not demo
              setupTokenRefresh(storedToken);
            }
          } else {
            // No valid user data found
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          clearAuthData();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Cleanup function to clear intervals
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  // Setup token refresh interval
  const setupTokenRefresh = (currentToken) => {
    // Clear any existing interval
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
    
    // For demo mode, don't set up refresh
    if (currentToken.startsWith('demo-token-')) {
      return;
    }
    
    try {
      // Decode token to get expiry
      const tokenData = parseJwt(currentToken);
      if (tokenData && tokenData.exp) {
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        setTokenExpiryTime(expiryTime);
        
        // Set up interval to refresh token 5 minutes before expiry
        const timeToRefresh = expiryTime - Date.now() - (5 * 60 * 1000);
        
        if (timeToRefresh > 0) {
          const interval = setInterval(() => {
            // Refresh token logic would go here
            // This is just a placeholder since we don't have a refresh endpoint
            console.log('Token refresh would happen here');
            
            // For now, simply warn user about expiring session
            if (Date.now() >= expiryTime - (5 * 60 * 1000)) {
              toast.warning('Your session will expire soon. Please save your work.');
            }
          }, Math.min(timeToRefresh, 30 * 60 * 1000)); // Check at most every 30 minutes
          
          setTokenRefreshInterval(interval);
        } else {
          // Token is already expired or about to expire
          clearAuthData();
          toast.error('Your session has expired. Please log in again.');
        }
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  };

  // Helper to parse JWT without external libraries
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  // Helper to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setTokenExpiryTime(null);
    
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      setTokenRefreshInterval(null);
    }
  };

  const login = async (email, password) => {
    try {
      // Handle demo accounts
      if (Object.values(demoUsers).some(user => user.email === email) && password === 'password') {
        let demoUser;
        let demoToken;
        
        if (email === demoUsers.parent.email) {
          demoUser = demoUsers.parent;
          demoToken = 'demo-token-parent';
        } else if (email === demoUsers.teacher.email) {
          demoUser = demoUsers.teacher;
          demoToken = 'demo-token-teacher';
        } else {
          demoUser = demoUsers.admin;
          demoToken = 'demo-token-admin';
        }
        
        // Store auth data
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        // Set API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
        
        setUser(demoUser);
        setToken(demoToken);
        
        toast.success(`Welcome, ${demoUser.name}!`);
        return true;
      }
      
      // Regular API login
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Standardize user data
      const standardizedUser = standardizeUser(userData);
      
      // Store auth data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(standardizedUser));
      
      // Set API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Set up token refresh
      setupTokenRefresh(newToken);
      
      setToken(newToken);
      setUser(standardizedUser);
      
      toast.success(`Welcome, ${standardizedUser.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Show user-friendly error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response) {
        toast.error('Invalid credentials. Please try again.');
      } else {
        toast.error('Login failed. Please check your connection.');
      }
      
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Validate fields
      if (!userData.name || !userData.email || !userData.password || !userData.phone) {
        toast.error('All fields are required');
        return false;
      }
      
      if (userData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      if (!newToken || !newUser) {
        throw new Error('Invalid response from server');
      }
      
      // Standardize user data
      const standardizedUser = standardizeUser(newUser);
      
      // Store auth data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(standardizedUser));
      
      // Set API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Set up token refresh
      setupTokenRefresh(newToken);
      
      setToken(newToken);
      setUser(standardizedUser);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show user-friendly error message
      if (error.response?.status === 409) {
        toast.error('Email already exists. Please use another email or login.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      
      return false;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a route guard component that uses navigate
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;