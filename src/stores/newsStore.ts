import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Keyword {
  id: number
  text: string
}

export interface NewsItem {
  id?: number
  category?: string
  title: string
  time?: string
  keywords?: string[]
  source?: string
  published_at?: string
  description?: string
  url?: string
  image_url?: string
}

const API_BASE_URL = 'http://localhost:8000/api/news'

export const useNewsStore = defineStore('news', () => {
  // 관심 키워드 (백엔드 API에서 가져옴)
  const interestedKeywords = ref<string[]>([])
  const excludedKeywords = ref<string[]>([])
  const newsArticles = ref<NewsItem[]>([])
  const isLoading = ref(false)

  // 추천 키워드
  const recommendedKeywords = ref<string[]>([
    '의료',
    '재테크',
    '연금',
    'AI',
    '스마트홈',
    '실버산업',
    '코스피',
    'KOSPI'
  ])

  // 사용자 키워드 가져오기
  const fetchUserKeywords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/keywords/user`)
      interestedKeywords.value = response.data.keywords || []
      console.log('📋 [newsStore] 백엔드에서 키워드 로드:', interestedKeywords.value)
    } catch (error) {
      console.error('키워드 불러오기 실패:', error)
      interestedKeywords.value = []
    }
  }

  // 뉴스 기사 가져오기
  const fetchNews = async () => {
    isLoading.value = true
    try {
      const params: any = {}

      // 등록된 키워드가 있으면 모든 키워드로 검색
      if (interestedKeywords.value.length > 0) {
        params.keyword = interestedKeywords.value.join(',')
      }

      params.limit = 5  // QuickWidgets에서는 최대 5개만 표시

      const response = await axios.get(`${API_BASE_URL}/articles`, { params })
      newsArticles.value = response.data.articles || []
      console.log('📰 [newsStore] 뉴스 로드:', newsArticles.value.length, '개')
    } catch (error) {
      console.error('뉴스 불러오기 실패:', error)
      newsArticles.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 필터링된 뉴스 (computed)
  const filteredNews = computed(() => {
    return newsArticles.value.map(article => ({
      id: article.id || 0,
      category: article.source || '뉴스',
      title: article.title,
      time: formatTimeAgo(article.published_at),
      keywords: []
    }))
  })

  // 시간 포맷팅 헬퍼
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}분 전`
    } else if (hours < 24) {
      return `${hours}시간 전`
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
  }

  // 관심 키워드 추가
  const addInterestedKeyword = async (text: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/keywords/custom?keyword=${encodeURIComponent(text)}`)
      if (response.data.success) {
        await fetchUserKeywords()
        await fetchNews()
        console.log('💾 관심 키워드 저장됨:', text)
      } else {
        console.error('키워드 추가 실패:', response.data.message)
      }
    } catch (error) {
      console.error('키워드 추가 실패:', error)
    }
  }

  // 제외 키워드 추가 (현재 백엔드에서 미지원)
  const addExcludedKeyword = (text: string) => {
    console.warn('제외 키워드는 현재 백엔드에서 지원하지 않습니다')
  }

  // 관심 키워드 제거
  const removeInterestedKeyword = async (keyword: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/keywords/custom?keyword=${encodeURIComponent(keyword)}`)
      if (response.data.success) {
        await fetchUserKeywords()
        await fetchNews()
        console.log('🗑️ 관심 키워드 제거됨:', keyword)
      }
    } catch (error) {
      console.error('키워드 삭제 실패:', error)
    }
  }

  // 제외 키워드 제거 (현재 백엔드에서 미지원)
  const removeExcludedKeyword = (keyword: string) => {
    console.warn('제외 키워드는 현재 백엔드에서 지원하지 않습니다')
  }

  // 추천 키워드를 관심 키워드에 추가
  const addRecommendedToInterested = async (keyword: string) => {
    await addInterestedKeyword(keyword)
    const index = recommendedKeywords.value.indexOf(keyword)
    if (index > -1) {
      recommendedKeywords.value.splice(index, 1)
    }
  }

  // 초기화 함수
  const initialize = async () => {
    await fetchUserKeywords()
    await fetchNews()
  }

  return {
    interestedKeywords,
    excludedKeywords,
    recommendedKeywords,
    newsArticles,
    filteredNews,
    isLoading,
    fetchUserKeywords,
    fetchNews,
    addInterestedKeyword,
    addExcludedKeyword,
    removeInterestedKeyword,
    removeExcludedKeyword,
    addRecommendedToInterested,
    initialize
  }
})
