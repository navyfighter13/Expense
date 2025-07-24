import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:6533/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for OCR processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Transaction API
export const transactionAPI = {
  getAll: (page = 1, limit = 50) => 
    api.get(`/transactions?page=${page}&limit=${limit}`),
  
  getById: (id) => 
    api.get(`/transactions/${id}`),
  
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    return api.post('/transactions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  update: (id, data) => 
    api.put(`/transactions/${id}`, data),
  
  delete: (id) => 
    api.delete(`/transactions/${id}`)
};

// Receipt API
export const receiptAPI = {
  getAll: (page = 1, limit = 20) => 
    api.get(`/receipts?page=${page}&limit=${limit}`),
  
  getById: (id) => 
    api.get(`/receipts/${id}`),
  
  upload: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/receipts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getUnmatched: () => 
    api.get('/receipts/unmatched/list'),
  
  update: (id, data) => 
    api.put(`/receipts/${id}`, data),
  
  delete: (id) => 
    api.delete(`/receipts/${id}`)
};

// Match API
export const matchAPI = {
  getAll: () => 
    api.get('/matches'),
  
  getPending: () => 
    api.get('/matches/pending'),
  
  findMatches: (receiptId) => 
    api.post(`/matches/find/${receiptId}`),
  
  create: (data) => 
    api.post('/matches', data),
  
  confirm: (id) => 
    api.put(`/matches/${id}/confirm`),
  
  reject: (id) => 
    api.put(`/matches/${id}/reject`),
  
  delete: (id) => 
    api.delete(`/matches/${id}`),
  
  autoMatch: (threshold = 75) => 
    api.post('/matches/auto-match', { threshold }),
  
  getStats: () => 
    api.get('/matches/stats')
};

// Health check
export const healthCheck = () => 
  api.get('/health');

export default api; 