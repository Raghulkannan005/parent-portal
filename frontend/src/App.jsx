import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Component } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/students/Students';
import StudentDetail from './pages/students/StudentDetail';
import AddStudent from './pages/students/AddStudent';
import Homework from './pages/homework/Homework';
import Messages from './pages/messages/Messages';
import Conversation from './pages/messages/Conversation';
import NewMessage from './pages/messages/NewMessage';
import Profile from './pages/Profile';

// Auth Provider
import { AuthProvider, RequireAuth } from './context/AuthContext';

// Simple Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-3">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="homework" element={<Homework />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/new" element={<NewMessage />} />
              <Route path="messages/:userId" element={<Conversation />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
