<template>
  <div class="diet-plan-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>맞춤 식단 추천</h2>
      <button class="settings-btn" @click="goToNutritionGoals">
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <!-- 기저질환 기반 추천 -->
    <div class="health-alert" v-if="healthConditions.length > 0">
      <i class="fas fa-info-circle"></i>
      <span>{{ healthConditions.join(', ') }}을(를) 고려한 식단입니다</span>
    </div>

    <!-- 오늘의 추천 식단 -->
    <div class="daily-plan">
      <h3>오늘의 식단</h3>
      <div class="meal-card" v-for="meal in todayMeals" :key="meal.id">
        <div class="meal-header">
          <span class="meal-time">{{ meal.time }}</span>
          <span class="meal-calories">{{ meal.calories }}kcal</span>
        </div>
        <div class="meal-items">
          <div class="food-item" v-for="food in meal.foods" :key="food.name">
            <span class="food-emoji">{{ food.emoji }}</span>
            <div class="food-details">
              <span class="food-name">{{ food.name }}</span>
              <span class="food-amount">{{ food.amount }}</span>
            </div>
          </div>
        </div>
        <div class="meal-benefits">
          <span class="benefit-tag" v-for="benefit in meal.benefits" :key="benefit">
            {{ benefit }}
          </span>
        </div>
      </div>
    </div>

    <!-- 대체 식품 제안 -->
    <div class="alternatives-section">
      <h3>대체 식품 제안</h3>
      <p class="section-desc">같은 영양가를 가진 다른 식품을 선택하실 수 있습니다</p>
      <div class="alternative-card" v-for="alt in alternatives" :key="alt.id">
        <div class="original">
          <span class="emoji">{{ alt.original.emoji }}</span>
          <span class="name">{{ alt.original.name }}</span>
        </div>
        <i class="fas fa-arrow-right arrow"></i>
        <div class="replacement">
          <span class="emoji">{{ alt.replacement.emoji }}</span>
          <span class="name">{{ alt.replacement.name }}</span>
          <span class="reason">{{ alt.reason }}</span>
        </div>
        <button class="swap-btn" @click="swapFood(alt)">
          <i class="fas fa-exchange-alt"></i>
        </button>
      </div>
    </div>

    <!-- 주간 식단표 -->
    <div class="weekly-plan">
      <h3>주간 식단표</h3>
      <div class="week-selector">
        <button @click="previousWeek">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>{{ currentWeek }}</span>
        <button @click="nextWeek">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="week-grid">
        <div class="day-column" v-for="day in weekDays" :key="day.date">
          <div class="day-header">{{ day.name }}</div>
          <div class="day-meals">
            <div class="mini-meal" v-for="meal in day.meals" :key="meal">
              {{ meal }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const healthConditions = ref(['당뇨', '고혈압'])

const todayMeals = ref([
  {
    id: 1,
    time: '아침 (08:00)',
    calories: 450,
    foods: [
      { name: '현미밥', emoji: '🍚', amount: '1공기 (210g)' },
      { name: '된장찌개', emoji: '🍲', amount: '1그릇' },
      { name: '시금치나물', emoji: '🥬', amount: '1접시' }
    ],
    benefits: ['저염', '고섬유질', '혈당조절']
  },
  {
    id: 2,
    time: '점심 (12:30)',
    calories: 580,
    foods: [
      { name: '잡곡밥', emoji: '🍚', amount: '1공기' },
      { name: '닭가슴살구이', emoji: '🍗', amount: '150g' },
      { name: '브로콜리', emoji: '🥦', amount: '1컵' },
      { name: '토마토샐러드', emoji: '🥗', amount: '1접시' }
    ],
    benefits: ['고단백', '저지방', '항산화']
  },
  {
    id: 3,
    time: '저녁 (18:00)',
    calories: 520,
    foods: [
      { name: '귀리밥', emoji: '🌾', amount: '1공기' },
      { name: '연어구이', emoji: '🐟', amount: '120g' },
      { name: '시금치샐러드', emoji: '🥗', amount: '1접시' }
    ],
    benefits: ['오메가3', '저칼로리', '심혈관건강']
  }
])

const alternatives = ref([
  {
    id: 1,
    original: { name: '흰쌀밥', emoji: '🍚' },
    replacement: { name: '현미밥', emoji: '🌾' },
    reason: '혈당 조절에 도움'
  },
  {
    id: 2,
    original: { name: '돼지고기', emoji: '🥓' },
    replacement: { name: '닭가슴살', emoji: '🍗' },
    reason: '저지방 고단백'
  },
  {
    id: 3,
    original: { name: '바나나', emoji: '🍌' },
    replacement: { name: '사과', emoji: '🍎' },
    reason: '낮은 GI 지수'
  }
])

const currentWeek = ref('11월 1주차')

const weekDays = ref([
  { name: '월', date: 4, meals: ['🍚', '🍗', '🥗'] },
  { name: '화', date: 5, meals: ['🌾', '🐟', '🥦'] },
  { name: '수', date: 6, meals: ['🍚', '🥩', '🥬'] },
  { name: '목', date: 7, meals: ['🌾', '🍗', '🥗'] },
  { name: '금', date: 8, meals: ['🍚', '🐟', '🥦'] },
  { name: '토', date: 9, meals: ['🌾', '🥩', '🥬'] },
  { name: '일', date: 10, meals: ['🍚', '🍗', '🥗'] }
])

const swapFood = (alt) => {
  alert(`${alt.original.name}을(를) ${alt.replacement.name}(으)로 변경합니다!`)
}

const previousWeek = () => {
  alert('이전 주 식단')
}

const nextWeek = () => {
  alert('다음 주 식단')
}

const goBack = () => router.go(-1)
const goToNutritionGoals = () => router.push('/nutrition-goals')
</script>

<style scoped>
.diet-plan-page {
  background-color: #0f1e25;
  color: white;
  min-height: 100vh;
  padding: 1rem;
  padding-bottom: 5rem;
  font-family: 'Noto Sans KR', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 20px;
  font-weight: 700;
}

.back-btn {
  color: #60a5fa;
  cursor: pointer;
  font-size: 14px;
}

.settings-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.health-alert {
  background: rgba(251, 191, 36, 0.2);
  border-left: 3px solid #fbbf24;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  color: #fbbf24;
}

.daily-plan h3,
.alternatives-section h3,
.weekly-plan h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.meal-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.meal-time {
  font-size: 14px;
  font-weight: 600;
}

.meal-calories {
  font-size: 13px;
  color: #4ade80;
  font-weight: 600;
}

.meal-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.food-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.food-emoji {
  font-size: 24px;
}

.food-details {
  display: flex;
  flex-direction: column;
}

.food-name {
  font-size: 13px;
  font-weight: 600;
}

.food-amount {
  font-size: 12px;
  color: #9ca3af;
}

.meal-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.benefit-tag {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.alternatives-section {
  margin: 2rem 0;
}

.alternative-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.original,
.replacement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.alternative-card .emoji {
  font-size: 32px;
}

.alternative-card .name {
  font-size: 13px;
  font-weight: 600;
}

.alternative-card .reason {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}

.arrow {
  color: #60a5fa;
  font-size: 16px;
}

.swap-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: auto;
}

.weekly-plan {
  margin-top: 2rem;
}

.week-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #1a2a35;
  border-radius: 8px;
}

.week-selector button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0.5rem;
}

.week-selector span {
  font-size: 14px;
  font-weight: 600;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-column {
  background: #1a2a35;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
}

.day-header {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-meals {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mini-meal {
  font-size: 18px;
}
</style>
