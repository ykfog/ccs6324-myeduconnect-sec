import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the session token and mode
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sessionToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const mode = localStorage.getItem('mode') || 'vulnerable';
        config.headers['X-Mode'] = mode;
        return config;
    },
    (error) => Promise.reject(error)
);

// API helper methods
export const apiHelpers = {
    courses: async (search = '') => {
        const response = await api.get(`/api/courses?search=${search}`);
        return response.data;
    },
    register: async (username, password, fullname) => {
        const response = await api.post('/api/register', { username, password, fullname });
        return response.data;
    },
    login: async (username, password) => {
        const response = await api.post('/api/login', { username, password });
        return response.data;
    },
    getCourseDetail: async (courseId) => {
        const response = await api.get(`/api/courses/${courseId}`);
        return response.data;
    },
    postComment: async (courseId, comment) => {
        const response = await api.post(`/api/courses/${courseId}/comment`, { comment });
        return response.data;
    },
    getProfile: async (userId) => {
        const response = await api.get(`/api/profile/${userId}`);
        return response.data;
    },
    updateProfile: async (userId, bio) => {
        const response = await api.post(`/api/profile/${userId}/update`, { bio });
        return response.data;
    },
    enroll: async (courseId) => {
        const response = await api.post('/api/enroll', { course_id: courseId });
        return response.data;
    },
    getEnrollments: async () => {
        const response = await api.get('/api/enrollments');
        return response.data;
    }
};

export default api;