import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android emulator use: http://10.0.2.2:3000/api
// For iOS simulator use: http://localhost:3000/api
// For physical device, use your computer's IP: http://YOUR_IP:3000/api
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator default

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

