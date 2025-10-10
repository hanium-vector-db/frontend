<template>
  <div class="weather-detail-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>날씨 상세</h2>
      <span></span>
    </div>

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
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const weather = ref({
  location: '서울특별시 강남구',
  date: '2025년 10월 3일 금요일',
  temperature: 18,
  description: '맑음',
  icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
  feelsLike: 16,
  humidity: 65,
  precipitation: 10,
  windSpeed: 2.5,
  fineDust: '보통',
  ultraFineDust: '좋음'
})

const hourlyWeather = ref([
  { time: '지금', temp: 18, rain: 10, icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' },
  { time: '15시', temp: 19, rain: 5, icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' },
  { time: '16시', temp: 19, rain: 5, icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', desc: '구름 조금' },
  { time: '17시', temp: 18, rain: 10, icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', desc: '구름 조금' },
  { time: '18시', temp: 17, rain: 15, icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '흐림' },
  { time: '19시', temp: 16, rain: 20, icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '흐림' },
  { time: '20시', temp: 15, rain: 25, icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '비' },
  { time: '21시', temp: 14, rain: 30, icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '비' }
])

const weeklyWeather = ref([
  { day: '오늘', date: '10/3', maxTemp: 22, minTemp: 14, rain: 20, fillPercent: 70, icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' },
  { day: '토', date: '10/4', maxTemp: 21, minTemp: 13, rain: 30, fillPercent: 65, icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', desc: '구름 조금' },
  { day: '일', date: '10/5', maxTemp: 19, minTemp: 12, rain: 50, fillPercent: 55, icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', desc: '흐림' },
  { day: '월', date: '10/6', maxTemp: 18, minTemp: 11, rain: 70, fillPercent: 50, icon: 'https://cdn-icons-png.flaticon.com/512/2675/2675880.png', desc: '비' },
  { day: '화', date: '10/7', maxTemp: 20, minTemp: 13, rain: 40, fillPercent: 60, icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', desc: '구름 조금' },
  { day: '수', date: '10/8', maxTemp: 23, minTemp: 15, rain: 10, fillPercent: 75, icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' },
  { day: '목', date: '10/9', maxTemp: 24, minTemp: 16, rain: 5, fillPercent: 80, icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', desc: '맑음' }
])

const getDustClass = (level) => {
  const levels = {
    '좋음': 'good',
    '보통': 'moderate',
    '나쁨': 'bad',
    '매우나쁨': 'very-bad'
  }
  return levels[level] || 'moderate'
}

const goBack = () => router.go(-1)
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
