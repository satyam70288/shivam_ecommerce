// axiosInterceptor.js - FIXED VERSION

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://your-api-base-url.com',
    timeout: 30000,
    withCredentials: true, // ✅ Important for cookies
});

// 📍 Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // 🔥 FIX: Use 'token' not 'accessToken' (match with your authSlice)
        const token = localStorage.getItem('token'); 
        
        // 1️⃣ Token add karo
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token added to request:', config.url);
        } else {
            console.log('⚠️ No token found for:', config.url);
        }
        
        // 2️⃣ Check FormData
        if (config.data instanceof FormData) {
            console.log('📦 FormData request detected');
            delete config.headers['Content-Type'];
        } else {
            console.log('📄 JSON request detected');
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// 📍 Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('❌ Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });
        
        // 🔥 FIX: Don't logout on every 401
        if (error.response?.status === 401) {
            const isLoginRequest = error.config?.url?.includes('/login');
            const isSignupRequest = error.config?.url?.includes('/signup');
            
            // Only logout if it's NOT login/signup request
            if (!isLoginRequest && !isSignupRequest) {
                console.log('🔄 Unauthorized! Logging out...');
                
                // Clear only auth data, not everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                
                // Redirect to login
                window.location.href = '/login';
            } else {
                console.log('⚠️ 401 on login/signup - letting component handle');
            }
        }
        
        // FormData specific errors
        if (error.config?.data instanceof FormData) {
            if (error.response?.status === 413) {
                error.message = 'File too big! Max 10MB allowed.';
            }
            if (error.response?.status === 415) {
                error.message = 'File type not supported!';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;