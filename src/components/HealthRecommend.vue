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
              <input type="checkbox" v-model="med.enabled" />
              <span class="slider"></span>
            </label>
            <button class="check-btn" @click="checkMedication(med.id)" :disabled="!med.enabled">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Week History -->
    <div class="section dark">
      <h3>Week History</h3>
      <div class="history-icons">
        <div class="pill"><img src="https://cdn-icons-png.flaticon.com/512/811/811640.png" /><p>알레지 약</p></div>
        <div class="pill"><img src="https://cdn-icons-png.flaticon.com/512/3457/3457683.png" /><p>비타민 A</p></div>
        <div class="pill"><img src="https://cdn-icons-png.flaticon.com/512/3457/3457686.png" /><p>당삼</p></div>
        <div class="pill"><img src="https://cdn-icons-png.flaticon.com/512/1247/1247944.png" /><p>영양제</p></div>
      </div>
    </div>

    <!-- Recommend -->
    <div class="section">
      <h3>Recommend</h3>
      <div class="recommend-card">
        <img src="https://cdn-icons-png.flaticon.com/512/415/415682.png" />
        <span>오렌지</span>
        <span class="amount">1개</span>
      </div>
      <div class="recommend-card">
        <img src="https://cdn-icons-png.flaticon.com/512/634/634822.png" />
        <span>견과류(소금 무첨가)</span>
        <span class="amount">20g</span>
      </div>
      <div class="recommend-card">
        <img src="https://cdn-icons-png.flaticon.com/512/590/590685.png" />
        <span>바나나</span>
        <span class="amount">2송이</span>
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

    <!-- 복약 알람 추가 모달 -->
    <div v-if="showMedicationModal" class="modal-overlay" @click="closeMedicationModal">
      <div class="modal-content" @click.stop>
        <h3>복약 알람 추가</h3>
        <div class="form-group">
          <label>약 이름</label>
          <input type="text" v-model="newMedication.name" placeholder="예: 아스피린" />
        </div>
        <div class="form-group">
          <label>복용 시간</label>
          <input type="time" v-model="newMedication.time" />
        </div>
        <div class="form-group">
          <label>복용 주기</label>
          <select v-model="newMedication.schedule">
            <option value="매일">매일</option>
            <option value="아침">아침만</option>
            <option value="점심">점심만</option>
            <option value="저녁">저녁만</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeMedicationModal">취소</button>
          <button class="save-btn" @click="addMedication">추가</button>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'
import healthService from '../services/healthService'

const router = useRouter()

const diseases = ref([])
const medications = ref([])

const showEditModal = ref(false)
const showMedicationModal = ref(false)

const newMedication = ref({
  name: '',
  time: '09:00',
  dosage: '',
  alarmEnabled: true
})

const originalDiseases = ref([])

// Load data from backend
onMounted(async () => {
  await loadDiseases()
  await loadMedications()
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
  showMedicationModal.value = true
}

const closeMedicationModal = () => {
  showMedicationModal.value = false
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
  } catch (error) {
    console.error('Failed to save diseases:', error)
    alert('기저질환 저장에 실패했습니다.')
  }
}

const addMedication = async () => {
  if (!newMedication.value.name.trim()) {
    alert('약 이름을 입력해주세요')
    return
  }

  try {
    await healthService.createMedication({
      name: newMedication.value.name,
      dosage: newMedication.value.dosage,
      intakeTime: newMedication.value.time,
      alarmEnabled: newMedication.value.alarmEnabled
    })

    await loadMedications()
    closeMedicationModal()
  } catch (error) {
    console.error('Failed to add medication:', error)
    alert('복약 알람 추가에 실패했습니다.')
  }
}

const checkMedication = (id) => {
  alert(`약을 복용하셨습니다! (ID: ${id})`)
  // TODO: 복용 기록 저장 로직 추가
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

/* History */
.history-icons {
  display: flex;
  justify-content: space-between;
}
.pill {
  text-align: center;
  width: 25%;
}
.pill img {
  width: 42px;
  height: 42px;
}
.pill p {
  font-size: 12px;
  margin-top: 0.5rem;
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
  gap: 0.8rem;
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

.check-btn {
  background: #4ade80;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.check-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: scale(1.1);
}

.check-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.5;
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

</style>
