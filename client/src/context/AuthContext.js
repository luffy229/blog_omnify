import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    setUser(userInfo);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        '/users/login',
        { email, password }
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post(
        '/users',
        { name, email, password }
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message 
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await api.put(
        '/users/profile',
        userData
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 