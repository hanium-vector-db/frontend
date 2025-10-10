<template>
  <div class="security-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>보안 및 정책</h2>
      <span></span>
    </div>

    <!-- 비밀번호 변경 -->
    <div class="section">
      <h3>비밀번호 변경</h3>
      <div class="password-card">
        <div class="form-group">
          <label>현재 비밀번호</label>
          <input type="password" v-model="passwordForm.current" placeholder="현재 비밀번호" />
        </div>
        <div class="form-group">
          <label>새 비밀번호</label>
          <input type="password" v-model="passwordForm.new" placeholder="새 비밀번호" />
        </div>
        <div class="form-group">
          <label>새 비밀번호 확인</label>
          <input type="password" v-model="passwordForm.confirm" placeholder="새 비밀번호 확인" />
        </div>
        <button class="change-btn" @click="changePassword">비밀번호 변경</button>
      </div>
    </div>

    <!-- 로그인 기기 관리 -->
    <div class="section">
      <h3>로그인 기기</h3>
      <p class="section-desc">현재 로그인된 기기 목록입니다</p>

      <div class="device-list">
        <div class="device-card" v-for="device in devices" :key="device.id">
          <div class="device-icon">
            <i :class="getDeviceIcon(device.type)"></i>
          </div>
          <div class="device-info">
            <h4>{{ device.name }}</h4>
            <p>{{ device.location }}</p>
            <span class="last-active">마지막 활동: {{ device.lastActive }}</span>
          </div>
          <div class="device-actions">
            <span v-if="device.current" class="current-badge">현재 기기</span>
            <button v-else class="logout-btn" @click="logoutDevice(device)">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2단계 인증 -->
    <div class="section">
      <h3>2단계 인증</h3>
      <div class="two-factor-card">
        <div class="two-factor-info">
          <p>계정 보안을 강화하기 위해 2단계 인증을 설정하세요</p>
          <span class="status" :class="{ active: twoFactorEnabled }">
            {{ twoFactorEnabled ? '활성화됨' : '비활성화됨' }}
          </span>
        </div>
        <button class="toggle-btn" @click="toggleTwoFactor">
          {{ twoFactorEnabled ? '비활성화' : '활성화' }}
        </button>
      </div>
    </div>

    <!-- 개인정보 처리방침 -->
    <div class="section">
      <h3>개인정보 및 약관</h3>
      <div class="policy-list">
        <div class="policy-item" @click="viewPolicy('privacy')">
          <span>개인정보 처리방침</span>
          <i class="fas fa-chevron-right"></i>
        </div>
        <div class="policy-item" @click="viewPolicy('terms')">
          <span>이용약관</span>
          <i class="fas fa-chevron-right"></i>
        </div>
        <div class="policy-item" @click="viewPolicy('location')">
          <span>위치 기반 서비스 이용약관</span>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>

    <!-- 계정 관리 -->
    <div class="section">
      <h3>계정 관리</h3>
      <div class="account-actions">
        <button class="export-btn" @click="exportData">
          <i class="fas fa-download"></i>
          내 데이터 다운로드
        </button>
        <button class="delete-btn" @click="confirmDelete">
          <i class="fas fa-trash"></i>
          계정 삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const devices = ref([
  {
    id: 1,
    name: 'iPhone 14 Pro',
    type: 'mobile',
    location: '서울, 대한민국',
    lastActive: '방금 전',
    current: true
  },
  {
    id: 2,
    name: 'Chrome on Windows',
    type: 'desktop',
    location: '서울, 대한민국',
    lastActive: '2시간 전',
    current: false
  },
  {
    id: 3,
    name: 'iPad Air',
    type: 'tablet',
    location: '부산, 대한민국',
    lastActive: '3일 전',
    current: false
  }
])

const twoFactorEnabled = ref(false)

const changePassword = () => {
  if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
    alert('모든 필드를 입력해주세요')
    return
  }

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('새 비밀번호가 일치하지 않습니다')
    return
  }

  alert('비밀번호가 변경되었습니다!')
  passwordForm.value = { current: '', new: '', confirm: '' }
}

const getDeviceIcon = (type) => {
  const icons = {
    mobile: 'fas fa-mobile-alt',
    desktop: 'fas fa-desktop',
    tablet: 'fas fa-tablet-alt'
  }
  return icons[type] || 'fas fa-laptop'
}

const logoutDevice = (device) => {
  if (confirm(`${device.name}에서 로그아웃하시겠습니까?`)) {
    const index = devices.value.findIndex(d => d.id === device.id)
    if (index > -1) {
      devices.value.splice(index, 1)
    }
  }
}

const toggleTwoFactor = () => {
  if (twoFactorEnabled.value) {
    if (confirm('2단계 인증을 비활성화하시겠습니까?')) {
      twoFactorEnabled.value = false
    }
  } else {
    alert('2단계 인증을 설정합니다. (SMS 또는 인증 앱 연동)')
    twoFactorEnabled.value = true
  }
}

const viewPolicy = (type) => {
  alert(`${type} 페이지로 이동합니다`)
}

const exportData = () => {
  alert('내 데이터를 다운로드합니다')
}

const confirmDelete = () => {
  if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    alert('계정 삭제가 진행됩니다')
  }
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.security-page {
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

.section {
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.password-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
}

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

.form-group input {
  width: 100%;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 14px;
}

.change-btn {
  width: 100%;
  background: #60a5fa;
  border: none;
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.device-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.device-icon {
  width: 48px;
  height: 48px;
  background: rgba(96, 165, 250, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 24px;
}

.device-info {
  flex: 1;
}

.device-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.device-info p {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 0.2rem;
}

.last-active {
  font-size: 11px;
  color: #6b7280;
}

.device-actions .current-badge {
  background: #4ade80;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.logout-btn {
  background: #ef4444;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.two-factor-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.two-factor-info p {
  font-size: 13px;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.status {
  font-size: 12px;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  background: #6b7280;
  color: white;
}

.status.active {
  background: #4ade80;
}

.toggle-btn {
  background: #60a5fa;
  border: none;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.policy-item {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.policy-item:hover {
  background: #253d47;
}

.policy-item span {
  font-size: 14px;
}

.policy-item i {
  color: #9ca3af;
  font-size: 14px;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.export-btn,
.delete-btn {
  width: 100%;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-btn {
  background: #60a5fa;
  color: white;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}
</style>
