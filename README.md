# Parent Portal - School Communication Platform

A comprehensive web application for parents to track their children's education progress, communicate with teachers, and manage homework assignments.

## Features

- **Authentication System**: Secure login/registration with role-based access (parent, teacher, admin)
- **Student Management**: View student details, attendance records, and academic progress
- **Homework Tracking**: Browse and filter assigned homework with due dates and status indicators
- **Messaging System**: Real-time communication between parents and teachers
- **Dashboard**: Overview of important activities and statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Demo Mode**: Test the application without a backend using demo accounts

## Technology Stack

- **Frontend**:
  - React 19 with hooks and functional components
  - React Router for navigation
  - Material UI icons and components
  - Framer Motion for animations
  - Tailwind CSS for styling
  - Axios for API requests
  - React Toastify for notifications
  - Context API for state management

- **Backend**:
  - Node.js with Express
  - MongoDB with Mongoose
  - JWT for authentication
  - RESTful API design
  - Middleware for request validation and authentication

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/parent-portal.git
   cd parent-portal
   ```

2. Install dependencies for both frontend and backend:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Configure your MongoDB connection string and JWT secret

4. Set up the database:
   ```
   # In the backend directory
   node src/database/setup.js
   ```

5. Start the development servers:
   ```
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend server
   cd frontend
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

## Demo Accounts

The application includes demo accounts for testing:

- **Parent**: 
  - Email: parent@example.com
  - Password: password

- **Teacher**:
  - Email: teacher@example.com
  - Password: password

- **Admin**:
  - Email: admin@example.com
  - Password: password

## Project Structure

```
parent-portal/
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS styles
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   └── package.json        # Frontend dependencies
│
├── backend/                # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── database/       # Database configuration
│   │   ├── middleware/     # Middleware functions
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express application setup
│   ├── server.js           # Server entry point
│   └── package.json        # Backend dependencies
│
└── README.md               # Project documentation
```

## API Documentation

The API follows RESTful principles with the following main endpoints:

- **Authentication**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

- **Students**
  - `GET /api/students` - Get all students (filtered by parent or class)
  - `GET /api/students/:id` - Get a specific student
  - `POST /api/students` - Add a new student (teachers/admin only)
  - `PUT /api/students/:id/attendance` - Update student attendance

- **Homework**
  - `GET /api/homework` - Get homework assignments (filtered by class/section)
  - `POST /api/homework` - Create a new homework assignment (teachers/admin only)

- **Messages**
  - `GET /api/messages` - Get all user messages
  - `GET /api/messages/conversation/:otherUserId` - Get conversation with another user
  - `POST /api/messages` - Send a new message
  - `PUT /api/messages/:messageId/read` - Mark a message as read

- **Users**
  - `GET /api/users/available` - Get users available for messaging
  - `GET /api/users/:id` - Get user profile
  - `PUT /api/users/profile` - Update user profile
  - `PUT /api/users/password` - Update user password

## License

This project is licensed under the MIT License - see the LICENSE file for details.