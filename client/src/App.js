import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BlogScreen from './screens/BlogScreen';
import CreateBlogScreen from './screens/CreateBlogScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import UserBlogsScreen from './screens/UserBlogsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SecurityScreen from './screens/SecurityScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/blog/:id" element={<BlogScreen />} />
              <Route path="/blog/:id/edit" element={<CreateBlogScreen />} />
              <Route path="/create-blog" element={<CreateBlogScreen />} />
              <Route path="/my-blogs" element={<UserBlogsScreen />} />
              <Route path="/notifications" element={<NotificationsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/security" element={<SecurityScreen />} />
              <Route path="/user/:id" element={<UserProfileScreen />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
