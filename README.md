# Parent Portal Application

A simple web application for school parent-teacher communication.

## Features

- Student management and attendance tracking
- Homework assignment and tracking
- Messaging between parents and teachers
- Role-based access (parent, teacher, admin)

## Project Structure

```
parent-portal/
├── backend/           # Express.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── database/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/          # React frontend
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in:
   ```
   cp .env.example .env
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Default Login Credentials

For testing, you can use these accounts:

- **Parent Account:**
  - Email: parent@example.com
  - Password: password123

- **Teacher Account:**
  - Email: teacher@example.com
  - Password: password123

- **Admin Account:**
  - Email: admin@example.com
  - Password: password123