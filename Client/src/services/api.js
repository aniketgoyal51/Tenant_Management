import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Function to check server availability
const checkServerHealth = async () => {
    try {
        const response = await axios.get(`${API_URL}/health`, {
            timeout: 5000,
            headers: {
                'Accept': 'application/json',
            },
            withCredentials: true
        });
        return response.status === 200;
    } catch (error) {
        console.error('Server health check failed:', error);
        return false;
    }
};

// Create axios instance with retry logic
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000 // 30 seconds
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Add request interceptor
api.interceptors.request.use(
    async config => {
        // Add timestamp to prevent caching
        if (config.method === 'get') {
            config.params = { ...config.params, _t: Date.now() };
        }

        // Check server health before making the request
        const isServerHealthy = await checkServerHealth();
        if (!isServerHealthy) {
            throw new Error('Server is not responding. Please try again later.');
        }

        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor with retry logic
api.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config;

        // If we haven't retried yet and it's a network error or timeout
        if (!config._retry && (error.code === 'ECONNABORTED' || !error.response)) {
            config._retry = true;
            config._retryCount = config._retryCount || 0;

            if (config._retryCount < MAX_RETRIES) {
                config._retryCount++;
                console.log(`Retrying request (${config._retryCount}/${MAX_RETRIES})...`);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

                // Retry the request
                return api(config);
            }
        }

        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - the server took too long to respond');
            return Promise.reject(new Error('The server is taking too long to respond. Please try again later.'));
        }

        console.error('API Error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);

            // Handle CORS errors specifically
            if (error.response.status === 0) {
                return Promise.reject(new Error('CORS error: Unable to access the API. Please check your connection.'));
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            return Promise.reject(new Error('Unable to reach the server. Please check your internet connection and try again.'));
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);

// Tenant APIs
export const tenantAPI = {
    getAll: () => api.get('/tenants'),
    getById: (id) => api.get(`/tenants/${id}`),
    create: (data) => api.post('/tenants', data),
    update: (id, data) => api.patch(`/tenants/${id}`, data),
    delete: (id) => api.delete(`/tenants/${id}`),
};

// Unit APIs
export const unitAPI = {
    getAll: () => api.get('/units'),
    getByTenant: (tenantId) => api.get(`/units/tenant/${tenantId}`),
    create: (data) => api.post('/units', data),
    update: (id, data) => api.patch(`/units/${id}`, data),
    delete: (id) => api.delete(`/units/${id}`),
};

// Payment APIs
export const paymentAPI = {
    getAll: () => api.get('/payments'),
    getByTenant: (tenantId) => api.get(`/payments/tenant/${tenantId}`),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.patch(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
}; 