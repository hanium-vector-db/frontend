<template>
  <div class="selection">
    <div class="card">
      <!-- 로고/아이콘 -->
      <div class="logo-placeholder"></div>

      <!-- 텍스트 -->
      <h1 class="title">선호 언어를<br />선택해주세요</h1>
      <p class="subtitle">언어에 맞는 응답을 드릴게요</p>

      <!-- 언어 선택 -->
      <div class="language-select">
        <img src="https://flagcdn.com/w40/nl.png" alt="netherlands flag" />
        <select v-model="selectedLanguage">
          <option value="nl">네덜란드어</option>
          <option value="ko">한국어</option>
          <option value="en">영어</option>
          <option value="es">스페인어</option>
        </select>
      </div>

      <!-- 버튼 영역 -->
      <div class="button-group">
        <button class="back-btn" @click="goBack">←</button>
        <button class="next-btn" @click="goNext">다음 →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNavigation } from '../composables/useRouter'
import { useUserStore } from '../stores/user'
import { ROUTES } from '../constants/routes'

const { goBack, goTo } = useNavigation()
const userStore = useUserStore()
const selectedLanguage = ref(userStore.userSettings.selectedLanguage)

const goNext = async () => {
  try {
    // Backend에 회원가입 시작 요청하여 registrationId 생성
    await userStore.startRegister(selectedLanguage.value)
    goTo(ROUTES.PERMISSION)
  } catch (error) {
    console.error('Failed to start registration:', error)
    alert('회원가입을 시작할 수 없습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
.selection {
  height: 100vh;
  width: 100vw;
  background-color: #0f1e25;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}

.card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
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
  margin-bottom: 2.5rem;
}

.language-select {
  display: flex;
  align-items: center;
  background-color: #14532d;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  width: 100%;
  max-width: 280px;
  margin-bottom: 3rem;
  justify-content: center;
}

.language-select img {
  width: 20px;
  height: 14px;
}

.language-select select {
  background: transparent;
  border: none;
  color: #a8f4d4;
  font-size: 16px;
  font-weight: 600;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.button-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
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

