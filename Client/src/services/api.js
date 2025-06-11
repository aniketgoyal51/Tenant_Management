import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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