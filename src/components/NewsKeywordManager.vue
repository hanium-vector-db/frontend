<template>
  <div class="keyword-manager-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>키워드 관리</h2>
      <span></span>
    </div>

    <!-- 관심 키워드 -->
    <div class="section">
      <h3>관심 키워드</h3>
      <p class="section-desc">설정한 키워드와 관련된 뉴스를 우선적으로 보여드립니다.</p>
      <div class="keyword-list">
        <div v-for="keyword in interestedKeywords" :key="keyword.id" class="keyword-chip interested">
          <span>{{ keyword.text }}</span>
          <button @click="removeKeyword('interested', keyword.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button class="add-keyword-btn" @click="openAddModal('interested')">
          <i class="fas fa-plus"></i> 추가
        </button>
      </div>
    </div>

    <!-- 제외 키워드 -->
    <div class="section">
      <h3>제외 키워드</h3>
      <p class="section-desc">설정한 키워드가 포함된 뉴스는 표시되지 않습니다.</p>
      <div class="keyword-list">
        <div v-for="keyword in excludedKeywords" :key="keyword.id" class="keyword-chip excluded">
          <span>{{ keyword.text }}</span>
          <button @click="removeKeyword('excluded', keyword.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button class="add-keyword-btn" @click="openAddModal('excluded')">
          <i class="fas fa-plus"></i> 추가
        </button>
      </div>
    </div>

    <!-- 추천 키워드 -->
    <div class="section">
      <h3>추천 키워드</h3>
      <p class="section-desc">회원님의 관심사를 기반으로 추천합니다.</p>
      <div class="keyword-list">
        <div
          v-for="keyword in recommendedKeywords"
          :key="keyword"
          class="keyword-chip recommended"
          @click="addRecommendedKeyword(keyword)"
        >
          <span>{{ keyword }}</span>
          <i class="fas fa-plus"></i>
        </div>
      </div>
    </div>

    <!-- 키워드 추가 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <h3>{{ addModalType === 'interested' ? '관심 키워드 추가' : '제외 키워드 추가' }}</h3>
        <div class="form-group">
          <label>키워드</label>
          <input
            type="text"
            v-model="newKeyword"
            placeholder="키워드를 입력하세요"
            @keyup.enter="addKeyword"
          />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeAddModal">취소</button>
          <button class="save-btn" @click="addKeyword">추가</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const interestedKeywords = ref([
  { id: 1, text: '건강' },
  { id: 2, text: '경제' },
  { id: 3, text: '기술' },
  { id: 4, text: '노인복지' }
])

const excludedKeywords = ref([
  { id: 1, text: '연예' },
  { id: 2, text: '스포츠' }
])

const recommendedKeywords = ref([
  '의료',
  '재테크',
  '연금',
  'AI',
  '스마트홈',
  '실버산업'
])

const showAddModal = ref(false)
const addModalType = ref('interested')
const newKeyword = ref('')

const openAddModal = (type) => {
  addModalType.value = type
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newKeyword.value = ''
}

const addKeyword = () => {
  if (!newKeyword.value.trim()) {
    alert('키워드를 입력해주세요')
    return
  }

  const targetList = addModalType.value === 'interested' ? interestedKeywords : excludedKeywords
  const newId = Math.max(...targetList.value.map(k => k.id), 0) + 1

  targetList.value.push({
    id: newId,
    text: newKeyword.value.trim()
  })

  closeAddModal()
}

const removeKeyword = (type, id) => {
  const targetList = type === 'interested' ? interestedKeywords : excludedKeywords
  const index = targetList.value.findIndex(k => k.id === id)
  if (index > -1) {
    targetList.value.splice(index, 1)
  }
}

const addRecommendedKeyword = (keyword) => {
  const newId = Math.max(...interestedKeywords.value.map(k => k.id), 0) + 1
  interestedKeywords.value.push({
    id: newId,
    text: keyword
  })

  const index = recommendedKeywords.value.indexOf(keyword)
  if (index > -1) {
    recommendedKeywords.value.splice(index, 1)
  }
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.keyword-manager-page {
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

.section {
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.keyword-chip.interested {
  background: #60a5fa;
  color: white;
}

.keyword-chip.excluded {
  background: #ef4444;
  color: white;
}

.keyword-chip.recommended {
  background: #1a2a35;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.keyword-chip.recommended:hover {
  background: #253d47;
  border-color: #60a5fa;
}

.keyword-chip button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.keyword-chip button:hover {
  opacity: 1;
}

.keyword-chip.recommended i {
  font-size: 12px;
  opacity: 0.7;
}

.add-keyword-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 13px;
  background: #1a2a35;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-keyword-btn:hover {
  background: #253d47;
  border-color: #60a5fa;
}

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
  max-width: 400px;
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
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

.modal-actions {
  display: flex;
  gap: 0.8rem;
}

.cancel-btn,
.save-btn {
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
</style>
