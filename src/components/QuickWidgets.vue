<template>
  <div class="widgets-container">
    <h3 class="widgets-title">빠른 업데이트</h3>

    <!-- 금융 업데이트 위젯 -->
    <div class="widget-card finance" @click="goToFinance">
      <div class="widget-header">
        <i class="fas fa-chart-line"></i>
        <span>금융 업데이트</span>
      </div>
      <div class="widget-content">
        <div class="finance-item" v-for="item in financeUpdates" :key="item.name">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-value" :class="{ positive: item.change > 0, negative: item.change < 0 }">
            {{ item.value }} ({{ item.change > 0 ? '+' : '' }}{{ item.change }}%)
          </span>
        </div>
      </div>
    </div>

    <!-- 뉴스 헤드라인 위젯 -->
    <div class="widget-card news" @click="goToNews">
      <div class="widget-header">
        <i class="fas fa-newspaper"></i>
        <span>뉴스 헤드라인</span>
        <i class="fas fa-cog settings-icon" @click.stop="goToKeywordManager"></i>
      </div>
      <div class="widget-content">
        <div v-if="newsHeadlines.length > 0" class="news-list">
          <div class="news-item" v-for="item in newsHeadlines" :key="item.id">
            <span class="news-category">[{{ item.category }}]</span>
            <span class="news-title">{{ item.title }}</span>
            <span class="news-time">{{ item.time }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>관심 키워드를 설정하면<br>맞춤 뉴스를 볼 수 있습니다</p>
          <button @click.stop="goToKeywordManager" class="setup-btn">
            키워드 설정하기
          </button>
        </div>
      </div>
    </div>

    <!-- 식단 추천 위젯 -->
    <div class="widget-card diet" @click="goToDiet">
      <div class="widget-header">
        <i class="fas fa-utensils"></i>
        <span>오늘의 식단 추천</span>
      </div>
      <div class="widget-content">
        <div class="diet-item" v-for="item in dietRecommendations" :key="item.meal">
          <span class="meal-type">{{ item.meal }}</span>
          <span class="meal-menu">{{ item.menu }}</span>
          <span class="meal-calories">{{ item.calories }}kcal</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '../stores/newsStore'
import yahooFinanceService from '@/services/yahooFinanceService'

const router = useRouter()
const newsStore = useNewsStore()

const financeUpdates = ref([
  { name: '국민은행 정기예금', value: '3.5%', change: 0.2 },
  { name: 'KOSPI', value: '로딩 중...', change: 0 },
  { name: 'KB Star 펀드', value: '+5.2%', change: 1.3 }
])

let kospiUpdateInterval = null

// 키워드 기반 필터링된 뉴스 사용
const newsHeadlines = computed(() => newsStore.filteredNews)

const dietRecommendations = ref([
  { meal: '아침', menu: '오트밀 + 바나나', calories: 320 },
  { meal: '점심', menu: '현미밥 + 연어구이', calories: 580 },
  { meal: '저녁', menu: '샐러드 + 닭가슴살', calories: 450 }
])

const goToFinance = () => router.push('/finance')
const goToNews = () => router.push('/news')
const goToDiet = () => router.push('/diet-plan')
const goToKeywordManager = () => router.push('/news-keyword-manager')

// 코스피 데이터 가져오기
const fetchKospiData = async () => {
  try {
    const quote = await yahooFinanceService.getKospiQuote()

    if (quote) {
      const currentPrice = quote.regularMarketPrice
      const previousClose = quote.regularMarketPreviousClose
      const priceChange = currentPrice - previousClose
      const priceChangePercent = ((priceChange / previousClose) * 100).toFixed(2)

      // KOSPI 항목 업데이트
      financeUpdates.value[1] = {
        name: 'KOSPI',
        value: currentPrice.toLocaleString(),
        change: parseFloat(priceChangePercent)
      }
    }
  } catch (error) {
    console.error('코스피 데이터 가져오기 실패:', error)
    financeUpdates.value[1] = {
      name: 'KOSPI',
      value: '데이터 없음',
      change: 0
    }
  }
}

// 초기화: 백엔드에서 키워드와 뉴스 로드
onMounted(async () => {
  await newsStore.initialize()

  // 코스피 데이터 즉시 가져오기
  await fetchKospiData()

  // 60초마다 코스피 데이터 업데이트
  kospiUpdateInterval = setInterval(async () => {
    await fetchKospiData()
  }, 60000)
})

// 컴포넌트 언마운트 시 인터벌 정리
onUnmounted(() => {
  if (kospiUpdateInterval) {
    clearInterval(kospiUpdateInterval)
  }
})
</script>

<style scoped>
.widgets-container {
  margin: 1rem 0;
}

.widgets-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.widget-card {
  background: linear-gradient(135deg, #1a2a35 0%, #0f1e25 100%);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  font-size: 15px;
  color: white;
}

.widget-header span {
  flex: 1;
}

.widget-header i {
  font-size: 18px;
}

.settings-icon {
  font-size: 16px !important;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.25rem;
}

.settings-icon:hover {
  color: #60a5fa;
}

.widget-card.finance .widget-header i {
  color: #4ade80;
}

.widget-card.news .widget-header i {
  color: #60a5fa;
}

.widget-card.diet .widget-header i {
  color: #fbbf24;
}

.widget-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.finance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.finance-item:last-child {
  border-bottom: none;
}

.item-name {
  font-size: 13px;
  color: #d1d5db;
}

.item-value {
  font-size: 13px;
  font-weight: 600;
}

.item-value.positive {
  color: #4ade80;
}

.item-value.negative {
  color: #f87171;
}

.news-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.news-item:last-child {
  border-bottom: none;
}

.news-category {
  font-size: 11px;
  color: #60a5fa;
  font-weight: 600;
}

.news-title {
  font-size: 13px;
  color: white;
  line-height: 1.4;
}

.news-time {
  font-size: 11px;
  color: #9ca3af;
}

.diet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.diet-item:last-child {
  border-bottom: none;
}

.meal-type {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  min-width: 40px;
}

.meal-menu {
  flex: 1;
  font-size: 13px;
  color: white;
  margin: 0 0.5rem;
}

.meal-calories {
  font-size: 12px;
  color: #9ca3af;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 36px;
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.setup-btn {
  background: #60a5fa;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.setup-btn:hover {
  background: #3b82f6;
  transform: scale(1.05);
}
</style>
