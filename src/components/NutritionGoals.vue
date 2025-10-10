<template>
  <div class="nutrition-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>건강·영양 목표</h2>
      <span></span>
    </div>

    <!-- 현재 상태 요약 -->
    <div class="summary-card">
      <h3>오늘의 영양 섭취</h3>
      <div class="nutrition-chart">
        <div class="chart-item">
          <div class="label">칼로리</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 65%"></div>
          </div>
          <div class="value">1300 / 2000 kcal</div>
        </div>
        <div class="chart-item">
          <div class="label">단백질</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 80%"></div>
          </div>
          <div class="value">80g / 100g</div>
        </div>
        <div class="chart-item">
          <div class="label">탄수화물</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 50%"></div>
          </div>
          <div class="value">150g / 300g</div>
        </div>
      </div>
    </div>

    <!-- 목표 설정 -->
    <div class="goals-section">
      <h3>나의 목표</h3>
      <div class="goal-card" v-for="goal in goals" :key="goal.id">
        <div class="goal-header">
          <span class="goal-name">{{ goal.name }}</span>
          <button class="edit-btn" @click="editGoal(goal)">
            <i class="fas fa-edit"></i>
          </button>
        </div>
        <div class="goal-content">
          <span class="target-value">{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}</span>
          <span class="goal-status" :class="getStatusClass(goal)">{{ getStatus(goal) }}</span>
        </div>
      </div>
      <button class="add-goal-btn" @click="showAddModal = true">
        <i class="fas fa-plus"></i> 목표 추가
      </button>
    </div>

    <!-- 추천 식품 -->
    <div class="recommendations-section">
      <h3>추천 식품</h3>
      <p class="section-desc">목표 달성을 위한 추천 식품입니다</p>
      <div class="food-list">
        <div class="food-card" v-for="food in recommendedFoods" :key="food.id">
          <div class="food-icon">{{ food.emoji }}</div>
          <div class="food-info">
            <h4>{{ food.name }}</h4>
            <p>{{ food.benefit }}</p>
            <span class="food-amount">{{ food.amount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 목표 추가/수정 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingGoal ? '목표 수정' : '목표 추가' }}</h3>
        <div class="form-group">
          <label>목표 항목</label>
          <select v-model="formData.name">
            <option>칼로리</option>
            <option>단백질</option>
            <option>탄수화물</option>
            <option>지방</option>
            <option>식이섬유</option>
            <option>비타민 C</option>
          </select>
        </div>
        <div class="form-group">
          <label>목표 수치</label>
          <input type="number" v-model="formData.targetValue" placeholder="목표 값을 입력하세요" />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">취소</button>
          <button class="save-btn" @click="saveGoal">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goals = ref([
  { id: 1, name: '칼로리', currentValue: 1300, targetValue: 2000, unit: 'kcal' },
  { id: 2, name: '단백질', currentValue: 80, targetValue: 100, unit: 'g' },
  { id: 3, name: '탄수화물', currentValue: 150, targetValue: 300, unit: 'g' }
])

const recommendedFoods = ref([
  { id: 1, name: '닭가슴살', emoji: '🍗', benefit: '고단백 저칼로리', amount: '100g (110kcal)' },
  { id: 2, name: '브로콜리', emoji: '🥦', benefit: '식이섬유 풍부', amount: '1컵 (55kcal)' },
  { id: 3, name: '현미밥', emoji: '🍚', benefit: '복합 탄수화물', amount: '1공기 (330kcal)' },
  { id: 4, name: '아보카도', emoji: '🥑', benefit: '건강한 지방', amount: '1/2개 (120kcal)' }
])

const showAddModal = ref(false)
const editingGoal = ref(null)
const formData = ref({
  name: '칼로리',
  targetValue: 2000
})

const getStatus = (goal) => {
  const percentage = (goal.currentValue / goal.targetValue) * 100
  if (percentage >= 100) return '달성'
  if (percentage >= 70) return '진행 중'
  return '시작'
}

const getStatusClass = (goal) => {
  const percentage = (goal.currentValue / goal.targetValue) * 100
  if (percentage >= 100) return 'achieved'
  if (percentage >= 70) return 'in-progress'
  return 'start'
}

const editGoal = (goal) => {
  editingGoal.value = goal
  formData.value = {
    name: goal.name,
    targetValue: goal.targetValue
  }
  showAddModal.value = true
}

const saveGoal = () => {
  if (editingGoal.value) {
    editingGoal.value.name = formData.value.name
    editingGoal.value.targetValue = formData.value.targetValue
  } else {
    const newId = Math.max(...goals.value.map(g => g.id), 0) + 1
    goals.value.push({
      id: newId,
      name: formData.value.name,
      currentValue: 0,
      targetValue: formData.value.targetValue,
      unit: formData.value.name === '칼로리' ? 'kcal' : 'g'
    })
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  editingGoal.value = null
  formData.value = { name: '칼로리', targetValue: 2000 }
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.nutrition-page {
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

.summary-card {
  background: linear-gradient(135deg, #1a2a35 0%, #253d47 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.nutrition-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.chart-item .label {
  font-size: 13px;
  color: #9ca3af;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.chart-item .value {
  font-size: 12px;
  color: #d1d5db;
}

.goals-section, .recommendations-section {
  margin-bottom: 2rem;
}

.goals-section h3, .recommendations-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.goal-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.goal-name {
  font-size: 14px;
  font-weight: 600;
}

.edit-btn {
  background: transparent;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  font-size: 14px;
}

.goal-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-value {
  font-size: 13px;
  color: #d1d5db;
}

.goal-status {
  font-size: 12px;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
}

.goal-status.achieved {
  background: #22c55e;
  color: white;
}

.goal-status.in-progress {
  background: #fbbf24;
  color: #0f1e25;
}

.goal-status.start {
  background: #6b7280;
  color: white;
}

.add-goal-btn {
  width: 100%;
  background: #1a2a35;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-goal-btn:hover {
  background: #253d47;
  border-color: #60a5fa;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.food-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.food-icon {
  font-size: 40px;
}

.food-info {
  flex: 1;
}

.food-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.food-info p {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 0.3rem;
}

.food-amount {
  font-size: 11px;
  color: #4ade80;
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
  padding: 0.8rem;
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
</style>
