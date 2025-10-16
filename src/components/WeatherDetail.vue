<template>
  <div class="weather-detail-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>날씨 상세</h2>
      <span class="refresh-btn" @click="loadWeatherData" v-if="!loading">🔄</span>
    </div>

    <!-- 위치 권한 요청 안내 -->
    <div v-if="showLocationPermission" class="permission-container">
      <div class="permission-icon">📍</div>
      <h3>위치 권한이 필요합니다</h3>
      <p>정확한 날씨 정보를 제공하기 위해 현재 위치를 사용합니다.</p>
      <p class="permission-note">위치 권한을 거부하면 서울 날씨가 표시됩니다.</p>
      <button @click="requestLocation" class="permission-btn">위치 권한 허용</button>
      <button @click="useDefaultLocation" class="permission-btn-secondary">서울 날씨 보기</button>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>날씨 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadWeatherData" class="retry-btn">다시 시도</button>
    </div>

    <!-- 날씨 데이터 -->
    <div v-else>
    <!-- 현재 날씨 -->
    <div class="current-weather">
      <div class="location-date">
        <h3>{{ weather.location }}</h3>
        <p>{{ weather.date }}</p>
      </div>
      <div class="main-temp">
        <img :src="weather.icon" alt="weather" class="weather-icon" />
        <div class="temp-info">
          <h1>{{ weather.temperature }}°</h1>
          <p>{{ weather.description }}</p>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <i class="fas fa-temperature-high"></i>
          <span class="label">체감온도</span>
          <span class="value">{{ weather.feelsLike }}°</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-tint"></i>
          <span class="label">습도</span>
          <span class="value">{{ weather.humidity }}%</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-cloud-rain"></i>
          <span class="label">강수확률</span>
          <span class="value">{{ weather.precipitation }}%</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-wind"></i>
          <span class="label">풍속</span>
          <span class="value">{{ weather.windSpeed }}m/s</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-smog"></i>
          <span class="label">미세먼지</span>
          <span class="value" :class="getDustClass(weather.fineDust)">{{ weather.fineDust }}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-lungs"></i>
          <span class="label">초미세먼지</span>
          <span class="value" :class="getDustClass(weather.ultraFineDust)">{{ weather.ultraFineDust }}</span>
        </div>
      </div>
    </div>

    <!-- 시간대별 날씨 -->
    <div class="hourly-weather section">
      <h3>시간대별 예보</h3>
      <div class="hourly-list">
        <div v-for="hour in hourlyWeather" :key="hour.time" class="hourly-item">
          <span class="time">{{ hour.time }}</span>
          <img :src="hour.icon" :alt="hour.desc" class="icon" />
          <span class="temp">{{ hour.temp }}°</span>
          <span class="rain">{{ hour.rain }}%</span>
        </div>
      </div>
    </div>

    <!-- 주간 날씨 -->
    <div class="weekly-weather section">
      <h3>주간 예보</h3>
      <div class="weekly-list">
        <div v-for="day in weeklyWeather" :key="day.date" class="weekly-item">
          <span class="day">{{ day.day }}</span>
          <img :src="day.icon" :alt="day.desc" class="icon" />
          <div class="temp-range">
            <span class="max">{{ day.maxTemp }}°</span>
            <div class="bar">
              <div class="fill" :style="{ width: day.fillPercent + '%' }"></div>
            </div>
            <span class="min">{{ day.minTemp }}°</span>
          </div>
          <span class="rain">{{ day.rain }}%</span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWeatherData, type CurrentWeather, type HourlyWeather, type DailyWeather } from '../services/weatherService'

const router = useRouter()

const weather = ref<CurrentWeather>({
  location: '위치 정보 로딩 중...',
  date: new Date().toLocaleDateString('ko-KR'),
  temperature: 0,
  description: '로딩 중...',
  icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
  feelsLike: 0,
  humidity: 0,
  precipitation: 0,
  windSpeed: 0,
  fineDust: '정보 없음',
  ultraFineDust: '정보 없음'
})

