<template>
  <div class="notification-settings-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>알림 설정</h2>
      <span></span>
    </div>

    <!-- 전체 알림 -->
    <div class="setting-section">
      <div class="setting-item master">
        <div class="setting-info">
          <h3>전체 알림</h3>
          <p>모든 알림을 한번에 켜거나 끌 수 있습니다</p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="masterNotification" @change="toggleMaster" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- 카테고리별 알림 -->
    <div class="setting-section">
      <h3 class="section-title">카테고리별 알림</h3>

      <div class="setting-item" v-for="category in categories" :key="category.id">
        <div class="setting-info">
          <div class="category-header">
            <i :class="category.icon" :style="{ color: category.color }"></i>
            <h4>{{ category.name }}</h4>
          </div>
          <p>{{ category.description }}</p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="category.enabled" :disabled="!masterNotification" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- 알림 주기 설정 -->
    <div class="setting-section">
      <h3 class="section-title">알림 주기</h3>

      <div class="frequency-options">
        <button
          v-for="freq in frequencies"
          :key="freq.value"
          :class="['frequency-btn', { active: selectedFrequency === freq.value }]"
          @click="selectedFrequency = freq.value"
        >
          {{ freq.label }}
        </button>
      </div>
    </div>

    <!-- 알림 시간대 설정 -->
    <div class="setting-section">
      <h3 class="section-title">알림 시간대</h3>
      <p class="section-desc">알림을 받을 시간대를 설정하세요</p>

      <div class="time-range">
        <div class="time-input">
          <label>시작 시간</label>
          <input type="time" v-model="notificationTimeRange.start" />
        </div>
        <span class="divider">~</span>
        <div class="time-input">
          <label>종료 시간</label>
          <input type="time" v-model="notificationTimeRange.end" />
        </div>
      </div>
    </div>

    <!-- 알림음 설정 -->
    <div class="setting-section">
      <h3 class="section-title">알림음</h3>

      <div class="sound-options">
        <div
          v-for="sound in sounds"
          :key="sound.id"
          :class="['sound-option', { selected: selectedSound === sound.id }]"
          @click="selectSound(sound.id)"
        >
          <span>{{ sound.name }}</span>
          <button class="play-btn" @click.stop="playSound(sound.id)">
            <i class="fas fa-play"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 저장 버튼 -->
    <div class="actions">
      <button class="save-btn" @click="saveSettings">설정 저장</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const masterNotification = ref(true)

const categories = ref([
  {
    id: 'health',
    name: '건강',
    icon: 'fas fa-heartbeat',
    color: '#ef4444',
    description: '복약 알림, 건강 리포트',
    enabled: true
  },
  {
    id: 'calendar',
    name: '일정',
    icon: 'fas fa-calendar-alt',
    color: '#60a5fa',
    description: '다가오는 일정, 일정 변경',
    enabled: true
  },
  {
    id: 'finance',
    name: '금융',
    icon: 'fas fa-chart-line',
    color: '#4ade80',
    description: '금리 변동, 신규 상품',
    enabled: true
  },
  {
    id: 'news',
    name: '뉴스',
    icon: 'fas fa-newspaper',
    color: '#fbbf24',
    description: '관심 키워드 뉴스',
    enabled: false
  },
  {
    id: 'price',
    name: '가격/식단',
    icon: 'fas fa-shopping-basket',
    color: '#a855f7',
    description: '가격 변동, 식단 추천',
    enabled: true
  }
])

const frequencies = [
  { value: 'realtime', label: '실시간' },
  { value: 'hourly', label: '1시간마다' },
  { value: 'daily', label: '하루 1회' },
  { value: 'weekly', label: '주 1회' }
]

const selectedFrequency = ref('realtime')

const notificationTimeRange = ref({
  start: '08:00',
  end: '22:00'
})

const sounds = ref([
  { id: 1, name: '기본음' },
  { id: 2, name: '종소리' },
  { id: 3, name: '피아노' },
  { id: 4, name: '무음' }
])

const selectedSound = ref(1)

const toggleMaster = () => {
  if (!masterNotification.value) {
    categories.value.forEach(cat => cat.enabled = false)
  }
}

const selectSound = (soundId) => {
  selectedSound.value = soundId
}

const playSound = (soundId) => {
  alert(`알림음 ${soundId}번을 재생합니다`)
}

const saveSettings = () => {
  alert('알림 설정이 저장되었습니다!')
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.notification-settings-page {
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

.setting-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.setting-item {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.setting-item.master {
  background: linear-gradient(135deg, #1a2a35 0%, #253d47 100%);
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.setting-info {
  flex: 1;
}

.setting-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.setting-info h4 {
  font-size: 14px;
  font-weight: 600;
}

.setting-info p {
  font-size: 12px;
  color: #9ca3af;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.category-header i {
  font-size: 16px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #6b7280;
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4ade80;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.frequency-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.frequency-btn {
  background: #1a2a35;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.frequency-btn.active {
  background: #60a5fa;
  border-color: #60a5fa;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #1a2a35;
  padding: 1rem;
  border-radius: 12px;
}

.time-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-input label {
  font-size: 12px;
  color: #9ca3af;
}

.time-input input {
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 14px;
}

.divider {
  color: #9ca3af;
  font-size: 16px;
  margin-top: 1.5rem;
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.sound-option {
  background: #1a2a35;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sound-option:hover {
  background: #253d47;
}

.sound-option.selected {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.play-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, #0f1e25 80%, transparent);
}

.save-btn {
  width: 100%;
  background: #4ade80;
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
}
</style>
