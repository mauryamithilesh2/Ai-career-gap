import axios from 'axios';

const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/`,
    timeout: 10000,
});

// Request interceptor to add JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
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
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
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
    upload: (formData) => API.post('resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    list: () => API.get('resumes/'),
    get: (id) => API.get(`resumes/${id}/`),
    analyze: (id) => API.post(`resumes/${id}/analyze/`),
    delete: (id) => API.delete(`resumes/${id}/`),
};

// Job API endpoints
export const jobAPI = {
    upload: (data) => API.post('jobs/', data),
    list: () => API.get('jobs/'),
    get: (id) => API.get(`jobs/${id}/`),
    analyze: (id) => API.post(`jobs/${id}/analyze/`),
    delete: (id) => API.delete(`jobs/${id}/`),
};
// Analysis API endpoints
export const analyzeAPI = {
    analyze: (data) => API.post('analyze/', data),
};

export default API;
