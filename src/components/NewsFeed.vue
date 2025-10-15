<template>
  <div class="news-feed">
    <!-- 상단 헤더 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
      <h2>뉴스</h2>
      <button class="keyword-btn" @click="showKeywordManager = !showKeywordManager">
        <i class="fas fa-tags"></i>
      </button>
    </div>

    <!-- 키워드 관리 섹션 -->
    <div v-if="showKeywordManager" class="keyword-manager">
      <div class="keyword-input">
        <input
          v-model="newKeyword"
          type="text"
          placeholder="관심 키워드 입력..."
          @keyup.enter="addKeyword"
        />
        <button @click="addKeyword" class="add-btn">
          <i class="fas fa-plus"></i> 추가
        </button>
      </div>
      <div v-if="userKeywords.length > 0" class="keyword-list">
        <div v-for="keyword in userKeywords" :key="keyword" class="keyword-tag"
             :class="{ active: selectedKeyword === keyword }"
             @click="selectKeyword(keyword)">
          {{ keyword }}
          <i class="fas fa-times" @click.stop="deleteKeyword(keyword)"></i>
        </div>
      </div>
      <p v-else class="empty-message">등록된 키워드가 없습니다</p>
    </div>

    <!-- 선택된 키워드 표시 -->
    <div v-if="selectedKeyword" class="selected-keyword">
      <span>{{ selectedKeyword }}</span>
      <i class="fas fa-times" @click="clearKeyword"></i>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 뉴스 불러오는 중...
    </div>

    <!-- 뉴스 카드 목록 -->
    <div v-else>
      <div v-if="newsArticles.length === 0" class="no-news">
        <i class="fas fa-newspaper"></i>
        <p>표시할 뉴스가 없습니다</p>
      </div>

      <div v-for="(article, index) in newsArticles" :key="index" class="news-card" @click="openArticleModal(article)">
        <div class="card-header">
          <div class="icon-circle"><i class="fas fa-newspaper"></i></div>
          <div class="news-info">
            <div class="title">{{ article.source }}</div>
            <div class="time">{{ formatDate(article.published_at) }}</div>
          </div>
        </div>

        <div class="content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p v-if="article.description" class="article-description">
            {{ article.description }}
          </p>

          <div v-if="article.image_url" class="article-image">
            <img :src="article.image_url" :alt="article.title" @error="onImageError" />
          </div>
        </div>

        <!-- 하단 버튼들 -->
        <div class="card-actions">
          <button class="read-more-btn" @click.stop="openArticleModal(article)">
            <i class="fas fa-book-open"></i> 자세히 보기
          </button>
          <button class="tts-btn" @click.stop="readArticle(index, article)" :class="{ active: isReading === index }">
            <i :class="isReading === index ? 'fas fa-stop' : 'fas fa-volume-up'"></i>
            {{ isReading === index ? '중지' : '읽어주기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 기사 상세 모달 -->
    <div v-if="selectedArticle" class="article-modal-overlay" @click="closeArticleModal">
      <div class="article-modal" @click.stop>
        <div class="modal-header">
          <button class="close-btn" @click="closeArticleModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <div class="modal-source">
            <span class="source-badge">{{ selectedArticle.source }}</span>
            <span class="source-time">{{ formatDate(selectedArticle.published_at) }}</span>
          </div>

          <h2 class="modal-title">{{ selectedArticle.title }}</h2>

          <div v-if="selectedArticle.image_url" class="modal-image">
            <img :src="selectedArticle.image_url" :alt="selectedArticle.title" @error="onImageError" />
          </div>

          <div class="modal-body">
            <p v-if="selectedArticle.content">{{ selectedArticle.content }}</p>
            <p v-else-if="selectedArticle.description">{{ selectedArticle.description }}</p>
            <p v-else class="no-content">기사 내용을 불러올 수 없습니다.</p>
          </div>

          <div class="modal-actions">
            <a :href="selectedArticle.url" target="_blank" class="original-link-btn">
              <i class="fas fa-external-link-alt"></i> 원문 보기
            </a>
            <button class="modal-tts-btn" @click="readFullArticle(selectedArticle)" :class="{ active: isReadingModal }">
              <i :class="isReadingModal ? 'fas fa-stop' : 'fas fa-volume-up'"></i>
              {{ isReadingModal ? '중지' : '읽어주기' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const isReading = ref(null)
const isReadingModal = ref(false)
const showKeywordManager = ref(false)
const newKeyword = ref('')
const userKeywords = ref([])
const selectedKeyword = ref(null)
const newsArticles = ref([])
const isLoading = ref(false)
const selectedArticle = ref(null)

const API_BASE_URL = 'http://localhost:8000/api/news'

// 사용자 키워드 가져오기
const fetchUserKeywords = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/keywords/user`)
    userKeywords.value = response.data.keywords
  } catch (error) {
    console.error('키워드 불러오기 실패:', error)
  }
}

// 뉴스 기사 가져오기
const fetchNews = async () => {
  isLoading.value = true
  try {
    const params = {}

    // 선택된 키워드가 있으면 우선 사용
    if (selectedKeyword.value) {
      params.keyword = selectedKeyword.value
    }
    // 선택된 키워드가 없지만 등록된 키워드가 있으면 모든 키워드로 검색 (OR 조건)
    else if (userKeywords.value.length > 0) {
      params.keyword = userKeywords.value.join(',')
    }

    params.limit = 20

    const response = await axios.get(`${API_BASE_URL}/articles`, { params })
    newsArticles.value = response.data.articles
  } catch (error) {
    console.error('뉴스 불러오기 실패:', error)
    newsArticles.value = []
  } finally {
    isLoading.value = false
  }
}

// 키워드 추가
const addKeyword = async () => {
  if (!newKeyword.value.trim()) return

  try {
    const response = await axios.post(`${API_BASE_URL}/keywords/custom?keyword=${encodeURIComponent(newKeyword.value)}`)
    if (response.data.success) {
      await fetchUserKeywords()
      newKeyword.value = ''
      // 등록된 키워드로 뉴스 다시 불러오기
      await fetchNews()
    } else {
      alert(response.data.message)
    }
  } catch (error) {
    console.error('키워드 추가 실패:', error)
    alert('키워드 추가에 실패했습니다')
  }
}

// 키워드 삭제
const deleteKeyword = async (keyword) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/keywords/custom?keyword=${encodeURIComponent(keyword)}`)
    if (response.data.success) {
      await fetchUserKeywords()
      if (selectedKeyword.value === keyword) {
        selectedKeyword.value = null
      }
      // 등록된 키워드로 뉴스 다시 불러오기
      await fetchNews()
    }
  } catch (error) {
    console.error('키워드 삭제 실패:', error)
  }
}

// 키워드 선택
const selectKeyword = (keyword) => {
  selectedKeyword.value = selectedKeyword.value === keyword ? null : keyword
  fetchNews()
}

// 키워드 클리어
const clearKeyword = () => {
  selectedKeyword.value = null
  fetchNews()
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
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

// 이미지 로드 실패 처리
const onImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
}

// TTS 읽어주기
const readArticle = (articleId, article) => {
  if (isReading.value === articleId) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isReading.value = null
  } else {
    if (window.speechSynthesis) {
      const text = `${article.title}. ${article.description || ''}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onend = () => {
        isReading.value = null
      }

      window.speechSynthesis.speak(utterance)
      isReading.value = articleId
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
    }
  }
}

const goBack = () => {
  router.go(-1)
}

// 기사 상세 모달 열기
const openArticleModal = (article) => {
  selectedArticle.value = article
}

// 기사 상세 모달 닫기
const closeArticleModal = () => {
  selectedArticle.value = null
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  isReadingModal.value = false
}

// 전체 기사 읽어주기
const readFullArticle = (article) => {
  if (isReadingModal.value) {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isReadingModal.value = false
  } else {
    if (window.speechSynthesis) {
      const text = `${article.title}. ${article.content || article.description || ''}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onend = () => {
        isReadingModal.value = false
      }

      window.speechSynthesis.speak(utterance)
      isReadingModal.value = true
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
    }
  }
}

