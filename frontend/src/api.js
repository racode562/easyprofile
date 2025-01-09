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

// Add request interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login on auth errors
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Download profiles for a job
export const downloadProfiles = async (jobId) => {
  try {
    const response = await api.get(`/api/profiles/download/${jobId}`, {
      responseType: 'blob'
    });
    
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
