import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = 'http://localhost:8080'

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request 인터셉터 - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    // 회원가입 및 로그인 엔드포인트는 토큰 불필요
    const url = config.url || ''
    const isPublicEndpoint =
      url.startsWith('/register/') ||
      url === '/login' ||
      url.includes('/google/oauth/callback')

    console.log('API Request:', url, 'isPublicEndpoint:', isPublicEndpoint)

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('jwt_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Added Authorization header')
      } else {
        console.log('No token found')
      }
    } else {
      console.log('Public endpoint - no token needed')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('jwt_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
