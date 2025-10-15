import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'
import * as CryptoJS from 'crypto-js'

export interface UserInfo {
  fullName: string
  username: string
  phone: string
  email: string
  avatar: string
}

export interface UserSettings {
  selectedLanguage: string
  permissions: {
    healthInfo: boolean
    financialInfo: boolean
    calendarLocation: boolean
    socialAccounts: boolean
  }
  notifications: {
    security: boolean
    sharing: boolean
    alerts: boolean
  }
}

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo>({
    fullName: '',
    username: '',
    phone: '+91 23 456 7890',
    email: 'randommail@mail.me',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
  })

  const userSettings = ref<UserSettings>({
    selectedLanguage: 'nl',
    permissions: {
      healthInfo: true,
      financialInfo: true,
      calendarLocation: true,
      socialAccounts: true
    },
    notifications: {
      security: true,
      sharing: true,
      alerts: false
    }
  })

  const isLoggedIn = ref(false)

  // Getters
  const displayName = computed(() => {
    return userInfo.value.fullName || userInfo.value.username || 'User'
  })

  const isProfileComplete = computed(() => {
    return !!(userInfo.value.fullName && userInfo.value.username)
  })

  // Actions
  const updateUserInfo = (info: Partial<UserInfo>) => {
    userInfo.value = { ...userInfo.value, ...info }
  }

  const updateSettings = (settings: Partial<UserSettings>) => {
    userSettings.value = { ...userSettings.value, ...settings }
  }

  const updatePermissions = (permissions: Partial<UserSettings['permissions']>) => {
    userSettings.value.permissions = { ...userSettings.value.permissions, ...permissions }
  }

  const updateNotifications = (notifications: Partial<UserSettings['notifications']>) => {
    userSettings.value.notifications = { ...userSettings.value.notifications, ...notifications }
  }

  const login = async (username: string, password: string) => {
    try {
      // 개발 환경 테스트용 임시 로그인 (백엔드 없이 테스트 가능)
      const DEV_TEST_MODE = true // 백엔드 연동 시 false로 변경

      if (DEV_TEST_MODE) {
        // 테스트 계정: test / test123
        if (username === 'test' && password === 'test123') {
          isLoggedIn.value = true
          userInfo.value.username = username
          userInfo.value.fullName = 'Test User'
          // 임시 토큰 저장
          localStorage.setItem('jwt_token', 'dev_test_token_' + Date.now())
          console.log('🧪 개발 모드: 테스트 로그인 성공')
          return true
        } else {
          console.log('🧪 개발 모드: 테스트 계정 - ID: test, PW: test123')
          return false
        }
      }

      // 프로덕션: 백엔드 API 호출
      const passwordHash = CryptoJS.SHA256(password).toString()
      const response = await authService.login(username, passwordHash)

      if (response.token) {
        isLoggedIn.value = true
        userInfo.value.username = username
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      isLoggedIn.value = false
      userInfo.value = {
        fullName: '',
        username: '',
        phone: '',
        email: '',
        avatar: ''
      }
    }
  }

  // 회원가입 관련 함수들
  const registrationId = ref<string>('')

  const startRegister = async (language: string) => {
    try {
      // Clear any existing token before starting registration
      localStorage.removeItem('jwt_token')

      const response = await authService.startRegister(language)
      registrationId.value = response.registrationId
      return response
    } catch (error) {
      console.error('Start register failed:', error)
      throw error
    }
  }

  const saveConsents = async (consents: {
    consentHealth: boolean
    consentFinance: boolean
    consentSocial: boolean
    consentClp: boolean
  }) => {
    try {
      await authService.saveConsents({
        registrationId: registrationId.value,
        ...consents
      })
    } catch (error) {
      console.error('Save consents failed:', error)
      throw error
    }
  }

  const saveProfile = async (name: string, nickname: string) => {
    try {
      await authService.saveProfile({
        registrationId: registrationId.value,
        name,
        nickname
      })
      userInfo.value.fullName = name
      userInfo.value.username = nickname
    } catch (error) {
      console.error('Save profile failed:', error)
      throw error
    }
  }

  const finalizeRegistration = async (userid: string, password: string, issueToken: boolean = true) => {
    try {
      const passwordHash = CryptoJS.SHA256(password).toString()
      const response = await authService.finalizeRegistration({
        registrationId: registrationId.value,
        userid,
        passwordHash,
        issueToken
      })

      if (response.token) {
        isLoggedIn.value = true
        userInfo.value.username = userid
      }

      return response
    } catch (error) {
      console.error('Finalize registration failed:', error)
      throw error
    }
  }

  // 초기화 시 토큰 확인
  const checkAuth = () => {
    isLoggedIn.value = authService.isAuthenticated()
  }

  checkAuth()

  const setLanguage = (language: string) => {
    userSettings.value.selectedLanguage = language
  }

  return {
    // State
    userInfo,
    userSettings,
    isLoggedIn,
    registrationId,

    // Getters
    displayName,
    isProfileComplete,

    // Actions
    updateUserInfo,
    updateSettings,
    updatePermissions,
    updateNotifications,
    login,
    logout,
    setLanguage,
    checkAuth,

    // Registration
    startRegister,
    saveConsents,
    saveProfile,
    finalizeRegistration
  }
})