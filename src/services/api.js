import axios from "axios";

const BASE =
  process.env.REACT_APP_API_BASE ||
  "https://karnifasion-backend.onrender.com";

// Create axios instance
const apiInstance = axios.create({
  baseURL: BASE,
});

// ------------------------------
// MAIN API OBJECT  (named export + default export)
// ------------------------------
const api = {
  setToken(token) {
    if (token) {
      apiInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiInstance.defaults.headers.common["Authorization"];
    }
  },

  get(path, params) {
    return apiInstance.get(path, { params });
  },

  post(path, data) {
    return apiInstance.post(path, data);
  },
};

// Export named + default (both valid)
export { api };
export default api;

// ------------------------------
// SPECIAL CASE ENDPOINTS
// ------------------------------
export function postIncoming(data) {
  return apiInstance.post("/incoming", data, {
    headers: { Authorization: "" }, // incoming does NOT need auth
  });
}

export function postSales(data) {
  return apiInstance.post("/sales", data);
}
