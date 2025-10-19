<template>
  <div class="health-page">
    <!-- 상단 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
    </div>

    <!-- 나의 기저질환 -->
    <div class="report-card">
      <div class="report-header">
        <div class="report-title">나의 기저질환</div>
        <button class="edit-btn" @click="openEditModal">
          <i class="fas fa-edit"></i> 수정
        </button>
      </div>
      <div class="disease-chart">
        <img src="https://cdn-icons-png.flaticon.com/512/4270/4270302.png" alt="chart" />
        <ul>
          <li v-for="disease in diseases" :key="disease.id">
            <span class="dot" :class="disease.color"></span> {{ disease.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 복약 알람 섹션 추가 -->
    <div class="medication-section">
      <div class="section-header">
        <h3>복약 알람</h3>
        <button class="add-btn" @click="openMedicationModal">
          <i class="fas fa-plus"></i> 추가
        </button>
      </div>
      <div class="medication-list">
        <div
          v-for="med in medications"
          :key="med.id"
          class="medication-item"
        >
          <div class="medication-info">
            <h4>{{ med.name }}</h4>
            <p>{{ med.time }} - {{ med.schedule }}</p>
          </div>
          <div class="medication-controls">
            <label class="switch">
              <input type="checkbox" v-model="med.enabled" @change="toggleMedicationAlarm(med)" />
              <span class="slider"></span>
            </label>
            <button class="edit-med-btn" @click="openEditMedicationModal(med)" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-med-btn" @click="deleteMedicationConfirm(med.id)" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommend -->
    <div class="section">
      <div class="section-header">
        <h3>AI 건강 추천</h3>
        <button
          v-if="!isNewUser"
          class="refresh-btn"
          @click="loadRecommendations"
          :disabled="loadingRecommendations"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingRecommendations }"></i>
        </button>
      </div>

      <!-- 신규 사용자 가이드 -->
      <div v-if="isNewUser" class="new-user-guide">
        <div class="guide-icon">
          <i class="fas fa-user-md"></i>
        </div>
        <h4>건강 정보를 설정해주세요</h4>
        <p>맞춤형 AI 건강 추천을 받으려면 먼저 건강 정보를 입력해주세요.</p>
        <div class="guide-steps">
          <div class="step-item">
            <span class="step-number">1</span>
            <div class="step-content">
              <strong>기저질환 추가</strong>
              <p>위의 노란색 카드에서 "수정" 버튼을 클릭하여 기저질환을 추가하세요.</p>
            </div>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <div class="step-content">
              <strong>복약 알람 설정</strong>
              <p>복약 알람 섹션에서 "추가" 버튼을 클릭하여 복용 중인 약을 등록하세요.</p>
            </div>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <div class="step-content">
              <strong>AI 추천 받기</strong>
              <p>정보 입력 후 자동으로 맞춤형 건강 추천이 생성됩니다!</p>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <button class="guide-btn primary" @click="scrollToDisease">
            <i class="fas fa-plus"></i> 기저질환 추가하기
          </button>
          <button class="guide-btn secondary" @click="scrollToMedication">
            <i class="fas fa-pills"></i> 복약 알람 설정하기
          </button>
        </div>
      </div>

      <!-- 기존 AI 추천 영역 -->
      <div v-else>
        <div v-if="loadingRecommendations" class="loading-message">
          <i class="fas fa-spinner fa-spin"></i> AI가 건강 추천을 생성하는 중...
        </div>
        <div v-else-if="recommendationError" class="error-message">
          {{ recommendationError }}
        </div>
        <div v-else-if="recommendations.length === 0" class="empty-message">
          건강 정보를 바탕으로 AI 추천을 생성합니다. 새로고침 버튼을 클릭하세요.
        </div>
        <div v-else class="recommendation-text" v-html="formatMarkdown(recommendationText)"></div>
      </div>
    </div>

    <!-- 기저질환 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>기저질환 수정</h3>
        <div class="disease-edit-list">
          <div v-for="disease in diseases" :key="disease.id" class="disease-edit-item">
            <input type="text" v-model="disease.name" />
            <button class="delete-disease-btn" @click="removeDiseaselocal(disease.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <button class="add-disease-btn" @click="addDisease">
          <i class="fas fa-plus"></i> 기저질환 추가
        </button>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeEditModal">취소</button>
          <button class="save-btn" @click="saveDiseases">저장</button>
        </div>
      </div>
    </div>

    <!-- 복약 알람 추가/수정 모달 -->
    <div v-if="showMedicationModal" class="modal-overlay" @click="closeMedicationModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingMedication ? '복약 알람 수정' : '복약 알람 추가' }}</h3>
        <div class="form-group">
          <label>약 이름</label>
          <input type="text" v-model="newMedication.name" placeholder="예: 아스피린" />
        </div>
        <div class="form-group">
          <label>복용량 (선택사항)</label>
          <input type="text" v-model="newMedication.dosage" placeholder="예: 1정" />
        </div>
        <div class="form-group">
          <label>복용 시간</label>
          <input type="time" v-model="newMedication.time" />
        </div>
        <div class="form-group">
          <label>알람 활성화</label>
          <label class="switch">
            <input type="checkbox" v-model="newMedication.alarmEnabled" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeMedicationModal">취소</button>
          <button class="save-btn" @click="saveMedication">
            {{ editingMedication ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'
import healthService from '../services/healthService'

const router = useRouter()

const diseases = ref([])
const medications = ref([])

const showEditModal = ref(false)
const showMedicationModal = ref(false)
const editingMedication = ref(null)

const newMedication = ref({
  name: '',
  time: '09:00',
  dosage: '',
  alarmEnabled: true
})

const originalDiseases = ref([])

// AI Recommendations
const recommendations = ref([])
const recommendationText = ref('')
const loadingRecommendations = ref(false)
const recommendationError = ref('')

const API_BASE_URL = 'http://localhost:8000/api/v1'

// 신규 사용자 여부 (기저질환과 복약 정보가 모두 없는 경우)
const isNewUser = computed(() => {
  return diseases.value.length === 0 && medications.value.length === 0
})

// 기저질환 섹션으로 스크롤
const scrollToDisease = () => {
  openEditModal()
}

// 복약 알람 섹션으로 스크롤
const scrollToMedication = () => {
  openMedicationModal()
}

// Load data from backend
onMounted(async () => {
  await loadDiseases()
  await loadMedications()

  // 신규 사용자가 아닐 때만 AI 추천 자동 로드
  if (!isNewUser.value) {
    await loadRecommendations()
  }
})

const loadDiseases = async () => {
  try {
    const data = await healthService.listDiseases()
    diseases.value = data.map((d, index) => ({
      ...d,
      id: d.diseaseId,
      color: ['orange', 'red', 'green', 'blue'][index % 4]
    }))
    originalDiseases.value = JSON.parse(JSON.stringify(diseases.value))
  } catch (error) {
    console.error('Failed to load diseases:', error)
  }
}

const loadMedications = async () => {
  try {
    const data = await healthService.listMedications()
    medications.value = data.map(m => ({
      ...m,
      id: m.medicationId,
      time: m.intakeTime || '09:00',
      schedule: '매일',
      enabled: m.alarmEnabled
    }))
  } catch (error) {
    console.error('Failed to load medications:', error)
  }
}

const goBack = () => router.go(-1)

const openEditModal = () => {
  originalDiseases.value = JSON.parse(JSON.stringify(diseases.value))
  showEditModal.value = true
}

const closeEditModal = () => {
  diseases.value = JSON.parse(JSON.stringify(originalDiseases.value))
  showEditModal.value = false
}

const openMedicationModal = () => {
  editingMedication.value = null
  newMedication.value = { name: '', time: '09:00', dosage: '', alarmEnabled: true }
  showMedicationModal.value = true
}

const openEditMedicationModal = (med) => {
  editingMedication.value = med
  newMedication.value = {
    name: med.name,
    time: med.time || '09:00',
    dosage: med.dosage || '',
    alarmEnabled: med.enabled
  }
  showMedicationModal.value = true
}

const closeMedicationModal = () => {
  showMedicationModal.value = false
  editingMedication.value = null
  newMedication.value = { name: '', time: '09:00', dosage: '', alarmEnabled: true }
}

const removeDiseaselocal = (id) => {
  const index = diseases.value.findIndex(d => d.id === id)
  if (index > -1) {
    diseases.value.splice(index, 1)
  }
}

const addDisease = () => {
  const newId = Date.now()
  diseases.value.push({
    id: newId,
    name: '새 질환',
    color: 'orange',
    diseaseId: undefined,
    status: 'Active'
  })
}

const saveDiseases = async () => {
  try {
    // Delete removed diseases
    for (const original of originalDiseases.value) {
      if (!diseases.value.find(d => d.id === original.id) && original.diseaseId) {
        await healthService.deleteDisease(original.diseaseId)
      }
    }

    // Create or update diseases
    for (const disease of diseases.value) {
      if (disease.diseaseId) {
        // Update existing
        await healthService.updateDisease(disease.diseaseId, {
          name: disease.name,
          status: disease.status || 'Active'
        })
      } else {
        // Create new
        await healthService.createDisease({
          name: disease.name,
          status: 'Active'
        })
      }
    }

    await loadDiseases()
    closeEditModal()

    // 신규 사용자가 처음으로 정보를 추가한 경우 AI 추천 자동 생성
    if (!isNewUser.value && diseases.value.length > 0) {
      await loadRecommendations()
    }
  } catch (error) {
    console.error('Failed to save diseases:', error)
    alert('기저질환 저장에 실패했습니다.')
  }
}

const saveMedication = async () => {
  if (!newMedication.value.name.trim()) {
    alert('약 이름을 입력해주세요')
    return
  }

  try {
    if (editingMedication.value) {
      // 수정
      await healthService.updateMedication(editingMedication.value.medicationId, {
        name: newMedication.value.name,
        dosage: newMedication.value.dosage,
        intakeTime: newMedication.value.time,
        alarmEnabled: newMedication.value.alarmEnabled
      })
    } else {
      // 추가
      await healthService.createMedication({
        name: newMedication.value.name,
        dosage: newMedication.value.dosage,
        intakeTime: newMedication.value.time,
        alarmEnabled: newMedication.value.alarmEnabled
      })
    }

    await loadMedications()
    closeMedicationModal()

    // 신규 사용자가 처음으로 정보를 추가한 경우 AI 추천 자동 생성
    if (!isNewUser.value && medications.value.length > 0) {
      await loadRecommendations()
    }
  } catch (error) {
    console.error('Failed to save medication:', error)
    alert(editingMedication.value ? '복약 알람 수정에 실패했습니다.' : '복약 알람 추가에 실패했습니다.')
  }
}

const deleteMedicationConfirm = async (id) => {
  if (!confirm('이 복약 알람을 삭제하시겠습니까?')) {
    return
  }

  try {
    const medication = medications.value.find(m => m.id === id)
    if (medication && medication.medicationId) {
      await healthService.deleteMedication(medication.medicationId)
      await loadMedications()
    }
  } catch (error) {
    console.error('Failed to delete medication:', error)
    alert('복약 알람 삭제에 실패했습니다.')
  }
}

const toggleMedicationAlarm = async (med) => {
  try {
    await healthService.updateMedication(med.medicationId, {
      name: med.name,
      dosage: med.dosage,
      intakeTime: med.time,
      alarmEnabled: med.enabled
    })
  } catch (error) {
    console.error('Failed to toggle alarm:', error)
    alert('알람 설정 변경에 실패했습니다.')
    // 실패 시 원래 값으로 되돌리기
    med.enabled = !med.enabled
  }
}

// 마크다운 포맷팅 함수
const formatMarkdown = (text: string): string => {
  if (!text) return ''

  let html = text

  // 코드 블록 (```) - 먼저 처리
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')

  // 인라인 코드 (`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // 볼드 (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // 이탤릭 (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')

  // 헤딩 (### Heading)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 리스트 항목
  const lines = html.split('\n')
  let inList = false
  let listType = ''
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/)
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/)

    if (unorderedMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ul class="markdown-list">')
        inList = true
        listType = 'ul'
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`)
    } else if (orderedMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ol class="markdown-list">')
        inList = true
        listType = 'ol'
      }
      processedLines.push(`<li>${orderedMatch[1]}</li>`)
    } else {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = ''
      }
      processedLines.push(line)
    }
  }

  if (inList) {
    processedLines.push(`</${listType}>`)
  }

  html = processedLines.join('\n')

  // 줄바꿈을 <br>로 변환 (리스트와 헤딩 제외)
  html = html.replace(/\n(?!<[uo]l|<\/[uo]l|<li|<\/li|<h[1-3]|<\/h[1-3])/g, '<br>')

  return html
}

// Load AI health recommendations
const loadRecommendations = async () => {
  loadingRecommendations.value = true
  recommendationError.value = ''

  try {
    // Build context from user's health data
    const diseasesList = diseases.value.map(d => d.name).join(', ')
    const medicationsList = medications.value.map(m => m.name).join(', ')

    let prompt = ''

    if (diseasesList || medicationsList) {
      prompt = `당신은 건강 전문가입니다. 다음 건강 정보를 가진 사용자에게 섭취하면 좋은 식품과 영양소를 추천해주세요.

`
      if (diseasesList) {
        prompt += `기저질환: ${diseasesList}\n`
      }
      if (medicationsList) {
        prompt += `복용 중인 약: ${medicationsList}\n`
      }
      prompt += `
위 건강 상태를 고려하여:
1. 섭취하면 좋은 식품 3-5가지
2. 필요한 영양소
3. 피해야 할 식품 (있다면)

을 간결하게 추천해주세요. 데이터베이스 조회 없이 직접 답변해주세요.`
    } else {
      prompt = `건강한 생활을 위해 일반적으로 섭취하면 좋은 식품과 영양소를 추천해주세요. 간단하고 명확하게 3-5가지 정도만 알려주세요.`
    }

    console.log('🏥 Requesting health recommendations from LLM:', prompt)

    // JWT 토큰 가져오기
    const token = localStorage.getItem('jwt_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('✅ JWT 토큰 추가됨 (AI 건강 추천)')
    } else {
      console.error('⚠️ JWT 토큰이 없습니다')
      throw new Error('로그인이 필요합니다')
    }

    const response = await fetch(`${API_BASE_URL}/chat-with-tools`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: prompt,
        stream: false
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Received health recommendations:', data)

    recommendationText.value = data.response || '추천 정보를 불러올 수 없습니다.'
    recommendations.value = [data.response] // Store as array for v-if check

  } catch (error) {
    console.error('Failed to load recommendations:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('로그인') || errorMessage.includes('인증')) {
      recommendationError.value = errorMessage
    } else {
      recommendationError.value = 'AI 추천을 불러오는데 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loadingRecommendations.value = false
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.health-page {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  padding-bottom: 80px;
}

/* Header */
.header {
  display: flex;
  justify-content: flex-start;
  font-size: 14px;
  margin-bottom: 1rem;
}
.back-btn {
  color: #ffc107;
  cursor: pointer;
}

/* Report Card */
.report-card {
  background-color: #fcd34d;
  border-radius: 20px;
  padding: 1rem;
  color: #1e1e1e;
  margin-bottom: 1rem;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.report-title {
  font-weight: bold;
}
.edit-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #1e1e1e;
  font-weight: 600;
  transition: background 0.2s ease;
}
.edit-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}
.disease-chart {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.disease-chart img {
  width: 80px;
  height: 80px;
}
.disease-chart ul {
  list-style: none;
  padding: 0;
  font-size: 14px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
}
.dot.orange {
  background-color: orange;
}
.dot.red {
  background-color: red;
}
.dot.green {
  background-color: green;
}

/* Section Common */
.section {
  margin-top: 1.5rem;
}
.section.dark h3 {
  color: #e0f2fe;
}
.section h3 {
  font-size: 16px;
  margin-bottom: 0.8rem;
}

/* Recommend Cards */
.recommend-card {
  background-color: #1f2c34;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.recommend-card img {
  width: 30px;
  height: 30px;
}
.recommend-card span {
  flex: 1;
}
.recommend-card .amount {
  font-weight: bold;
  color: #3dd598;
  text-align: right;
}

/* Medication Section */
.medication-section {
  margin-top: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
}

.add-btn {
  background: #60a5fa;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  transition: background 0.2s ease;
}

.add-btn:hover {
  background: #3b82f6;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.medication-item {
  background: #1f2c34;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.medication-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.medication-info p {
  font-size: 12px;
  color: #9ca3af;
}

.medication-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #6b7280;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4ade80;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.check-btn,
.edit-med-btn,
.delete-med-btn {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-size: 13px;
  transition: all 0.2s ease;
}

.edit-med-btn {
  background: #60a5fa;
}

.edit-med-btn:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}

.delete-med-btn {
  background: #ef4444;
}

.delete-med-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Modal Styles */
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.disease-edit-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.disease-edit-item {
  display: flex;
  gap: 0.5rem;
}

.disease-edit-item input {
  flex: 1;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 14px;
}

.delete-disease-btn {
  background: #ef4444;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  min-width: 40px;
}

.add-disease-btn {
  width: 100%;
  background: #60a5fa;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
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

.form-group input,
.form-group select {
  width: 100%;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
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

.cancel-btn:hover {
  background: #4b5563;
}

.save-btn:hover {
  background: #22c55e;
}

/* AI Recommendations */
.refresh-btn {
  background: #60a5fa;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #3b82f6;
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-message,
.error-message,
.empty-message {
  background: #1f2c34;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  font-size: 14px;
}

.loading-message {
  color: #60a5fa;
}

.error-message {
  color: #ef4444;
}

.empty-message {
  color: #9ca3af;
}

.recommendation-text {
  background: linear-gradient(135deg, #1f2c34 0%, #2a3f4d 100%);
  border-radius: 12px;
  padding: 1.2rem;
  font-size: 14px;
  line-height: 1.8;
  color: #e5e7eb;
  white-space: pre-wrap;
  border-left: 4px solid #60a5fa;
}

/* 신규 사용자 가이드 */
.new-user-guide {
  background: linear-gradient(135deg, #1f2c34 0%, #2a3f4d 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 2px solid rgba(61, 213, 152, 0.3);
}

.guide-icon {
  margin-bottom: 1rem;
}

.guide-icon i {
  font-size: 48px;
  color: #3dd598;
}

.new-user-guide h4 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}

.new-user-guide > p {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 1.5rem;
}

.guide-steps {
  text-align: left;
  margin-bottom: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  align-items: flex-start;
}

.step-number {
  background: linear-gradient(135deg, #3dd598, #2db87c);
  color: #0f1e25;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  font-size: 15px;
  color: #fff;
  margin-bottom: 0.3rem;
}

.step-content p {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}

.guide-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.guide-btn {
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.guide-btn.primary {
  background: linear-gradient(135deg, #3dd598, #2db87c);
  color: #0f1e25;
  box-shadow: 0 4px 12px rgba(61, 213, 152, 0.3);
}

.guide-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(61, 213, 152, 0.4);
}

.guide-btn.secondary {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.guide-btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(96, 165, 250, 0.4);
}

.guide-btn i {
  font-size: 16px;
}

/* 마크다운 스타일 */
.recommendation-text {
  line-height: 1.8;
  color: #e5e7eb;
}

.recommendation-text strong {
  font-weight: 700;
  color: #3dd598;
}

.recommendation-text em {
  font-style: italic;
  color: #60a5fa;
}

.recommendation-text h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 1rem 0 0.8rem 0;
  color: #3dd598;
  border-bottom: 2px solid rgba(61, 213, 152, 0.3);
  padding-bottom: 0.5rem;
}

.recommendation-text h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0.8rem 0 0.6rem 0;
  color: #3dd598;
}

.recommendation-text h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0.6rem 0 0.4rem 0;
  color: #60a5fa;
}

.recommendation-text :deep(.markdown-list) {
  margin: 0.8rem 0;
  padding-left: 1.5rem;
}

.recommendation-text :deep(.markdown-list li) {
  margin: 0.4rem 0;
  line-height: 1.6;
  position: relative;
}

.recommendation-text :deep(ul.markdown-list li) {
  list-style-type: none;
}

.recommendation-text :deep(ul.markdown-list li::before) {
  content: '•';
  color: #3dd598;
  font-weight: 700;
  font-size: 18px;
  position: absolute;
  left: -1.2rem;
}

.recommendation-text :deep(ol.markdown-list) {
  counter-reset: item;
  list-style-type: none;
  padding-left: 1.5rem;
}

.recommendation-text :deep(ol.markdown-list li) {
  counter-increment: item;
  list-style-type: none;
}

.recommendation-text :deep(ol.markdown-list li::before) {
  content: counter(item) '.';
  color: #60a5fa;
  font-weight: 700;
  position: absolute;
  left: -1.5rem;
}

.recommendation-text :deep(.code-block) {
  background: #1a2a35;
  border: 1px solid rgba(61, 213, 152, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.8rem 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.recommendation-text :deep(.code-block code) {
  color: #3dd598;
  background: transparent;
  padding: 0;
}

.recommendation-text :deep(.inline-code) {
  background: rgba(61, 213, 152, 0.1);
  color: #3dd598;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  border: 1px solid rgba(61, 213, 152, 0.2);
}

</style>
