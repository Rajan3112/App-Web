# Mobiloitte Project Management System

A full-stack, responsive Project Management System built with Next.js, Node.js/Express, and MongoDB.

## Features

- **User Authentication**: Secure login with email/password
- **Role-based Access Control**: Admin, Manager, and Employee roles
- **Project Management**: Create, edit, and delete projects with start/end dates
- **Task Management**: Assign tasks to team members with priorities and deadlines
- **Real-time Updates**: WebSocket integration for live updates
- **User Management**: Admin-only user creation/editing/deletion
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT

## Preconfigured Admin Credentials

- **Email**: mobiloitte@gmail.com
- **Password**: Mobiloitte@123

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project3
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Set up MongoDB**:
   - **Option 1: Local Installation**:
     - Install MongoDB Community Edition on your system
     - Start MongoDB service
   - **Option 2: MongoDB Atlas (Cloud)**:
     - Create a free account at https://www.mongodb.com/cloud/atlas
     - Create a new cluster and database
     - Get your connection string

5. **Set up environment variables**:
   - Create a `.env` file in the `backend` directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

5. **Run the application**:
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # Start frontend development server
   cd frontend
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (Manager/Admin)
- `PUT /api/projects/:id` - Update project (Manager/Admin)
- `DELETE /api/projects/:id` - Delete project (Manager/Admin)
- `POST /api/projects/:id/assign` - Assign user to project (Manager/Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task (Manager/Admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Manager/Admin)

## Role-based Permissions

### Admin
- Full access to all features
- User management
- System settings

### Manager
- Create/edit/delete projects
- Assign projects to employees
- Create/edit/delete tasks
- View assigned projects and tasks

### Employee
- View assigned projects and tasks
- Update task status

## Validation Rules

### Login Form
- Email field with placeholder "Please enter your email."
- Email validation: max 50 characters
- Error message: "Please enter your valid email."
- Password field: 5–50 characters
- Show/hide password icon
- Bottom red inline alerts:
  - "Please enter your email." (when empty)
  - "Please enter your password." (when empty)

### Project Creation
- Start date must be today or later
- End date must be after start date

### User Management
- Email required with validation
- Mobile number validation with country digit rules

## Real-time Features

The system uses Socket.IO for real-time updates:
- Project creation/update/deletion
- Task creation/update/deletion
- Status changes

## Development

To run both frontend and backend simultaneously:
```bash
npm run dev
```

## License

This project is licensed under the MIT License.