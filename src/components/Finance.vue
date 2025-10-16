<template>
  <div class="finance-page">
    <!-- 📌 상단 제목 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
      <h1>My 금융</h1>
      <i class="fas fa-star star-icon"></i>
    </div>

    <!-- 📊 코스피 실시간 차트 -->
    <KospiChart />

    <!-- 📈 예상 상승 추이 -->
    <div class="card">
      <div class="chart-title">예산 상승 추이</div>
      <div class="line-chart">
        <span class="tag">Bitcoin</span>
        <span class="tag">Ethereum</span>
        <div class="chart">📈 Line Chart Placeholder<br /><span class="price-label">54895</span></div>
      </div>
    </div>

    <!-- 📦 자산 카드 -->
    <div class="card-row">
      <div class="asset-card safe">
        <i class="fas fa-piggy-bank icon"></i>
        <div>안전 자산</div>
        <div class="amount">{{ formatCurrency(safeAssetTotal) }}</div>
        <div class="percent">{{ safeAssetPercent }}%</div>
      </div>
      <div class="asset-card risky">
        <i class="fas fa-chart-line icon"></i>
        <div>위험 자산</div>
        <div class="amount">{{ formatCurrency(riskyAssetTotal) }}</div>
        <div class="percent">{{ riskyAssetPercent }}%</div>
      </div>
    </div>

    <!-- 총 자산 -->
    <div class="total-assets">
      <span>총 자산</span>
      <span class="total-amount">{{ formatCurrency(totalAssets) }}</span>
    </div>

    <!-- Finance Items Section -->
    <div class="section">
      <div class="section-header">
        <h3>보유 자산</h3>
        <button class="add-btn" @click="showAddModal = true">
          <i class="fas fa-plus"></i> 추가
        </button>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          :class="['filter-btn', { active: selectedCategory === null }]"
          @click="selectedCategory = null; loadFinanceItems()"
        >
          전체
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['filter-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat; loadFinanceItems()"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Finance Items List -->
      <div class="finance-list">
        <div v-for="item in financeItems" :key="item.id" class="finance-item">
          <div class="finance-item-header">
            <div class="item-left">
              <span :class="['category-badge', getRiskClass(item.category)]">{{ item.category }}</span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <button class="delete-btn" @click="deleteItem(item.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="finance-item-body">
            <span class="item-amount">{{ formatCurrency(item.amount) }}</span>
          </div>
          <p v-if="item.content" class="finance-content">{{ item.content }}</p>
          <span class="finance-date">{{ formatDate(item.createdAt) }}</span>
        </div>
        <div v-if="financeItems.length === 0" class="empty-state">
          등록된 자산이 없습니다.<br>
          <small>상단의 추가 버튼을 눌러 보유 자산을 등록하세요</small>
        </div>
      </div>
    </div>

    <!-- Add Finance Item Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <h3>자산 추가</h3>
        <div class="form-group">
          <label>자산 타입</label>
          <select v-model="newItem.category">
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
              <template v-if="isSafeAsset(cat)"> (안전자산)</template>
              <template v-else> (위험자산)</template>
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>자산 이름</label>
          <input
            v-model="newItem.name"
            type="text"
            placeholder="예: 삼성전자, 비트코인, KB정기예금 등"
          />
        </div>
        <div class="form-group">
          <label>금액 (원)</label>
          <input
            v-model.number="newItem.amount"
            type="number"
            placeholder="0"
            min="0"
          />
        </div>
        <div class="form-group">
          <label>메모 (선택)</label>
          <textarea v-model="newItem.content" rows="3" placeholder="추가 설명을 입력하세요 (선택사항)"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeAddModal">취소</button>
          <button class="save-btn" @click="addFinanceItem">추가</button>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'
import KospiChart from './KospiChart.vue'
import financeService, { ASSET_RISK_TYPES } from '../services/financeService'

const router = useRouter()

const financeItems = ref([])
const selectedCategory = ref(null)
const showAddModal = ref(false)

const categories = ['주식', 'ETF', '코인', '펀드', '예금', '적금', '채권', '국채', '선물', '옵션']

const newItem = ref({
  category: '주식',
  name: '',
  amount: 0,
  content: ''
})

onMounted(async () => {
  await loadFinanceItems()
})

const loadFinanceItems = async () => {
  try {
    const data = await financeService.listItems(selectedCategory.value)
    financeItems.value = data
  } catch (error) {
    console.error('Failed to load finance items:', error)
  }
}

// 안전자산 여부 확인
const isSafeAsset = (category) => {
  return ASSET_RISK_TYPES.SAFE.includes(category)
}

// 위험자산 여부 확인
const isRiskyAsset = (category) => {
  return ASSET_RISK_TYPES.RISKY.includes(category)
}

// 위험도에 따른 CSS 클래스
const getRiskClass = (category) => {
  return isSafeAsset(category) ? 'safe' : 'risky'
}

// 총 자산
const totalAssets = computed(() => {
  return financeItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 안전자산 총액
const safeAssetTotal = computed(() => {
  return financeItems.value
    .filter(item => isSafeAsset(item.category))
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 위험자산 총액
const riskyAssetTotal = computed(() => {
  return financeItems.value
    .filter(item => isRiskyAsset(item.category))
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 안전자산 비율
const safeAssetPercent = computed(() => {
  if (totalAssets.value === 0) return 0
  return Math.round((safeAssetTotal.value / totalAssets.value) * 100)
})

// 위험자산 비율
const riskyAssetPercent = computed(() => {
  if (totalAssets.value === 0) return 0
  return Math.round((riskyAssetTotal.value / totalAssets.value) * 100)
})

const addFinanceItem = async () => {
  if (!newItem.value.name.trim()) {
    alert('자산 이름을 입력해주세요')
    return
  }

  if (!newItem.value.amount || newItem.value.amount <= 0) {
    alert('금액을 입력해주세요')
    return
  }

  try {
    await financeService.createItem({
      category: newItem.value.category,
      name: newItem.value.name,
      amount: newItem.value.amount,
      content: newItem.value.content
    })
    // 자산 추가 후 전체 보기로 변경
    selectedCategory.value = null
    await loadFinanceItems()
    closeAddModal()
  } catch (error) {
    console.error('Failed to add finance item:', error)
    alert('자산 추가에 실패했습니다.')
  }
}

const deleteItem = async (id) => {
  if (!confirm('이 자산을 삭제하시겠습니까?')) return

  try {
    await financeService.deleteItem(id)
    await loadFinanceItems()
  } catch (error) {
    console.error('Failed to delete finance item:', error)
    alert('자산 삭제에 실패했습니다.')
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  newItem.value = { category: '주식', name: '', amount: 0, content: '' }
}

const formatCurrency = (amount) => {
  if (!amount) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.finance-page {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 1rem;
  padding-bottom: 100px;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  color: #ffc107;
  cursor: pointer;
  font-size: 14px;
}
.star-icon {
  color: gold;
}


.card {
  background-color: #1e2f38;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.bar-chart {
  height: 120px;
  background-color: #273a45;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 13px;
}

.chart-title {
  font-size: 14px;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.line-chart .tag {
  background-color: #3b82f6;
  color: white;
  padding: 2px 8px;
  margin-right: 8px;
  border-radius: 8px;
  font-size: 12px;
}

.chart {
  margin-top: 8px;
  background-color: #273a45;
  height: 120px;
  border-radius: 12px;
  text-align: center;
  padding-top: 30px;
  position: relative;
  color: #aaa;
}
.price-label {
  position: absolute;
  top: 8px;
  left: 10px;
  background-color: #3dd598;
  color: #0f1e25;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
}

/* 자산 카드들 */
.card-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.asset-card {
  flex: 1;
  background-color: #263944;
  border-radius: 14px;
  padding: 1rem;
  text-align: center;
  font-size: 13px;
  color: #fff;
}
.asset-card .icon {
  font-size: 20px;
  margin-bottom: 0.5rem;
}
.asset-card .amount {
  font-size: 16px;
  font-weight: 700;
  margin: 0.3rem 0;
}
.asset-card .percent {
  font-weight: bold;
  margin-top: 0.3rem;
  font-size: 14px;
}

.asset-card.safe {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
.asset-card.risky {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* 총 자산 */
.total-assets {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 14px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: white;
  font-weight: 600;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
}

/* Finance Items Section */
.section {
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

.category-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: #273a45;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #ccc;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #3dd598;
  color: #0f1e25;
  font-weight: 600;
}

.finance-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.finance-item {
  background: #1e2f38;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.finance-item:hover {
  background: #253d47;
  transform: translateY(-2px);
}

.finance-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex: 1;
}

.category-badge {
  background: #3b82f6;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.category-badge.safe {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.category-badge.risky {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.finance-item-body {
  margin: 0.5rem 0;
}

.item-amount {
  font-size: 18px;
  font-weight: 700;
  color: #3dd598;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  font-size: 14px;
  transition: color 0.2s ease;
}

.delete-btn:hover {
  color: #dc2626;
}

.finance-content {
  font-size: 14px;
  color: #e5e7eb;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.finance-date {
  font-size: 11px;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 14px;
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

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  background: #0f1e25;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #60a5fa;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input[type="number"] {
  text-align: right;
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
