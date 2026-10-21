import axios from "axios"
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
})
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthRequest = error.config?.url?.startsWith("/auth/")
    if (error.response?.status === 401 && typeof window !== "undefined" && !isAuthRequest) {
      localStorage.removeItem("token")
      localStorage.removeItem("auth-storage")
      window.location.replace("/login")
    }
    return Promise.reject(error)
  }
)
export default api

export function apiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const detail: unknown = error.response?.data?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg).filter((message): message is string => typeof message === "string")
    if (messages.length) return messages.join(" ")
  }
  return fallback
}
