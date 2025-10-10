<template>
  <div class="finance-detail-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>금융 상품</h2>
      <button class="alarm-btn" @click="showAlarmModal = true">
        <i class="fas fa-bell"></i>
      </button>
    </div>

    <!-- 카테고리 탭 -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="['tab', { active: activeCategory === category.id }]"
        @click="activeCategory = category.id"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 상품 리스트 -->
    <div class="products-list">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        @click="selectProduct(product)"
      >
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span class="bank">{{ product.bank }}</span>
        </div>
        <div class="product-info">
          <div class="info-item">
            <span class="label">금리/수익률</span>
            <span class="value rate">{{ product.rate }}%</span>
          </div>
          <div class="info-item">
            <span class="label">위험 등급</span>
            <span class="value" :class="getRiskClass(product.risk)">{{ product.risk }}</span>
          </div>
          <div class="info-item">
            <span class="label">조건</span>
            <span class="value condition">{{ product.condition }}</span>
          </div>
        </div>
        <div class="product-performance" v-if="product.performance">
          <span class="performance-label">최근 성과</span>
          <span :class="['performance-value', { positive: product.performance > 0 }]">
            {{ product.performance > 0 ? '+' : '' }}{{ product.performance }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 알림 등록 모달 -->
    <div v-if="showAlarmModal" class="modal-overlay" @click="showAlarmModal = false">
      <div class="modal-content" @click.stop>
        <h3>금융 알림 설정</h3>
        <div class="alarm-options">
          <label class="alarm-option">
            <input type="checkbox" v-model="alarmSettings.rateChange" />
            <span>금리 변동 알림</span>
          </label>
          <label class="alarm-option">
            <input type="checkbox" v-model="alarmSettings.newProduct" />
            <span>신규 상품 알림</span>
          </label>
          <label class="alarm-option">
            <input type="checkbox" v-model="alarmSettings.maturity" />
            <span>만기 도래 알림</span>
          </label>
        </div>
        <div class="form-group">
          <label>알림 주기</label>
          <select v-model="alarmSettings.frequency">
            <option value="realtime">실시간</option>
            <option value="daily">매일</option>
            <option value="weekly">매주</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showAlarmModal = false">취소</button>
          <button class="save-btn" @click="saveAlarmSettings">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  { id: 'all', name: '전체' },
  { id: 'deposit', name: '예금' },
  { id: 'fund', name: '펀드' },
  { id: 'stock', name: '주식' }
]

const activeCategory = ref('all')
const showAlarmModal = ref(false)

const products = ref([
  {
    id: 1,
    category: 'deposit',
    name: '국민은행 정기예금',
    bank: '국민은행',
    rate: 3.5,
    risk: '낮음',
    condition: '1년 이상',
    performance: null
  },
  {
    id: 2,
    category: 'deposit',
    name: '신한은행 자유적금',
    bank: '신한은행',
    rate: 3.2,
    risk: '낮음',
    condition: '자유 납입',
    performance: null
  },
  {
    id: 3,
    category: 'fund',
    name: 'KB Star 증권펀드',
    bank: 'KB증권',
    rate: 8.5,
    risk: '중간',
    condition: '연 0.5% 수수료',
    performance: 5.2
  },
  {
    id: 4,
    category: 'fund',
    name: '삼성 글로벌펀드',
    bank: '삼성증권',
    rate: 12.3,
    risk: '높음',
    condition: '연 1% 수수료',
    performance: -2.1
  },
  {
    id: 5,
    category: 'stock',
    name: 'KOSPI ETF',
    bank: '미래에셋',
    rate: 7.8,
    risk: '중간',
    condition: '거래 수수료 있음',
    performance: 3.5
  }
])

const alarmSettings = ref({
  rateChange: true,
  newProduct: false,
  maturity: true,
  frequency: 'daily'
})

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(p => p.category === activeCategory.value)
})

const getRiskClass = (risk) => {
  const classes = {
    '낮음': 'risk-low',
    '중간': 'risk-medium',
    '높음': 'risk-high'
  }
  return classes[risk] || ''
}

const selectProduct = (product) => {
  alert(`${product.name} 상세 정보를 확인합니다.`)
}

const saveAlarmSettings = () => {
  alert('알림 설정이 저장되었습니다!')
  showAlarmModal.value = false
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.finance-detail-page {
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

.alarm-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  background: #1a2a35;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab.active {
  background: #4ade80;
  border-color: #4ade80;
  color: #0f1e25;
  font-weight: 600;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.product-card:hover {
  background: #253d47;
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.product-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.bank {
  font-size: 12px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 13px;
  color: #9ca3af;
}

.value {
  font-size: 13px;
  font-weight: 600;
}

.value.rate {
  color: #4ade80;
  font-size: 16px;
}

.value.risk-low {
  color: #4ade80;
}

.value.risk-medium {
  color: #fbbf24;
}

.value.risk-high {
  color: #ef4444;
}

.value.condition {
  color: #d1d5db;
  font-size: 12px;
}

.product-performance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.performance-label {
  font-size: 12px;
  color: #9ca3af;
}

.performance-value {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
}

.performance-value.positive {
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

.alarm-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.alarm-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.alarm-option input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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
