import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: '/api',
  headers: {'Content-Type': 'application/json'},
  timeout: 15000, // Increase timeout to 15 seconds
});

// Flag to prevent multiple error toasts
let isAuthErrorDisplayed = false;

// Mock data for demo accounts
const mockData = {
  messages: [
    {
      _id: 'msg1',
      sender: { _id: 'user2', name: 'Mary Teacher', role: 'teacher' },
      receiver: { _id: 'user1', name: 'John Parent', role: 'parent' },
      content: 'Hello! This is about your child\'s progress in Math class.',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'msg2',
      sender: { _id: 'user1', name: 'John Parent', role: 'parent' },
      receiver: { _id: 'user2', name: 'Mary Teacher', role: 'teacher' },
      content: 'Thank you for letting me know. Can we discuss further?',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ],
  homework: [
    {
      _id: 'hw1',
      title: 'Math Assignment',
      description: 'Complete problems 1-20 from Chapter 5',
      class: '10',
      section: 'A',
      subject: 'Mathematics',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      uploadedBy: { _id: 'user2', name: 'Mary Teacher' }
    },
    {
      _id: 'hw2',
      title: 'Science Project',
      description: 'Prepare a presentation on renewable energy',
      class: '10',
      section: 'A',
      subject: 'Science',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      uploadedBy: { _id: 'user2', name: 'Mary Teacher' }
    }
  ],
  students: [
    {
      _id: 'student1',
      name: 'Alex Smith',
      rollNumber: '101',
      class: '10',
      section: 'A',
      attendance: { present: 42, absent: 3, total: 45 }
    },
    {
      _id: 'student2',
      name: 'Emma Smith',
      rollNumber: '102',
      class: '8',
      section: 'B',
      attendance: { present: 40, absent: 5, total: 45 }
    }
  ],
  users: [
    { _id: 'user1', name: 'John Parent', role: 'parent', email: 'parent@example.com' },
    { _id: 'user2', name: 'Mary Teacher', role: 'teacher', email: 'teacher@example.com' },
    { _id: 'user3', name: 'Admin User', role: 'admin', email: 'admin@example.com' }
  ]
};

// Helper to handle demo POST requests
const handleDemoPost = (url, data) => {
  if (url.includes('/messages')) {
    // Create a new message for demo mode
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const senderId = userData._id || userData.id || 'user1';
    const receiverId = data.receiverId;
    
    // Find receiver info from our mock data
    let receiver = mockData.users.find(u => u._id === receiverId) || 
                  { _id: receiverId, name: 'Unknown User', role: 'user' };
    
    // Create the new message with proper ID format
    const newMessage = {
      _id: `msg${Date.now()}`,
      sender: { 
        _id: senderId,
        name: userData.name || 'Demo User',
        role: userData.role || 'user'
      },
      receiver: receiver,
      content: data.content,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock data
    mockData.messages.push(newMessage);
    
    return { data: newMessage };
  } else if (url.includes('/homework') && data) {
    // Create new homework for demo mode
    const newHomework = {
      _id: `hw${Date.now()}`,
      title: data.title || 'Demo Homework',
      description: data.description || 'Demo homework description',
      class: data.class || '10',
      section: data.section || 'A',
      subject: data.subject || 'General',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      uploadedBy: JSON.parse(localStorage.getItem('user') || '{}'),
      createdAt: new Date().toISOString()
    };
    
    mockData.homework.push(newHomework);
    return { data: newHomework };
  }
  
  // Default fallback for other POST requests
  return { data: { success: true, message: 'Operation successful in demo mode' } };
};

// Check if a token is a demo token
const isDemoToken = (token) => token && token.startsWith('demo-token-');

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Set special header for demo requests
      if (isDemoToken(token)) {
        config.headers['X-Demo-Request'] = 'true';
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle canceled requests (e.g., component unmounted)
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(error);
    }
    
    // Check if this is a demo token request
    const token = localStorage.getItem('token');
    
    // For demo accounts, handle with mock data
    if (isDemoToken(token)) {
      const url = error.config.url || '';
      const method = error.config.method || '';
      const data = error.config.data ? JSON.parse(error.config.data) : {};
      
      console.log(`Demo mode handling ${method.toUpperCase()} request to ${url}`);
      
      // Handle POST requests specially
      if (method.toLowerCase() === 'post') {
        return Promise.resolve(handleDemoPost(url, data));
      }
      
      // Handle GET requests with mock data based on URL patterns
      if (url.includes('/messages/conversation')) {
        // Filter messages for this conversation
        const params = url.split('/');
        const otherUserId = params[params.length - 1];
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData._id || userData.id;
        
        const filteredMessages = mockData.messages.filter(msg => 
          (msg.sender._id === userId && msg.receiver._id === otherUserId) || 
          (msg.sender._id === otherUserId && msg.receiver._id === userId)
        );
        
        return Promise.resolve({ data: filteredMessages });
      } else if (url.includes('/messages')) {
        return Promise.resolve({ data: mockData.messages });
      } else if (url.includes('/homework')) {
        // Filter homework by class and section if provided in URL
        const urlObj = new URL(url, window.location.origin);
        const className = urlObj.searchParams.get('class');
        const section = urlObj.searchParams.get('section');
        
        if (className && section) {
          const filteredHomework = mockData.homework.filter(hw => 
            hw.class === className && hw.section === section
          );
          return Promise.resolve({ data: filteredHomework });
        }
        return Promise.resolve({ data: mockData.homework });
      } else if (url.includes('/students')) {
        // Handle student detail route
        if (url.match(/\/students\/[^/]+$/)) {
          const studentId = url.split('/').pop();
          const student = mockData.students.find(s => s._id === studentId);
          
          if (student) {
            return Promise.resolve({ data: student });
          }
        }
        return Promise.resolve({ data: mockData.students });
      } else if (url.includes('/users/available')) {
        // Return available users for messaging excluding current user
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
        const availableUsers = mockData.users.filter(u => u._id !== currentUserId);
        return Promise.resolve({ data: availableUsers });
      }
      
      // For other endpoints, return empty success response
      return Promise.resolve({ 
        data: {
          success: true,
          message: "Operation completed in demo mode",
          data: []
        }
      });
    }
    
    // Handle auth errors (token expired/invalid)
    if (error.response && error.response.status === 401) {
      // Prevent redirect loops by checking if already on login page
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginPage && !isAuthErrorDisplayed) {
        isAuthErrorDisplayed = true;
        
        toast.error('Your session has expired. Please log in again.');
        
        // Reset flag after delay
        setTimeout(() => {
          isAuthErrorDisplayed = false;
        }, 3000);
        
        // Clear auth data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Handle not found errors
    if (error.response && error.response.status === 404) {
      console.log('Resource not found:', error.config.url);
      
      // For demo tokens, try to provide mock data based on URL
      if (isDemoToken(token)) {
        const url = error.config.url || '';
        
        if (url.includes('/messages')) {
          return Promise.resolve({ data: [] });
        } else if (url.includes('/homework')) {
          return Promise.resolve({ data: [] });
        } else if (url.includes('/students')) {
          return Promise.resolve({ data: [] });
        }
      }
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      if (!isAuthErrorDisplayed) {
        isAuthErrorDisplayed = true;
        toast.error('Server error. Please try again later.');
        setTimeout(() => { isAuthErrorDisplayed = false; }, 3000);
      }
      return Promise.reject(error);
    }
    
    // Handle other errors
    if (!isAuthErrorDisplayed) {
      isAuthErrorDisplayed = true;
      
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'Something went wrong';
        toast.error(message);
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error('An error occurred. Please try again.');
      }
      
      // Reset flag after delay
      setTimeout(() => {
        isAuthErrorDisplayed = false;
      }, 3000);
    }
    
    return Promise.reject(error);
  }
);

export default api;