# Blog Application

A full-stack MERN (MongoDB, Express, React, Node.js) blog application with features like user authentication, blog creation/editing, comments, likes, and notifications.

## Features

- User authentication (register, login, update profile)
- Create, edit, and delete blog posts
- Comment on blogs with nested replies
- Like blogs
- Real-time notifications
- User blog management
- Responsive design

## Tech Stack

- **Frontend**: React, React Bootstrap, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

## Deployment Instructions

### Prerequisites

- MongoDB Atlas account
- Vercel account
- GitHub account

### Steps to Deploy

1. **Environment Variables**:
   - Set up the following environment variables in Vercel:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secret key for JWT authentication
     - `PORT`: Will be automatically set by Vercel

2. **Deployment**:
   - Connect your GitHub repository to Vercel
   - Set the root directory as the project root
   - Configure the build settings:
     - Build Command: `npm run build`
     - Output Directory: `client/build`
   - Add the environment variables
   - Deploy!

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client && npm install
   ```
3. Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/client` - React frontend
- `/server` - Express backend
  - `/controllers` - Request handlers
  - `/middleware` - Custom middleware
  - `/models` - Mongoose models
  - `/routes` - API routes

## API Routes

- **Auth**: `/api/users` - Register, login, profile
- **Blogs**: `/api/blogs` - CRUD operations
- **Notifications**: `/api/notifications` - User notifications

## Screenshots

_Add screenshots of your application here_

## License

This project is licensed under the MIT License

## Acknowledgments

- React Bootstrap for UI components
- Font Awesome for icons
- All contributors who have helped with the development of this application 