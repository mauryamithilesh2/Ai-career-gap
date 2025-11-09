//import axios from 'axios';

// Get API URL from environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const API = axios.create({
    baseURL: `${API_BASE_URL}/api/`,
    timeout: 10000,
});

// Request interceptor to add JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    localStorage.setItem('access', access);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authAPI = {
    login: (credentials) => API.post('auth/login/', credentials),
    register: (userData) => API.post('auth/register/', userData),
    logout: (refreshToken) => API.post('auth/logout/', { refresh: refreshToken }),
    changePassword: (passwordData) => API.post('auth/change-password/', passwordData),
    requestPasswordReset: (email) => API.post('auth/password-reset/', { email }),
    confirmPasswordReset: (data) => API.post('auth/password-reset-confirm/', data),
    getProfile: () => API.get('auth/profile/'),
    updateProfile: (data) => API.patch('auth/profile/', data),
};

// Dashboard API endpoints
export const dashboardAPI = {
    getStats: () => API.get('dashboard/stats/'),
};

// Resume API endpoints
export const resumeAPI = {
    upload: (formData) => API.post('resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // Increase timeout for file uploads
    }),
    list: () => API.get('resumes/'),
    get: (id) => API.get(`resumes/${id}/`),
    analyze: (id) => API.post(`resumes/${id}/analyze/`),
    delete: (id) => API.delete(`resumes/${id}/`),
};

// Job API endpoints

export const jobAPI = { 
    upload: (data) => API.post('jobs/', data),
    update: (id, data) => API.put(`jobs/${id}/`, data),

    list: () => API.get('jobs/'), 
    get: (id) => API.get(`jobs/${id}/`), 

    analyze: (id) => API.post(`jobs/${id}/analyze/`),
    delete: (id) => API.delete(`jobs/${id}/`),
};

// generating resume Api Endpoints
export const resumeGenAPI = {
    generate: (data) => API.post('generate-resume/', data),
    build: (data) => API.post('resume/build/', data),
    preview: (id) => API.get(`resume/preview/${id}/`),
};

// Analysis API endpoints
export const analyzeAPI = {
    analyze: (data) => API.post('analyze/', data),
};

export const speakAPI = {
  analyze: (data) => API.post("speak-assessment/", data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // Increase timeout for audio processing
  }),
};


export default API;


// this fine dont have any duplicate resumeapi
