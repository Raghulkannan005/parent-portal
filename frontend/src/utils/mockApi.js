import { v4 as uuidv4 } from 'uuid';

// Mock storage
const storage = {
  users: [
    { _id: 'user1', name: 'John Parent', email: 'parent@example.com', role: 'parent' },
    { _id: 'user2', name: 'Mary Teacher', email: 'teacher@example.com', role: 'teacher' },
    { _id: 'user3', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
  ],
  students: [
    { 
      _id: 'student1', 
      name: 'Alex Smith', 
      rollNumber: '101', 
      class: '10', 
      section: 'A',
      parentId: 'user1',
      attendance: { present: 42, absent: 3, total: 45 }
    },
    { 
      _id: 'student2', 
      name: 'Emma Smith', 
      rollNumber: '102', 
      class: '8', 
      section: 'B',
      parentId: 'user1',
      attendance: { present: 40, absent: 5, total: 45 }
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
      uploadedBy: 'user2',
      createdAt: new Date()
    }
  ],
  messages: [
    {
      _id: 'msg1',
      sender: { _id: 'user2', name: 'Mary Teacher' },
      receiver: { _id: 'user1', name: 'John Parent' },
      content: 'Hello! This is about your child\'s progress.',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 'msg2',
      sender: { _id: 'user1', name: 'John Parent' },
      receiver: { _id: 'user2', name: 'Mary Teacher' },
      content: 'Thank you for letting me know. Can we discuss further?',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]
};

// Set this to true to use mock API instead of real API
export const useMockApi = true;

// Mock API handlers
const mockHandlers = {
  // Auth handlers
  'POST /auth/login': (data) => {
    const { email, password } = data;
    const user = storage.users.find(u => u.email === email);
    
    if (user) {
      return { 
        token: 'mock-token-' + user._id,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }
    
    throw { response: { data: { error: 'Invalid credentials' } } };
  },
  
  'POST /auth/register': (data) => {
    const { name, email, password, phone } = data;
    
    if (storage.users.some(u => u.email === email)) {
      throw { response: { data: { error: 'User already exists' } } };
    }
    
    const newUser = {
      _id: 'user' + (storage.users.length + 1),
      name,
      email,
      role: 'parent'
    };
    
    storage.users.push(newUser);
    
    return {
      token: 'mock-token-' + newUser._id,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };
  },
  
  // Student handlers
  'GET /students': (params, user) => {
    if (user.role === 'parent') {
      return storage.students.filter(s => s.parentId === user.id);
    }
    
    // For teachers, filter by class/section if provided
    if (params?.class && params?.section) {
      return storage.students.filter(
        s => s.class === params.class && s.section === params.section
      );
    }
    
    return storage.students;
  },
  
  'GET /students/:id': (params) => {
    const student = storage.students.find(s => s._id === params.id);
    if (!student) throw { response: { status: 404 } };
    return student;
  },
  
  'POST /students': (data) => {
    const newStudent = {
      _id: 'student' + (storage.students.length + 1),
      ...data,
      attendance: { present: 0, absent: 0, total: 0 }
    };
    
    storage.students.push(newStudent);
    return newStudent;
  },
  
  'PUT /students/:id/attendance': (data, user, params) => {
    const student = storage.students.find(s => s._id === params.id);
    if (!student) throw { response: { status: 404 } };
    
    student.attendance = {
      present: data.present,
      absent: data.absent,
      total: data.present + data.absent
    };
    
    return student;
  },
  
  // Homework handlers
  'GET /homework': (params) => {
    if (!params?.class || !params?.section) {
      return [];
    }
    
    return storage.homework.filter(
      hw => hw.class === params.class && hw.section === params.section
    );
  },
  
  'POST /homework': (data, user) => {
    const newHomework = {
      _id: 'hw' + (storage.homework.length + 1),
      ...data,
      uploadedBy: user.id,
      createdAt: new Date()
    };
    
    storage.homework.push(newHomework);
    return newHomework;
  },
  
  // Message handlers
  'GET /messages': (params, user) => {
    return storage.messages.filter(
      m => m.sender._id === user.id || m.receiver._id === user.id
    );
  },
  
  'GET /messages/conversation/:otherUserId': (params, user) => {
    return storage.messages.filter(
      m => (m.sender._id === user.id && m.receiver._id === params.otherUserId) ||
           (m.sender._id === params.otherUserId && m.receiver._id === user.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  
  'POST /messages': (data, user) => {
    const receiver = storage.users.find(u => u._id === data.receiverId);
    
    if (!receiver) {
      throw { response: { data: { error: 'Receiver not found' } } };
    }
    
    const sender = storage.users.find(u => u._id === user.id);
    
    const newMessage = {
      _id: 'msg' + (storage.messages.length + 1),
      sender: { _id: user.id, name: sender.name },
      receiver: { _id: receiver._id, name: receiver.name },
      content: data.content,
      isRead: false,
      createdAt: new Date()
    };
    
    storage.messages.push(newMessage);
    return newMessage;
  },
  
  'PUT /messages/:messageId/read': (data, user, params) => {
    const message = storage.messages.find(m => m._id === params.messageId);
    
    if (!message) {
      throw { response: { data: { error: 'Message not found' } } };
    }
    
    if (message.receiver._id !== user.id) {
      throw { response: { data: { error: 'Unauthorized' } } };
    }
    
    message.isRead = true;
    return message;
  }
};

// Mock API interceptor
export const setupMockApi = (axios) => {
  if (!useMockApi) return;
  
  // Add interceptors for request and response
  axios.interceptors.request.use((config) => {
    console.log('[Mock API] Request:', config.method, config.url);
    return config;
  });
  
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only handle network errors, let other errors pass through
      if (!error.response) {
        console.log('[Mock API] Network error intercepted');
        
        const url = error.config.url.replace('/api', '');
        const method = error.config.method.toUpperCase();
        const key = `${method} ${url}`;
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Parse URL to extract params (like :id)
        let params = {};
        const urlParts = url.split('/');
        const handlerKeys = Object.keys(mockHandlers);
        
        for (const handlerKey of handlerKeys) {
          const handlerParts = handlerKey.split(' ')[1].split('/');
          if (handlerParts.length === urlParts.length) {
            let match = true;
            const extractedParams = {};
            
            for (let i = 0; i < handlerParts.length; i++) {
              if (handlerParts[i].startsWith(':')) {
                // This is a param like :id
                extractedParams[handlerParts[i].substring(1)] = urlParts[i];
              } else if (handlerParts[i] !== urlParts[i]) {
                match = false;
                break;
              }
            }
            
            if (match && handlerKey.startsWith(method)) {
              params = extractedParams;
              break;
            }
          }
        }
        
        // Look for an exact handler match first
        let handler = mockHandlers[key];
        
        // If not found, try to find a parametrized handler
        if (!handler) {
          const handlerEntry = Object.entries(mockHandlers).find(([k, v]) => {
            const [m, p] = k.split(' ');
            return m === method && matchesPattern(p, url);
          });
          
          if (handlerEntry) {
            handler = handlerEntry[1];
          }
        }
        
        if (handler) {
          try {
            console.log('[Mock API] Using mock handler for', key);
            const queryParams = error.config.params || {};
            const data = error.config.data ? JSON.parse(error.config.data) : {};
            const result = handler(Object.assign({}, queryParams, data), userData, params);
            
            return Promise.resolve({
              data: result,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config,
            });
          } catch (mockError) {
            console.log('[Mock API] Mock handler error:', mockError);
            return Promise.reject(mockError);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Helper to match URL patterns with params like /users/:id
function matchesPattern(pattern, url) {
  const patternParts = pattern.split('/');
  const urlParts = url.split('/');
  
  if (patternParts.length !== urlParts.length) {
    return false;
  }
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      // This is a param, allow any value
      continue;
    }
    
    if (patternParts[i] !== urlParts[i]) {
      return false;
    }
  }
  
  return true;
}