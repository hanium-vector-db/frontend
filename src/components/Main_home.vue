<template>
  <div class="main-container">
    <!-- 상단 헤더 -->
    <div class="header">
      <h1 class="title">홈</h1>
      <i class="fas fa-bars menu-icon" @click="goToSideMenu"></i>
    </div>

    <!-- 날씨 카드 -->
    <div class="weather-card">
      <div class="weather-left">
        <img :src="appStore.weatherInfo.icon" alt="weather" class="weather-icon" />
      </div>
      <div class="weather-right">
        <div class="temperature">{{ appStore.weatherInfo.temperature }}°</div>
        <p class="weather-location">{{ appStore.weatherInfo.location }}</p>
        <p class="weather-desc">{{ appStore.weatherInfo.description }}&nbsp;&nbsp;&nbsp;예보보다 {{ appStore.weatherInfo.variance }}°↓</p>
      </div>
    </div>

    <!-- 달력 카드 -->
    <div class="calendar-card" @click="goToCalendar">
      <div class="calendar-header">
        <div class="month-days">
          <span v-for="day in week" :key="day">{{ day }}</span>
        </div>
        <div class="dates">
          <span class="date" v-for="day in 31" :key="day" :class="{ today: day === appStore.currentDate.day }">{{ day }}</span>
        </div>
      </div>
      <div class="calendar-footer">
        <div>{{ appStore.currentDate.month }}/{{ appStore.currentDate.day }}일</div>
        <div class="event">{{ appStore.currentDate.schedule }}</div>
        <div class="holiday">{{ appStore.currentDate.holiday }}</div>
      </div>
    </div>

    <!-- 타이머 카드 -->
    <div class="timer-card">
      <div class="timer-header">
        <i class="fas fa-capsules pink-icon"></i>
        <span class="reminder-text">복용약 리마인더</span>
      </div>
      <div class="time-picker">
        <div class="time-box">1</div>
        <span class="colon">:</span>
        <div class="time-box">00</div>
        <div class="ampm">PM</div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
    <!-- 기경: 추가한 FAB -->
    <ReportFAB />
  </div>
</template>

<script setup>
import { useNavigation } from '../composables/useRouter'
import { useAppStore } from '../stores/app'
import BottomNav from './BottomNav.vue'
import ReportFAB from './ReportFAB.vue' // 기경: 추가함

const { goToCalendar, goToSideMenu } = useNavigation()
const appStore = useAppStore()

const week = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
</script>

<style scoped>

.main-container {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 1rem;
  padding-bottom: 5rem;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}
.title {
  font-size: 24px;
  font-weight: 800;
}
.menu-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s ease;
}
.menu-icon:hover {
  color: #3dd598;
}

/* Weather */
.weather-card {
  background: linear-gradient(135deg, #45c9f7, #8dd6f9);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
}
.weather-left {
  flex: 0 0 auto;
}
.weather-icon {
  width: 64px;
  height: 64px;
}
.weather-right {
  margin-left: 1rem;
}
.temperature {
  font-size: 28px;
  font-weight: bold;
}
.weather-location {
  font-size: 13px;
}
.weather-desc {
  font-size: 12px;
  color: #e2e2e2;
}

/* Calendar */
.calendar-card {
  background-color: #1e333d;
  border-radius: 18px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.calendar-card:hover {
  background-color: #253d47;
}
.month-days {
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 12px;
  margin-bottom: 0.5rem;
}
.dates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 12px;
  color: #ccc;
}
.date {
  width: 12%;
  text-align: center;
  padding: 4px 0;
  border-radius: 8px;
}
.date.today {
  background-color: #3dd598;
  color: #0f1e25;
  font-weight: bold;
}
.calendar-footer {
  margin-top: 1rem;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.event {
  color: #aaa;
}
.holiday {
  color: #ff9ea8;
}

/* Timer */
.timer-card {
  background-color: #1e333d;
  border-radius: 18px;
  padding: 1rem;
  margin-top: 1rem;
}
.timer-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 0.7rem;
}
.pink-icon {
  color: #ff7b93;
  margin-right: 0.5rem;
}
.time-picker {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.time-box {
  background-color: #f6f1f2;
  color: #1e1e1e;
  font-size: 24px;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
}
.colon {
  font-size: 20px;
}
.ampm {
  font-size: 14px;
  color: #eee;
  margin-left: 0.5rem;
}

</style>
