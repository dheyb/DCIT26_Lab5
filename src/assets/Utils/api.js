import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Change this to your backend API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  
  // User endpoints
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, data) => api.put(`/users/${userId}`, data),
  
  // Menu/Product endpoints
  getMenuItems: () => api.get('/menu'),
  getMenuItem: (id) => api.get(`/menu/${id}`),
  createMenuItem: (data) => api.post('/menu', data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  
  // Order endpoints
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (userId) => api.get(`/orders/user/${userId}`),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  
  // Cart endpoints
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, item) => api.post(`/cart/${userId}`, item),
  updateCartItem: (userId, itemId, quantity) => api.put(`/cart/${userId}/${itemId}`, { quantity }),
  removeFromCart: (userId, itemId) => api.delete(`/cart/${userId}/${itemId}`),
  clearCart: (userId) => api.delete(`/cart/${userId}`),
  
  // Review endpoints
  getReviews: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  
  // Saved items endpoints
  getSavedItems: (userId) => api.get(`/saved/${userId}`),
  addToSaved: (userId, itemId) => api.post(`/saved/${userId}`, { itemId }),
  removeFromSaved: (userId, itemId) => api.delete(`/saved/${userId}/${itemId}`),
  
  // Announcement endpoints
  getAnnouncements: () => api.get('/announcements'),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
  
  // Delivery endpoints
  getDeliveryAddresses: (userId) => api.get(`/delivery/${userId}`),
  addDeliveryAddress: (userId, address) => api.post(`/delivery/${userId}`, address),
  updateDeliveryAddress: (userId, addressId, address) => api.put(`/delivery/${userId}/${addressId}`, address),
  deleteDeliveryAddress: (userId, addressId) => api.delete(`/delivery/${userId}/${addressId}`),
  
  // Generic GET, POST, PUT, DELETE methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default apiService;
