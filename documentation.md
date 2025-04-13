# Parent Portal Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Installation Guide](#installation-guide)
5. [Configuration](#configuration)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [State Management](#state-management)
9. [Authentication](#authentication)
10. [Role-Based Access Control](#role-based-access-control)
11. [Database Schema](#database-schema)
12. [Features](#features)
13. [Demo Mode](#demo-mode)
14. [Development Guidelines](#development-guidelines)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)
18. [Future Enhancements](#future-enhancements)

## Introduction

Parent Portal is a comprehensive web application designed to improve communication between parents and schools. It provides a centralized platform for parents to track their children's education progress, communicate with teachers, and manage homework assignments.

### Target Users

- **Parents**: Monitor children's academic progress, communicate with teachers, and receive updates
- **Teachers**: Send messages to parents, assign homework, and update student attendance
- **Administrators**: Manage school-wide data, users, and system settings

### Key Features

- Role-based access control
- Student management and tracking
- Homework assignment and tracking
- Messaging system between parents and teachers
- Real-time notifications
- Attendance tracking
- Demo mode for testing

## System Architecture

The Parent Portal application follows a client-server architecture with separate frontend and backend codebases:

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  Database   │
│   (React)   │◄────┤  (Express)  │◄────┤  (MongoDB)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Directory Structure

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
└── documentation.md        # Project documentation
```

## Technology Stack

### Frontend

- **React 19**: Core library for building the user interface
- **React Router 7**: For application routing and navigation
- **Material UI Icons**: Icon library
- **Framer Motion**: Animation library for UI transitions
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API requests
- **React Toastify**: Toast notification library
- **Context API**: For state management

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing library
- **Express Mongo Sanitize**: Middleware to prevent NoSQL injection
- **CORS**: Cross-Origin Resource Sharing middleware

## Installation Guide

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- MongoDB (local or Atlas)

### Frontend Installation

1. Navigate to the frontend directory:
   ```bash
   cd parent-portal/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

### Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd parent-portal/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/parentportal
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:3000/api`

## Configuration

### Environment Variables

#### Backend (.env)

- `PORT`: The port number for the server to listen on (default: 3000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for signing JWT tokens

### Frontend Configuration

The frontend API base URL is configured in `src/utils/api.js`. It defaults to connecting to `/api`, which will connect to the backend when properly deployed with static file serving.

## API Documentation

The API follows RESTful principles with the following main endpoints:

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/auth/login` | POST | User login | `{ email, password }` | `{ token, user }` |
| `/api/auth/register` | POST | User registration | `{ name, email, password, role }` | `{ token, user }` |

### Student Endpoints

| Endpoint | Method | Description | Request Body/Query | Response |
|----------|--------|-------------|-------------------|----------|
| `/api/students` | GET | Get all students | Query: `{ class, section, parentId }` | Array of students |
| `/api/students/:id` | GET | Get a specific student | - | Student object |
| `/api/students` | POST | Add a new student | `{ name, rollNumber, class, section, parentId }` | Created student |
| `/api/students/:id/attendance` | PUT | Update student attendance | `{ present, absent }` | Updated student |

### Homework Endpoints

| Endpoint | Method | Description | Request Body/Query | Response |
|----------|--------|-------------|-------------------|----------|
| `/api/homework` | GET | Get homework assignments | Query: `{ class, section }` | Array of homework |
| `/api/homework` | POST | Create homework assignment | `{ title, description, class, section, subject, dueDate }` | Created homework |

### Message Endpoints

| Endpoint | Method | Description | Request Body/Query | Response |
|----------|--------|-------------|-------------------|----------|
| `/api/messages` | GET | Get all user messages | - | Array of messages |
| `/api/messages/conversation/:otherUserId` | GET | Get conversation | - | Array of messages |
| `/api/messages` | POST | Send a new message | `{ receiverId, content }` | Created message |
| `/api/messages/:messageId/read` | PUT | Mark message as read | - | Updated message |

### User Endpoints

| Endpoint | Method | Description | Request Body/Query | Response |
|----------|--------|-------------|-------------------|----------|
| `/api/users/available` | GET | Get users for messaging | - | Array of users |
| `/api/users/:id` | GET | Get user profile | - | User object |
| `/api/users/profile` | PUT | Update user profile | `{ name, email, phone }` | Updated user |
| `/api/users/password` | PUT | Update user password | `{ currentPassword, newPassword }` | Success message |

## Frontend Components

### Core Components

#### Layout Components

- **Layout** (`src/components/layout/Layout.jsx`): 
  - Main layout wrapper with sidebar, header, and content area
  - Handles responsive behavior for mobile and desktop views

#### Authentication Components

- **Login** (`src/pages/auth/Login.jsx`): 
  - Handles user login with form validation
  - Supports demo account login

- **Register** (`src/pages/auth/Register.jsx`): 
  - User registration with role selection
  - Form validation for required fields

#### Dashboard Components

- **Dashboard** (`src/pages/Dashboard.jsx`): 
  - Role-specific dashboard with key metrics
  - Recent activity feed
  - Quick action buttons

#### Student Management Components

- **Students** (`src/pages/students/Students.jsx`): 
  - List of students with search and filtering
  - Card-based UI with student details

- **StudentDetail** (`src/pages/students/StudentDetail.jsx`): 
  - Detailed view of a student with attendance records
  - Recent homework assignments
  - Attendance update form for teachers

- **AddStudent** (`src/pages/students/AddStudent.jsx`): 
  - Form to add new students
  - Parent selection dropdown

#### Homework Components

- **Homework** (`src/pages/homework/Homework.jsx`): 
  - List of homework assignments
  - Filtering by class, section, and subject
  - Search functionality
  - Status indicators for due dates

#### Messaging Components

- **Messages** (`src/pages/messages/Messages.jsx`): 
  - List of conversations
  - Unread message indicators

- **Conversation** (`src/pages/messages/Conversation.jsx`): 
  - Chat interface for conversations
  - Message sending functionality

- **NewMessage** (`src/pages/messages/NewMessage.jsx`): 
  - Form to start a new conversation
  - Recipient selection

#### User Profile Components

- **Profile** (`src/pages/Profile.jsx`):
  - User profile information
  - Profile update form
  - Password change form

## State Management

The application uses React's Context API for state management:

### Auth Context

- **Location**: `src/context/AuthContext.jsx`
- **Purpose**: Manages user authentication state
- **Features**:
  - User login/logout
  - Access token management
  - Role-based access control
  - Demo mode support

## Authentication

The application uses JSON Web Tokens (JWT) for authentication:

### Authentication Flow

1. User submits login credentials
2. Backend validates credentials and generates a JWT
3. Frontend stores JWT in localStorage
4. JWT is included in Authorization header for API requests
5. Backend middleware validates JWT for protected routes

### Authentication Middleware

- **Location**: `backend/src/middleware/authMiddleware.js`
- **Functions**:
  - `authenticateUser`: Verifies JWT and attaches user to request
  - `authorizeRole`: Checks if user has required role for access

## Role-Based Access Control

The application supports three user roles with different permissions:

### Parent Role

- View their own children's information
- View homework assignments for their children's classes
- Communicate with teachers

### Teacher Role

- View and add students
- Create and view homework assignments
- Update student attendance
- Communicate with parents

### Admin Role

- Full access to all features
- User management
- System-wide settings

## Database Schema

The application uses MongoDB with the following main collections:

### Users Collection

```
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: 'parent', 'teacher', 'admin'),
  phone: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Students Collection

```
{
  _id: ObjectId,
  name: String,
  rollNumber: String,
  class: String,
  section: String,
  parentId: ObjectId (ref: Users),
  attendance: {
    present: Number,
    absent: Number,
    total: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Homework Collection

```
{
  _id: ObjectId,
  title: String,
  description: String,
  class: String,
  section: String,
  subject: String,
  dueDate: Date,
  uploadedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection

```
{
  _id: ObjectId,
  sender: ObjectId (ref: Users),
  receiver: ObjectId (ref: Users),
  content: String,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### Dashboard

- Role-specific metrics and statistics
- Recent activity feed
- Quick navigation buttons to common actions

### Student Management

- List all students with search and filter options
- Student detail view with attendance history
- Add new students with parent association
- Update attendance records

### Homework Management

- Assign homework to specific classes/sections
- Filter homework by class, section, and subject
- Due date visualization with status indicators
- Search homework by title, description, or subject

### Messaging System

- Direct messaging between parents and teachers
- Conversation view for message history
- Unread message indicators
- New message notifications

### User Profile

- View and update personal information
- Change password functionality
- Role-specific settings

## Demo Mode

The application includes a demo mode for testing without a backend:

### Demo Accounts

- **Parent**: 
  - Email: parent@example.com
  - Password: password

- **Teacher**:
  - Email: teacher@example.com
  - Password: password

- **Admin**:
  - Email: admin@example.com
  - Password: password

### Demo Mode Features

- Mock API responses with realistic data
- Simulated network delays
- Persistent state between sessions
- Role-specific data based on login

### Demo Mode Implementation

- **Location**: `src/utils/api.js`
- Uses interceptors to detect demo mode tokens
- Provides mock data for all API endpoints

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow consistent naming conventions
- Document complex logic with comments
- Maintain proper error handling

### State Management

- Use Context API for application-wide state
- Use local state for component-specific data
- Avoid prop drilling with context providers

### API Communication

- Centralize API calls in utility functions
- Handle loading and error states consistently
- Use proper error handling with try/catch

### UI/UX Guidelines

- Implement responsive design for all components
- Use consistent spacing and typography
- Provide feedback for user actions
- Implement proper loading states
- Handle error cases gracefully

## Testing

### Frontend Testing

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for complex workflows

### Backend Testing

- Unit tests for service functions
- API endpoint tests
- Authentication and authorization tests
- Database integration tests

### Manual Testing

- Cross-browser compatibility testing
- Mobile responsiveness testing
- Role-based permission testing
- Edge case testing

## Deployment

### Frontend Deployment

- Build the React application:
  ```bash
  cd frontend
  npm run build
  ```
- The output will be in the `dist` directory

### Backend Deployment

- Ensure environment variables are set
- Start the Node.js server:
  ```bash
  cd backend
  npm start
  ```

### Deployment Options

- **Development**: Local development server
- **Production**: 
  - Cloud providers (AWS, Heroku, DigitalOcean)
  - Docker containers
  - Kubernetes clusters

## Troubleshooting

### Common Issues

#### Authentication Issues

- Check JWT token expiration
- Verify correct credentials
- Ensure proper headers in API requests

#### API Connection Issues

- Verify backend server is running
- Check for CORS configuration
- Confirm network connectivity

#### Database Issues

- Verify MongoDB connection string
- Check database user permissions
- Ensure proper indexes for performance

### Debugging Tools

- Browser DevTools for frontend issues
- API testing tools (Postman, Insomnia)
- Server logs for backend issues

## Future Enhancements

### Planned Features

- **Real-time Notifications**: Implement WebSockets for instant updates
- **File Attachments**: Allow file uploads for homework and messages
- **Calendar Integration**: School calendar with events and reminders
- **Grades Module**: Comprehensive grade tracking system
- **Mobile Application**: Native mobile apps for iOS and Android
- **Advanced Analytics**: Reporting and analytics dashboard for administrators
- **Multi-language Support**: Internationalization for multiple languages