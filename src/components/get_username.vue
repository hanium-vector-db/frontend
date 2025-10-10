<template>
  <div class="container">
    <div class="content">
      <!-- 로고 -->
      <div class="logo-box"></div>

      <!-- 타이틀 -->
      <h1 class="title">거의 다 왔어요!</h1>
      <p class="subtitle">이름을 알려주세요</p>

      <!-- 입력 필드 -->
      <div class="input-box">
        <div class="input-group">
          <div class="icon">
            <i class="fas fa-user"></i>
          </div>
          <input type="text" placeholder="이름 (예: 홍길동)" v-model="fullName" />
        </div>
        <div v-if="getErrorsForField('fullName').length" class="error-messages">
          <span v-for="error in getErrorsForField('fullName')" :key="error" class="error">{{ error }}</span>
        </div>

        <div class="input-group">
          <div class="icon">
            <i class="fas fa-user"></i>
          </div>
          <input type="text" placeholder="닉네임 (예: 길동이)" v-model="nickname" />
        </div>
        <div v-if="getErrorsForField('nickname').length" class="error-messages">
          <span v-for="error in getErrorsForField('nickname')" :key="error" class="error">{{ error }}</span>
        </div>

        <div class="input-group">
          <div class="icon">
            <i class="fas fa-id-card"></i>
          </div>
          <input type="text" placeholder="사용자 ID (로그인용)" v-model="userid" />
        </div>
        <div v-if="getErrorsForField('userid').length" class="error-messages">
          <span v-for="error in getErrorsForField('userid')" :key="error" class="error">{{ error }}</span>
        </div>

        <div class="input-group">
          <div class="icon">
            <i class="fas fa-lock"></i>
          </div>
          <input type="password" placeholder="비밀번호" v-model="password" />
        </div>
        <div v-if="getErrorsForField('password').length" class="error-messages">
          <span v-for="error in getErrorsForField('password')" :key="error" class="error">{{ error }}</span>
        </div>
      </div>

      <!-- 하단 버튼 -->
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
import { useValidation } from '../composables/useValidation'
import { useUserStore } from '../stores/user'
import { ROUTES } from '../constants/routes'

const { goBack, goTo } = useNavigation()
const { validateForm, getErrorsForField, hasErrors } = useValidation()
const userStore = useUserStore()

const fullName = ref('')
const nickname = ref('')
const userid = ref('')
const password = ref('')

const goNext = async () => {
  const isValid = validateForm({
    fullName: {
      value: fullName.value,
      rules: { required: true, minLength: 2, message: '이름을 2자 이상 입력해주세요.' }
    },
    nickname: {
      value: nickname.value,
      rules: { required: true, minLength: 2, message: '닉네임을 2자 이상 입력해주세요.' }
    },
    userid: {
      value: userid.value,
      rules: { required: true, minLength: 4, message: '사용자 ID를 4자 이상 입력해주세요.' }
    },
    password: {
      value: password.value,
      rules: { required: true, minLength: 6, message: '비밀번호를 6자 이상 입력해주세요.' }
    }
  })

  if (!isValid) return

  try {
    // Save profile
    await userStore.saveProfile(fullName.value, nickname.value)

    // Finalize registration
    await userStore.finalizeRegistration(userid.value, password.value, true)

    // Navigate to main home
    goTo(ROUTES.MAIN_HOME)
  } catch (error) {
    console.error('Registration failed:', error)
    alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>

.container {
  background-color: #0f1e25;
  color: #ffffff;
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.content {
  width: 100%;
  max-width: 340px;
}

.logo-box {
  width: 32px;
  height: 32px;
  background-color: #22c55e;
  border-radius: 8px;
  margin-bottom: 2.5rem;
}

.title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #b0b8c1;
  margin-bottom: 2rem;
}

.input-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  background-color: #1c3c47;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
}

.input-group input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  flex: 1;
  margin-left: 0.75rem;
}

.icon {
  color: #ffc107;
  font-size: 16px;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2.5rem;
}

.back-btn {
  width: 48px;
  height: 48px;
  background-color: #14532d;
  color: #a8f4d4;
  font-size: 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.next-btn {
  flex: 1;
  background-color: #3dd598;
  color: #0f1e25;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 0 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.next-btn:hover {
  background-color: #2fc08d;
}

.error-messages {
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.error {
  color: var(--accent-red);
  font-size: var(--font-size-xs);
  display: block;
}
</style>
