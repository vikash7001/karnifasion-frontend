import axios from 'axios';
const BASE = process.env.REACT_APP_API_BASE || 'https://karnifasion-backend.onrender.com';

const instance = axios.create({ baseURL: BASE });

export const api = {
  setToken(token){
    if(token) instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    else delete instance.defaults.headers.common['Authorization'];
  },
  get(path, data){ return instance.get(path, data); },
  post(path, data){ return instance.post(path, data); }
};
