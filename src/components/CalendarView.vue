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
              @click="openDetailModal(event)"
            >
              <strong>{{ event.title }}</strong>
              <p>{{ event.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 추가 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <h3>일정 추가</h3>
        <div class="form-group">
          <label>제목 *</label>
          <input
            type="text"
            v-model="newEvent.title"
            placeholder="일정 제목을 입력하세요"
          />
        </div>
        <div class="form-group">
          <label>날짜 *</label>
          <input
            type="date"
            v-model="newEvent.date"
          />
        </div>
        <div class="form-group">
          <label>시간 *</label>
          <input
            type="time"
            v-model="newEvent.time"
          />
        </div>
        <div class="form-group">
          <label>유형</label>
          <select v-model="newEvent.type">
            <option value="약속">약속</option>
            <option value="병원">병원</option>
            <option value="회의">회의</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div class="form-group">
          <label>장소</label>
          <input
            type="text"
            v-model="newEvent.location"
            placeholder="장소를 입력하세요"
          />
        </div>
        <div class="form-group">
          <label>설명</label>
          <textarea
            v-model="newEvent.description"
            placeholder="일정 설명을 입력하세요"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeAddModal">취소</button>
          <button class="save-btn" @click="saveEvent" :disabled="!newEvent.title || !newEvent.date || !newEvent.time">추가</button>
        </div>
      </div>
    </div>

    <!-- 일정 상세보기/삭제 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <h3>일정 상세</h3>
        <div class="detail-view">
          <div class="detail-row">
            <strong>제목:</strong>
            <span>{{ selectedEvent?.title }}</span>
          </div>
          <div class="detail-row">
            <strong>날짜:</strong>
            <span>{{ selectedEvent?.date }}일</span>
          </div>
          <div class="detail-row">
            <strong>시간:</strong>
            <span>{{ selectedEvent?.time }}</span>
          </div>
          <div class="detail-row">
            <strong>장소:</strong>
            <span>{{ selectedEvent?.location || '-' }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDetailModal = false">닫기</button>
          <button class="delete-btn" @click="deleteEvent">삭제</button>
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

<script setup lang="ts">
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
const showDetailModal = ref(false)
const showGoogleSyncModal = ref(false)
const googleConnected = ref(false)
const selectedEvent = ref(null)

// 새로운 일정 폼 데이터
const newEvent = ref({
  title: '',
  date: '',
  time: '',
  type: '약속',
  location: '',
  description: ''
})

// Load events from backend
onMounted(async () => {
  await loadEvents()
})

const loadEvents = async () => {
  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem('jwt_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('⚠️ JWT 토큰이 없습니다. 빈 일정을 표시합니다.')
      events.value = []
      return
    }

    // 백엔드 API에서 일정 조회
    const response = await fetch('http://localhost:8000/api/v1/calendar/events', {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    events.value = data.map(event => {
      const eventDate = new Date(event.event_date)
      const date = eventDate.getDate()
      const [hourStr, minuteStr] = (event.event_time || '00:00').split(':')
      const hour = parseInt(hourStr)

      return {
        id: event.id || event.event_id,
        date,
        hour,
        title: event.title,
        time: event.event_time,
        color: event.event_type === '병원' ? 'red' : event.event_type === '회의' ? 'orange' : event.event_type === '약속' ? 'green' : 'blue',
        location: event.location || ''
      }
    })

    console.log('✅ 일정 데이터 로드 완료:', events.value.length, '개')
  } catch (error) {
    console.error('Failed to load events:', error)
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

const openDetailModal = (event) => {
  selectedEvent.value = event
  showDetailModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  // 폼 초기화
  newEvent.value = {
    title: '',
    date: '',
    time: '',
    type: '약속',
    location: '',
    description: ''
  }
}

const saveEvent = async () => {
  if (!newEvent.value.title || !newEvent.value.date || !newEvent.value.time) {
    alert('제목, 날짜, 시간은 필수 항목입니다.')
    return
  }

  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem('jwt_token')
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    // 백엔드 API로 일정 추가
    const response = await fetch('http://localhost:8000/api/v1/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newEvent.value.title,
        event_type: newEvent.value.type,
        event_date: newEvent.value.date,
        time: newEvent.value.time,
        location: newEvent.value.location,
        description: newEvent.value.description
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 일정 목록 새로고침
    await loadEvents()

    // 모달 닫기 및 폼 초기화
    closeAddModal()

    console.log('✅ 일정이 추가되었습니다')
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('일정 추가에 실패했습니다.')
  }
}

const deleteEvent = async () => {
  if (!selectedEvent.value) return

  if (!confirm('이 일정을 삭제하시겠습니까?')) return

  try {
    const token = localStorage.getItem('jwt_token')
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    const response = await fetch(`http://localhost:8000/api/v1/calendar/events/${selectedEvent.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 일정 목록 새로고침
    await loadEvents()

    // 모달 닫기
    showDetailModal.value = false
    selectedEvent.value = null

    console.log('✅ 일정이 삭제되었습니다')
  } catch (error) {
    console.error('Failed to delete event:', error)
    alert('일정 삭제에 실패했습니다.')
  }
}

const connectGoogle = async () => {
  // 백엔드 API가 아직 구현되지 않음
  alert('Google Calendar 연동 기능은 현재 개발 중입니다.')
  console.log('⚠️ Google Calendar API 연동이 필요합니다.')
}

const disconnectGoogle = async () => {
  // 백엔드 API가 아직 구현되지 않음
  googleConnected.value = false
  alert('Google Calendar 연동이 해제되었습니다.')
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
  cursor: pointer;
  transition: background 0.2s ease;
}

.timeline-event:hover {
  background: #243847;
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

/* 폼 그룹 스타일 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #d1d5db;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.form-group select {
  cursor: pointer;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* 상세보기 스타일 */
.detail-view {
  background: #0f1e25;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row strong {
  min-width: 60px;
  color: #9ca3af;
}

.detail-row span {
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

.delete-btn {
  flex: 1;
  padding: 0.7rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  background: #ef4444;
  color: white;
}
</style>
