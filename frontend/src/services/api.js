import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expense API
export const expenseApi = {
  getAll: (params = {}) => api.get('/expenses/', { params }),
  getById: (id) => api.get(`/expenses/${id}/`),
  create: (data) => api.post('/expenses/', data),
  update: (id, data) => api.put(`/expenses/${id}/`, data),
  delete: (id) => api.delete(`/expenses/${id}/`),
  getStats: () => api.get('/expenses/stats/'),
};

// Category API
export const categoryApi = {
  getAll: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

// Exchange Rate API
export const exchangeApi = {
  getRates: (baseCurrency = 'USD') => api.get('/exchange-rates/', { params: { base: baseCurrency } }),
  convert: (amount, fromCurrency, toCurrency) =>
    api.post('/convert-currency/', { amount, from_currency: fromCurrency, to_currency: toCurrency }),
};

export default api;
