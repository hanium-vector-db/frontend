<template>
  <div class="permission">
    <div class="card">
      <!-- 로고 -->
      <div class="logo-placeholder"></div>

      <!-- 타이틀 -->
      <h1 class="title">권한을<br />허용해주세요</h1>
      <p class="subtitle">
        개인화 일정, 식단, 날씨, 뉴스, 건강을 한번에!
      </p>

      <!-- 권한 목록 -->
      <div class="permission-list">
        <div class="permission-item">
          <span class="icon lock"><i class="fas fa-lock"></i></span>
          <span class="label">개인 건강정보</span>
          <input type="checkbox" v-model="permissions.health" />
        </div>
        <div class="permission-item">
          <span class="icon money"><i class="fas fa-wallet"></i></span>
          <span class="label">개인 금융정보(예산/소비패턴)</span>
          <input type="checkbox" v-model="permissions.finance" />
        </div>
        <div class="permission-item">
          <span class="icon calendar"><i class="fas fa-calendar-alt"></i></span>
          <span class="label">캘린더, 위치, 프로필</span>
          <input type="checkbox" v-model="permissions.social" />
        </div>
        <div class="permission-item">
          <span class="icon facebook"><i class="fab fa-facebook"></i></span>
          <span class="label">CLP 정보</span>
          <input type="checkbox" v-model="permissions.clp" />
        </div>
      </div>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button class="back-btn" @click="goBack">←</button>
        <button class="next-btn" @click="goNext">다음 →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const permissions = ref({
  health: true,
  finance: true,
  social: true,
  clp: true
})

const goBack = () => {
  router.back()
}

const goNext = async () => {
  try {
    // Backend에 권한 동의 사항 저장
    await userStore.saveConsents({
      consentHealth: permissions.value.health,
      consentFinance: permissions.value.finance,
      consentSocial: permissions.value.social,
      consentClp: permissions.value.clp
    })
    router.push('/get_username')
  } catch (error) {
    console.error('Failed to save consents:', error)
    alert('권한 설정을 저장할 수 없습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.permission {
  height: 100vh;
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 360px;
  text-align: left;
}

.logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #22c55e;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a0aab0;
  font-size: 14px;
  margin-bottom: 2rem;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.permission-item {
  background-color: #1c3c47;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.permission-item .icon {
  margin-right: 0.75rem;
  font-size: 16px;
}

.lock {
  color: #f44336;
}

.money {
  color: #4caf50;
}

.calendar {
  color: #03a9f4;
}

.facebook {
  color: #1877f2;
}

.label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.permission-item input[type='checkbox'] {
  accent-color: #3dd598;
  width: 20px;
  height: 20px;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.back-btn {
  background-color: #14532d;
  border: none;
  color: #a8f4d4;
  font-size: 20px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
}

.next-btn {
  background-color: #3dd598;
  border: none;
  color: #0f1e25;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.next-btn:hover {
  background-color: #2fc08d;
}
</style>
