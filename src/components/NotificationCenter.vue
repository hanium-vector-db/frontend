<template>
  <div class="notification-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>알림 센터</h2>
      <span class="settings-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
      </span>
    </div>

    <!-- 알림 필터 탭 -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="getUnreadCount(tab.id) > 0" class="badge">{{ getUnreadCount(tab.id) }}</span>
      </button>
    </div>

    <!-- 알림 목록 -->
    <div class="notifications-list">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :class="['notification-item', { unread: !notification.read }]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon" :class="notification.type">
          <i :class="getIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="notification-time">{{ notification.time }}</span>
        </div>
        <button class="delete-btn" @click.stop="deleteNotification(notification.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>알림이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('all')

const tabs = [
  { id: 'all', label: '전체' },
  { id: 'health', label: '건강' },
  { id: 'calendar', label: '일정' },
  { id: 'finance', label: '금융' },
  { id: 'news', label: '뉴스' },
  { id: 'price', label: '식단' }
]

const notifications = ref([
  {
    id: 1,
    type: 'health',
    title: '복약 시간입니다',
    message: '오후 1시 약 복용 시간입니다.',
    time: '10분 전',
    read: false
  },
  {
    id: 2,
    type: 'calendar',
    title: '다가오는 일정',
    message: '오늘 오후 3시 병원 예약이 있습니다.',
    time: '30분 전',
    read: false
  },
  {
    id: 3,
    type: 'finance',
    title: '금융상품 금리 변동',
    message: '국민은행 정기예금 금리가 0.2% 상승했습니다.',
    time: '1시간 전',
    read: true
  },
  {
    id: 4,
    type: 'news',
    title: '관심 뉴스 업데이트',
    message: '[건강] 겨울철 면역력 강화 식품 5가지',
    time: '2시간 전',
    read: true
  },
  {
    id: 5,
    type: 'price',
    title: '가격 하락 알림',
    message: '사과 가격이 전주 대비 15% 하락했습니다.',
    time: '3시간 전',
    read: false
  }
])

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(n => n.type === activeTab.value)
})

const getUnreadCount = (tabId) => {
  if (tabId === 'all') {
    return notifications.value.filter(n => !n.read).length
  }
  return notifications.value.filter(n => n.type === tabId && !n.read).length
}

const getIcon = (type) => {
  const icons = {
    health: 'fas fa-heartbeat',
    calendar: 'fas fa-calendar-alt',
    finance: 'fas fa-chart-line',
    news: 'fas fa-newspaper',
    price: 'fas fa-shopping-basket'
  }
  return icons[type] || 'fas fa-bell'
}

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const deleteNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const goBack = () => router.go(-1)
const goToSettings = () => router.push('/notification-settings')
</script>

<style scoped>
.notification-page {
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

.back-btn, .settings-btn {
  color: #60a5fa;
  cursor: pointer;
  font-size: 14px;
}

.settings-btn i {
  font-size: 18px;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  background: #1a2a35;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  transition: all 0.2s ease;
}

.tab:hover {
  background: #253d47;
}

.tab.active {
  background: #60a5fa;
  border-color: #60a5fa;
}

.tab .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  background: #1a2a35;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.notification-item:hover {
  background: #253d47;
}

.notification-item.unread {
  border-color: #60a5fa;
  background: linear-gradient(135deg, #1a2a35 0%, #1e3a50 100%);
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.notification-icon.health {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.notification-icon.calendar {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.notification-icon.finance {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.notification-icon.news {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.notification-icon.price {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.notification-content p {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 0.3rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: #6b7280;
}

.delete-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 16px;
  transition: color 0.2s ease;
}

.delete-btn:hover {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}
</style>
