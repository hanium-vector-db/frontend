<template>
  <div class="calendar-container">
    <!-- 상단 헤더 -->
    <div class="header">
      <button class="back-btn" @click="goBack"><i class="fas fa-chevron-left"></i> Back</button>
      <div class="title">일정 관리</div>
      <div class="header-actions">
        <button class="sync-btn" @click="showGoogleSyncModal = true" title="Google Calendar 연동">
          <i class="fab fa-google"></i>
        </button>
        <button class="add-btn" @click="showAddModal = true">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>

    <!-- 뷰 전환 탭 -->
    <div class="view-tabs">
      <button
        :class="['tab', { active: currentView === 'month' }]"
        @click="currentView = 'month'"
      >
        월
      </button>
      <button
        :class="['tab', { active: currentView === 'week' }]"
        @click="currentView = 'week'"
      >
        주
      </button>
      <button
        :class="['tab', { active: currentView === 'day' }]"
        @click="currentView = 'day'"
      >
        일
      </button>
    </div>

    <!-- 월 보기 -->
    <div v-if="currentView === 'month'" class="calendar-month">
      <!-- 요일 -->
      <div class="days-row">
        <span v-for="day in week" :key="day">{{ day }}</span>
      </div>

      <!-- 날짜 -->
      <div class="dates-grid">
        <span
          v-for="day in daysInMonth"
          :key="day"
          :class="['date', { today: day === 25, selected: day === selectedDate }]"
          @click="selectDate(day)"
        >
          {{ day }}
          <span v-if="hasEvent(day)" class="event-dot"></span>
        </span>
      </div>
    </div>

    <!-- 주 보기 -->
    <div v-if="currentView === 'week'" class="calendar-week">
      <div class="week-header">
        <div class="time-col">시간</div>
        <div v-for="day in weekDays" :key="day.date" class="day-col">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.date }}</div>
        </div>
      </div>
      <div class="week-body">
        <div v-for="hour in hours" :key="hour" class="hour-row">
          <div class="time-col">{{ hour }}:00</div>
          <div v-for="day in weekDays" :key="day.date" class="day-cell">
            <div v-if="getEventForTime(day.date, hour)" class="event-block">
              {{ getEventForTime(day.date, hour).title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 일 보기 -->
    <div v-if="currentView === 'day'" class="calendar-day">
      <div class="day-header">
        <h3>{{ selectedDate }}일</h3>
        <p>{{ getEventsForDay(selectedDate).length }}개의 일정</p>
      </div>
      <div class="day-timeline">
        <div v-for="hour in hours" :key="hour" class="timeline-row">
          <div class="timeline-time">{{ hour }}:00</div>
          <div class="timeline-content">
            <div
              v-for="event in getEventsForHour(selectedDate, hour)"
              :key="event.id"
              class="timeline-event"
              :class="event.color"
            >
              <strong>{{ event.title }}</strong>
              <p>{{ event.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 자연어 일정 추가 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3>일정 추가</h3>
        <div class="natural-language-input">
          <label>자연어로 일정 입력</label>
          <input
            type="text"
            v-model="naturalInput"
            placeholder="예: 금요일 저녁 7시 강남에서 회식"
            @keyup.enter="parseNaturalLanguage"
          />
          <button class="parse-btn" @click="parseNaturalLanguage">
            <i class="fas fa-magic"></i> 분석하기
          </button>
        </div>
        <div v-if="parsedEvent" class="parsed-result">
          <p><strong>분석 결과:</strong></p>
          <p>제목: {{ parsedEvent.title }}</p>
          <p>날짜: {{ parsedEvent.date }}</p>
          <p>시간: {{ parsedEvent.time }}</p>
          <p>장소: {{ parsedEvent.location }}</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showAddModal = false">취소</button>
          <button class="save-btn" @click="saveEvent" :disabled="!parsedEvent">추가</button>
        </div>
      </div>
    </div>

    <!-- Google Calendar 연동 모달 -->
    <div v-if="showGoogleSyncModal" class="modal-overlay" @click="showGoogleSyncModal = false">
      <div class="modal-content" @click.stop>
        <h3>Google Calendar 연동</h3>
        <p class="sync-description">
          Google Calendar와 연동하여 일정을 자동으로 동기화할 수 있습니다.
        </p>
        <div class="sync-status">
          <i class="fab fa-google"></i>
          <span v-if="!googleConnected">연동되지 않음</span>
          <span v-else class="connected">연동됨</span>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showGoogleSyncModal = false">닫기</button>
          <button v-if="!googleConnected" class="save-btn" @click="connectGoogle">
            <i class="fab fa-google"></i> Google 연동하기
          </button>
          <button v-else class="disconnect-btn" @click="disconnectGoogle">
            연동 해제
          </button>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'
import calendarService from '../services/calendarService'

const router = useRouter()
const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
const selectedDate = ref(25)
const currentView = ref('month')

const hours = Array.from({ length: 24 }, (_, i) => i)

const weekDays = ref([
  { name: '월', date: 21 },
  { name: '화', date: 22 },
  { name: '수', date: 23 },
  { name: '목', date: 24 },
  { name: '금', date: 25 },
  { name: '토', date: 26 },
  { name: '일', date: 27 }
])

const events = ref([])

const showAddModal = ref(false)
const showGoogleSyncModal = ref(false)
const googleConnected = ref(false)
const naturalInput = ref('')
const parsedEvent = ref(null)

// Load events from backend
onMounted(async () => {
  await loadEvents()
})

const loadEvents = async () => {
  try {
    const data = await calendarService.listEvents('primary', 50)
    events.value = data.map(event => {
      const startTime = new Date(event.startDateTime)
      const date = startTime.getDate()
      const hour = startTime.getHours()

      return {
        id: event.id,
        date,
        hour,
        title: event.summary,
        time: startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        color: 'blue',
        location: event.location || ''
      }
    })
  } catch (error) {
    console.error('Failed to load events:', error)
    // Fallback to empty events
    events.value = []
  }
}

const selectDate = (day) => {
  selectedDate.value = day
  currentView.value = 'day'
}

const hasEvent = (day) => {
  return events.value.some(e => e.date === day)
}

const getEventForTime = (date, hour) => {
  return events.value.find(e => e.date === date && e.hour === hour)
}

const getEventsForDay = (day) => {
  return events.value.filter(e => e.date === day)
}

const getEventsForHour = (day, hour) => {
  return events.value.filter(e => e.date === day && e.hour === hour)
}

const parseNaturalLanguage = () => {
  const input = naturalInput.value.toLowerCase()

  // 간단한 자연어 파싱
  const parsed = {
    title: '일정',
    date: '오늘',
    time: '09:00',
    location: ''
  }

  if (input.includes('회식')) parsed.title = '회식'
  if (input.includes('미팅')) parsed.title = '미팅'
  if (input.includes('병원')) parsed.title = '병원 예약'
  if (input.includes('점심')) parsed.title = '점심 약속'

  if (input.includes('강남')) parsed.location = '강남'
  if (input.includes('서울')) parsed.location = '서울'

  // Extract time
  const timeMatch = input.match(/(\d+)시/)
  if (timeMatch) {
    parsed.time = `${timeMatch[1].padStart(2, '0')}:00`
  }

  parsedEvent.value = parsed
}

const saveEvent = async () => {
  if (!parsedEvent.value) return

  try {
    const now = new Date()
    const startDateTime = new Date(now.getFullYear(), now.getMonth(), selectedDate.value)
    const [hour, minute] = parsedEvent.value.time.split(':')
    startDateTime.setHours(parseInt(hour), parseInt(minute))

    const endDateTime = new Date(startDateTime)
    endDateTime.setHours(endDateTime.getHours() + 1)

    await calendarService.createEvent({
      summary: parsedEvent.value.title,
      description: '',
      location: parsedEvent.value.location,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    })

    await loadEvents()
    showAddModal.value = false
    naturalInput.value = ''
    parsedEvent.value = null
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('일정 추가에 실패했습니다.')
  }
}

const connectGoogle = async () => {
  try {
    const authUrl = await calendarService.initiateGoogleOAuth()
    window.open(authUrl, '_blank', 'width=600,height=700')
    googleConnected.value = true
    alert('Google Calendar 연동 창이 열렸습니다. 로그인을 완료해주세요.')
  } catch (error) {
    console.error('Failed to connect Google:', error)
    alert('Google Calendar 연동에 실패했습니다.')
  }
}

const disconnectGoogle = async () => {
  try {
    await calendarService.disconnectGoogle()
    googleConnected.value = false
    alert('Google Calendar 연동이 해제되었습니다.')
  } catch (error) {
    console.error('Failed to disconnect Google:', error)
    alert('연동 해제에 실패했습니다.')
  }
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.calendar-container {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

/* 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}
.back-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.back-btn:hover {
  color: #ffc107;
}
.title {
  font-size: 16px;
  color: #aaa;
}
.add-btn {
  background-color: #3dd598;
  border: none;
  color: #0f1e25;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 요일 */
.days-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 12px;
  color: #bbb;
}

/* 날짜 */
.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.5rem;
}
.date {
  width: 100%;
  text-align: center;
  padding: 0.4rem 0;
  border-radius: 50%;
  font-size: 13px;
  color: #ccc;
  transition: background-color 0.2s ease;
}
.date:hover {
  background-color: #1c3c47;
}
.date.today {
  background-color: #3dd598;
  color: #0f1e25;
  font-weight: bold;
}
.date.selected {
  background-color: #1c3c47;
  color: #ffffff;
}

/* 일정 목록 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.schedule-item {
  background-color: #1c3c47;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 14px;
}
.icon {
  font-size: 10px;
}

.schedule-item.red .icon {
  color: #ff5c5c;
}
.schedule-item.orange .icon {
  color: #fcbf49;
}
.schedule-item.green .icon {
  color: #3dd598;
}

/* 헤더 액션 */
.header-actions {
  display: flex;
  gap: 0.5rem;
}

.sync-btn {
  background-color: #4285f4;
  border: none;
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* 뷰 전환 탭 */
.view-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-tabs .tab {
  flex: 1;
  background: #1a2a35;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.view-tabs .tab.active {
  background: #60a5fa;
  border-color: #60a5fa;
}

/* 이벤트 닷 */
.event-dot {
  display: block;
  width: 4px;
  height: 4px;
  background: #60a5fa;
  border-radius: 50%;
  margin: 2px auto 0;
}

/* 주 보기 */
.calendar-week {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.week-header {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.time-col {
  width: 60px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.day-col {
  flex: 1;
  text-align: center;
  min-width: 80px;
}

.day-name {
  font-size: 12px;
  color: #9ca3af;
}

.day-date {
  font-size: 14px;
  font-weight: 600;
  margin-top: 0.2rem;
}

.week-body {
  display: flex;
  flex-direction: column;
}

.hour-row {
  display: flex;
  min-height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.day-cell {
  flex: 1;
  min-width: 80px;
  padding: 0.2rem;
  position: relative;
}

.event-block {
  background: #60a5fa;
  border-radius: 4px;
  padding: 0.3rem;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 일 보기 */
.calendar-day {
  margin-bottom: 1rem;
}

.day-header {
  background: #1a2a35;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.day-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.day-header p {
  font-size: 13px;
  color: #9ca3af;
}

.day-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-row {
  display: flex;
  gap: 1rem;
}

.timeline-time {
  width: 60px;
  font-size: 12px;
  color: #9ca3af;
  padding-top: 0.5rem;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-event {
  background: #1a2a35;
  padding: 0.8rem;
  border-radius: 8px;
  border-left: 3px solid #60a5fa;
}

.timeline-event.red {
  border-left-color: #ef4444;
}

.timeline-event.green {
  border-left-color: #4ade80;
}

.timeline-event.orange {
  border-left-color: #fb923c;
}

.timeline-event strong {
  font-size: 14px;
  display: block;
  margin-bottom: 0.3rem;
}

.timeline-event p {
  font-size: 12px;
  color: #9ca3af;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a2a35;
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.natural-language-input {
  margin-bottom: 1rem;
}

.natural-language-input label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #d1d5db;
}

.natural-language-input input {
  width: 100%;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 0.5rem;
}

.parse-btn {
  width: 100%;
  background: #8b5cf6;
  border: none;
  color: white;
  padding: 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.parsed-result {
  background: #0f1e25;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.parsed-result p {
  font-size: 13px;
  margin-bottom: 0.3rem;
  color: #d1d5db;
}

.sync-description {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #0f1e25;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.sync-status i {
  font-size: 24px;
  color: #4285f4;
}

.sync-status .connected {
  color: #4ade80;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.save-btn,
.disconnect-btn {
  flex: 1;
  padding: 0.7rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #6b7280;
  color: white;
}

.save-btn {
  background: #4ade80;
  color: white;
}

.save-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.5;
}

.disconnect-btn {
  background: #ef4444;
  color: white;
}
</style>
