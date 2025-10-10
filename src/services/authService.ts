import apiClient from './api'

export interface StartRegisterReq {
  language: string
}

export interface StartRegisterRes {
  registrationId: string
}

export interface ConsentsReq {
  registrationId: string
  consentHealth: boolean
  consentFinance: boolean
  consentSocial: boolean
  consentClp: boolean
}

export interface ProfileReq {
  registrationId: string
  name: string
  nickname: string
}

export interface CredentialsReq {
  registrationId: string
  userid: string
  passwordHash: string
  issueToken: boolean
}

export interface TokenRes {
  token: string | null
}

export interface LoginReq {
  userid: string
  passwordHash: string
}

class AuthService {
  // 회원가입 시작
  async startRegister(language: string): Promise<StartRegisterRes> {
    const response = await apiClient.post<StartRegisterRes>('/register/start', { language })
    return response.data
  }

  // 동의 사항 저장
  async saveConsents(req: ConsentsReq): Promise<void> {
    await apiClient.post('/register/consents', req)
  }

  // 프로필 저장
  async saveProfile(req: ProfileReq): Promise<void> {
    await apiClient.post('/register/profile', req)
  }

  // 회원가입 완료
  async finalizeRegistration(req: CredentialsReq): Promise<TokenRes> {
    const response = await apiClient.post<TokenRes>('/register/credentials', req)
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token)
    }
    return response.data
  }

  // 로그인
  async login(userid: string, passwordHash: string): Promise<TokenRes> {
    const response = await apiClient.post<TokenRes>('/login', { userid, passwordHash })
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token)
    }
    return response.data
  }

  // 로그아웃
  async logout(): Promise<void> {
    await apiClient.post('/logout')
    localStorage.removeItem('jwt_token')
  }

  // 토큰 확인
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token')
  }

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem('jwt_token')
  }
}

export default new AuthService()
