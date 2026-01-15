import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api", // change if needed
  headers: {
    "Content-Type": "application/json",
  },
})

// Optional: attach token if you use auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

export const directPayout = (data) => api.post("/auth/payout-direct", data);
