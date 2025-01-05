import axios from "axios";

// Create an Axios instance that always sends credentials (cookies)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // crucial for sending HttpOnly cookies
});

export default api;
