# MERN Blog Application

A full-stack blog application built with the MERN stack (MongoDB, Express, React, Node.js). This application allows users to create, read, update, and delete blog posts, as well as interact with posts through likes and comments.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Blog Management**: Create, read, update, and delete blog posts
- **Interactive Features**:
  - Like/unlike blog posts
  - Comment on blog posts
  - Delete your own comments
  - View count tracking
  - Automatic reading time calculation
- **Search & Filter**: Search blogs by title, content, or author
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React.js
- React Bootstrap for UI components
- React Router for navigation
- Context API for state management
- Axios for API requests
- Font Awesome for icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose for data modeling
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd blog-app
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create a .env file in the server directory with the following variables
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the Application

1. Start the backend server
```bash
cd server
npm run dev
```

2. Start the frontend development server
```bash
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create a new blog
- `GET /api/blogs/:id` - Get a specific blog
- `PUT /api/blogs/:id` - Update a blog
- `DELETE /api/blogs/:id` - Delete a blog
- `POST /api/blogs/:id/like` - Like/unlike a blog
- `GET /api/blogs/:id/like/check` - Check if user has liked a blog
- `POST /api/blogs/:id/comments` - Add a comment to a blog
- `DELETE /api/blogs/:id/comments/:commentId` - Delete a comment

## Screenshots

_Add screenshots of your application here_

## License

This project is licensed under the MIT License

## Acknowledgments

- React Bootstrap for UI components
- Font Awesome for icons
- All contributors who have helped with the development of this application 