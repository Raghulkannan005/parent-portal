import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// Context
import { AuthProvider, RequireAuth } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }>
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
  );
}

export default App;
