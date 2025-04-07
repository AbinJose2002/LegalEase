import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  async register(userData) {
    try {
      // Check if email already exists
      const checkResponse = await axios.post(`${API_BASE_URL}/user/register-check`, {
        email: userData.email
      });

      if (checkResponse.data.exists) {
        throw new Error('Email already registered');
      }

      // Proceed with registration
      const response = await axios.post(`${API_BASE_URL}/user/register`, userData);
      if (response.data.success) {
        localStorage.setItem('usertoken', response.data.token);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  },

  // Add other API calls here as needed
};

export const registerAdvocate = async (formData) => {
  try {
    // Check if experience field exists and add it if it doesn't
    if (!formData.has('experience')) {
      formData.append('experience', '0'); // Default to 0 years of experience
    }
    
    // Log the form data for debugging
    console.log("Registration form data:", Object.fromEntries(formData.entries()));
    
    const response = await axios.post(`${API_BASE_URL}/advocates/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Registration error details:", error.response?.data);
    throw error.response?.data || error;
  }
};

export default api;