const hourlyWeather = ref<HourlyWeather[]>([])
const weeklyWeather = ref<DailyWeather[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showLocationPermission = ref(false)

const getDustClass = (level: string) => {
  const levels: Record<string, string> = {
    '좋음': 'good',
    '보통': 'moderate',
    '나쁨': 'bad',
    '매우나쁨': 'very-bad'
  }
  return levels[level] || 'moderate'
}

const checkLocationPermission = async () => {
  if (!('geolocation' in navigator)) {
    // Geolocation을 지원하지 않는 경우 기본 위치 사용
    await loadWeatherData()
    return
  }

  try {
    // 위치 권한 상태 확인 (지원하는 브라우저에서만)
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' })

      if (permission.state === 'granted') {
        await loadWeatherData()
      } else if (permission.state === 'prompt') {
        showLocationPermission.value = true
      } else {
        // 거부된 경우 기본 위치 사용
        await loadWeatherData()
      }
    } else {
      // permissions API를 지원하지 않는 경우 바로 권한 요청
      showLocationPermission.value = true
    }
  } catch (err) {
    console.error('Permission check failed:', err)
    await loadWeatherData()
  }
}

const requestLocation = async () => {
  showLocationPermission.value = false
  await loadWeatherData()
}

const useDefaultLocation = async () => {
  showLocationPermission.value = false
  await loadWeatherData(37.5665, 126.9780) // 서울 좌표
}

const loadWeatherData = async (lat?: number, lon?: number) => {
  try {
    loading.value = true
    error.value = null

    const data = await getWeatherData(lat, lon)
    weather.value = data.current
    hourlyWeather.value = data.hourly
    weeklyWeather.value = data.daily
  } catch (err) {
    error.value = '날씨 정보를 불러오는데 실패했습니다.'
    console.error('Failed to load weather data:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => router.go(-1)

onMounted(() => {
  checkLocationPermission()
})
</script>

<style scoped>
.weather-detail-page {
  background-color: #0f1e25;
  color: white;
  min-height: 100vh;
  padding: 1rem;
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

.refresh-btn {
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  transition: transform 0.2s;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

.permission-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.permission-icon {
  font-size: 64px;
  margin-bottom: 1.5rem;
}

.permission-container h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.permission-container p {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.permission-note {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2rem;
}

.permission-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 0.75rem;
  width: 100%;
  max-width: 280px;
}

.permission-btn:hover {
  transform: scale(1.03);
}

.permission-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 280px;
}

.permission-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #9ca3af;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #ef4444;
  font-size: 16px;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-btn:hover {
  transform: scale(1.05);
}

.current-weather {
  background: linear-gradient(135deg, #45c9f7, #8dd6f9);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1e1e1e;
}

.location-date h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.location-date p {
  font-size: 13px;
  opacity: 0.8;
}

.main-temp {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
}

.weather-icon {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
}

.temp-info h1 {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.temp-info p {
  font-size: 16px;
  margin-top: 0.3rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.8rem;
  border-radius: 12px;
}

.detail-item i {
  font-size: 20px;
  margin-bottom: 0.2rem;
}

.detail-item .label {
  font-size: 11px;
  opacity: 0.8;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 600;
}

.detail-item .value.good {
  color: #4ade80;
}

.detail-item .value.moderate {
  color: #fbbf24;
}

.detail-item .value.bad {
  color: #fb923c;
}

.detail-item .value.very-bad {
  color: #ef4444;
}

.section {
  background: #1a2a35;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hourly-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.hourly-list::-webkit-scrollbar {
  display: none;
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
}

.hourly-item .time {
  font-size: 12px;
  color: #9ca3af;
}

.hourly-item .icon {
  width: 32px;
  height: 32px;
}

.hourly-item .temp {
  font-size: 14px;
  font-weight: 600;
}

.hourly-item .rain {
  font-size: 11px;
  color: #60a5fa;
}

.weekly-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.weekly-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.weekly-item .day {
  font-size: 13px;
  min-width: 40px;
  font-weight: 600;
}

.weekly-item .icon {
  width: 28px;
  height: 28px;
  margin: 0 0.5rem;
}

.temp-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  margin: 0 1rem;
}

.temp-range .max,
.temp-range .min {
  font-size: 13px;
  min-width: 30px;
}

.temp-range .max {
  font-weight: 600;
}

.temp-range .min {
  color: #9ca3af;
}

.bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.bar .fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f97316);
  border-radius: 2px;
}

.weekly-item .rain {
  font-size: 12px;
  color: #60a5fa;
  min-width: 35px;
  text-align: right;
}
</style>
