import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('usertoken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        } else {
            console.warn(`API Request without token: ${config.method.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors (expired token)
        if (error.response && error.response.status === 401) {
            console.log("Authentication error - redirecting to login");
            localStorage.removeItem('usertoken');
            window.location.href = '/login';
        } else if (error.response) {
            console.error(`API Error: ${error.response.status} ${error.config?.url || 'unknown endpoint'}`, error.response.data);
        } else if (error.request) {
            console.error('API Error: No response received', error.request);
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Helper method to get data from various API response formats
api.getData = function(response) {
    if (!response || !response.data) return null;
    
    // If it's an array, return it directly
    if (Array.isArray(response.data)) return response.data;
    
    // If it's a success response with data property that's an array
    if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    
    // If it's a simple object with no nesting
    if (typeof response.data === 'object' && !Array.isArray(response.data) && !response.data.data) {
        return [response.data]; // Return as array with single item
    }
    
    return null;
};

// Utility function to debug available endpoints
export const debugEndpoints = async () => {
    try {
        console.log("Checking available API endpoints...");
        const response = await axios.get("http://localhost:8080/api");
        console.log("API root response:", response.data);
        return response.data;
    } catch (err) {
        console.error("API endpoint check failed:", err);
        return null;
    }
};

export default api;