// 초기 로드
onMounted(async () => {
  await fetchUserKeywords()
  await fetchNews()
})

// 선택된 키워드 변경 감지
watch(selectedKeyword, () => {
  fetchNews()
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.news-feed {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 1rem;
  padding-bottom: 100px;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 1rem;
}

.header h2 {
  font-size: 20px;
  font-weight: 700;
}

.back-btn {
  color: #ffc107;
  cursor: pointer;
}

.keyword-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.keyword-btn:hover {
  background: #3b82f6;
}

/* 키워드 관리 섹션 */
.keyword-manager {
  background-color: #1f2f39;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.keyword-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.keyword-input input {
  flex: 1;
  background: #2e3c46;
  border: none;
  outline: none;
  color: white;
  padding: 0.7rem;
  border-radius: 8px;
  font-size: 14px;
}

.keyword-input input::placeholder {
  color: #aaa;
}

.add-btn {
  background: #3dd598;
  border: none;
  color: #0f1e25;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #2db87c;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  background: #2e3c46;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.keyword-tag:hover {
  background: #3a4a56;
}

.keyword-tag.active {
  background: #3dd598;
  color: #0f1e25;
  font-weight: 600;
}

.keyword-tag i {
  font-size: 12px;
  opacity: 0.7;
}

.keyword-tag i:hover {
  opacity: 1;
}

.empty-message {
  color: #aaa;
  font-size: 14px;
  text-align: center;
  padding: 1rem 0;
}

/* 선택된 키워드 표시 */
.selected-keyword {
  background: #3dd598;
  color: #0f1e25;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.selected-keyword i {
  cursor: pointer;
  font-size: 16px;
}

/* 로딩 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #3dd598;
  font-size: 16px;
}

.loading i {
  margin-right: 0.5rem;
}

/* 뉴스 없음 */
.no-news {
  text-align: center;
  padding: 3rem 1rem;
  color: #aaa;
}

.no-news i {
  font-size: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 뉴스 카드 */
.news-card {
  background-color: #1f2f39;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.news-card:hover {
  background-color: #253d47;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.icon-circle {
  width: 36px;
  height: 36px;
  background-color: #e74c3c;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.8rem;
  flex-shrink: 0;
}

.news-info {
  flex: 1;
}

.news-info .title {
  font-weight: bold;
  font-size: 14px;
}

.news-info .time {
  font-size: 12px;
  color: #aaa;
}

/* 본문 */
.content {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  color: #fff;
}

.article-description {
  font-size: 14px;
  line-height: 1.5;
  color: #ccc;
  margin-bottom: 0.8rem;
}

.article-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 0.8rem;
}

.article-image img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
}

/* 액션 버튼 */
.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.read-more {
  color: #60a5fa;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.2s ease;
}

.read-more:hover {
  color: #3b82f6;
}

.read-more-btn {
  background: #60a5fa;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.read-more-btn:hover {
  background: #3b82f6;
}

.tts-btn {
  background: #8b5cf6;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tts-btn:hover {
  background: #7c3aed;
}

.tts-btn.active {
  background: #ef4444;
}

.tts-btn.active:hover {
  background: #dc2626;
}

/* 기사 상세 모달 */
.article-modal-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 390px;
  max-width: 390px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.article-modal {
  background: #1f2f39;
  border-radius: 20px;
  width: 90%;
  max-width: 350px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  background: #2a3f4d;
  border-bottom: 1px solid #3a4f5d;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-source {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.source-badge {
  background: #e74c3c;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.source-time {
  color: #aaa;
  font-size: 12px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.modal-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.modal-image img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: cover;
}

.modal-body {
  color: #ddd;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
  word-break: keep-all;
}

.modal-body p {
  margin: 0;
}

.no-content {
  color: #aaa;
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #3a4f5d;
}

.original-link-btn {
  flex: 1;
  background: #3dd598;
  color: #0f1e25;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.original-link-btn:hover {
  background: #2db87c;
  transform: translateY(-2px);
}

.modal-tts-btn {
  flex: 1;
  background: #8b5cf6;
  border: none;
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.modal-tts-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

.modal-tts-btn.active {
  background: #ef4444;
}

.modal-tts-btn.active:hover {
  background: #dc2626;
}
</style>
