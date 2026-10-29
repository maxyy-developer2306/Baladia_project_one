import axios from 'axios';

// VITE_API_URL me /api ho ya na ho, dono case handle ho jayenge.
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
let API_URL = RAW_URL.replace(/\/+$/, '');
if (!/\/api$/.test(API_URL)) {
  API_URL += '/api';
}

// Note: do NOT set a default Content-Type header here.
// Axios sets "application/json" automatically for plain objects,
// and "multipart/form-data" (with the boundary) automatically for FormData.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send HTTP-only cookies
});

export default api;