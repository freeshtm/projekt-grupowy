import axios from 'axios';
import { buildUrl } from './config';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(buildUrl('/login'), {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || { message: error.message || 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(buildUrl('/register'), userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || { message: error.message || 'Registration failed' };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(buildUrl(`/users/${userId}`));
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      id: userId,
      username: 'User',
      email: 'user@example.com',
      average_rating: 4.5,
    };
  }
};
