import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:5000/api';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCunLhho96no3r614zMWz7XdftmmD7G3tU';

axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const buildUrl = (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`;
  if (!url.endsWith('/') && !endpoint.includes('?')) {
    return `${url}/`;
  }
  return url;
};
