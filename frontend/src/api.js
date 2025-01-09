import axios from "axios";

// Create an Axios instance that always sends credentials (cookies)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // crucial for sending HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to prevent repeated failed requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    // If we get a 401 and we're not already refreshing
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Let the auth context handle the redirect
      processQueue(error);
      isRefreshing = false;
    }
    return Promise.reject(error);
  }
);

// Download profiles for a job
export const downloadProfiles = async (jobId) => {
  try {
    const response = await api.get(`/api/profiles/download/${jobId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/zip'
      }
    });

    if (!response.data || response.data.size === 0) {
      throw new Error('No data received from server');
    }
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `profiles-${jobId}.zip`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading profiles:', error);
    throw error;
  }
};

export default api;
