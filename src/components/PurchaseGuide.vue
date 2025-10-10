<template>
  <div class="purchase-guide-page">
    <div class="header">
      <span class="back-btn" @click="goBack">← 뒤로</span>
      <h2>구매 가이드</h2>
      <button class="budget-btn" @click="showBudgetModal = true">
        <i class="fas fa-wallet"></i>
      </button>
    </div>

    <!-- 예산 요약 -->
    <div class="budget-summary">
      <div class="budget-item">
        <span class="label">이번 주 예산</span>
        <span class="value">{{ weeklyBudget.toLocaleString() }}원</span>
      </div>
      <div class="budget-item">
        <span class="label">사용 금액</span>
        <span class="value spent">{{ usedBudget.toLocaleString() }}원</span>
      </div>
      <div class="budget-item">
        <span class="label">남은 예산</span>
        <span class="value remaining">{{ remainingBudget.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 최저가 상품 -->
    <div class="best-deals-section">
      <h3>오늘의 최저가</h3>
      <div class="deal-card" v-for="deal in bestDeals" :key="deal.id">
        <div class="deal-product">
          <span class="product-emoji">{{ deal.emoji }}</span>
          <div class="product-info">
            <h4>{{ deal.name }}</h4>
            <p>{{ deal.unit }}</p>
          </div>
        </div>
        <div class="deal-prices">
          <div class="price-comparison">
            <span class="old-price">{{ deal.avgPrice.toLocaleString() }}원</span>
            <span class="new-price">{{ deal.lowestPrice.toLocaleString() }}원</span>
            <span class="discount">{{ deal.discount }}% ↓</span>
          </div>
          <div class="seller">{{ deal.seller }}</div>
        </div>
        <button class="goto-btn" @click="goToStore(deal)">
          <i class="fas fa-map-marker-alt"></i>
        </button>
      </div>
    </div>

    <!-- 장바구니 추천 -->
    <div class="cart-suggestion">
      <h3>예산 내 장보기 추천</h3>
      <p class="section-desc">남은 예산으로 구매 가능한 조합입니다</p>
      <div class="suggestion-card">
        <div class="suggestion-header">
          <span>추천 조합 #1</span>
          <span class="total-price">{{ suggestedTotal.toLocaleString() }}원</span>
        </div>
        <div class="suggestion-items">
          <div class="item" v-for="item in suggestedItems" :key="item.id">
            <span class="emoji">{{ item.emoji }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="price">{{ item.price.toLocaleString() }}원</span>
          </div>
        </div>
        <button class="apply-btn">이 조합으로 장보기</button>
      </div>
    </div>

    <!-- 근처 마트 -->
    <div class="nearby-stores">
      <h3>근처 판매처</h3>
      <div class="store-card" v-for="store in nearbyStores" :key="store.id">
        <div class="store-info">
          <h4>{{ store.name }}</h4>
          <div class="store-details">
            <span class="distance">
              <i class="fas fa-map-marker-alt"></i> {{ store.distance }}
            </span>
            <span class="type">{{ store.type }}</span>
          </div>
        </div>
        <button class="navigate-btn" @click="navigateToStore(store)">
          길찾기
        </button>
      </div>
    </div>

    <!-- 예산 설정 모달 -->
    <div v-if="showBudgetModal" class="modal-overlay" @click="showBudgetModal = false">
      <div class="modal-content" @click.stop>
        <h3>예산 설정</h3>
        <div class="form-group">
          <label>주간 예산</label>
          <input type="number" v-model="weeklyBudget" placeholder="예산을 입력하세요" />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showBudgetModal = false">취소</button>
          <button class="save-btn" @click="saveBudget">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const weeklyBudget = ref(50000)
const usedBudget = ref(32000)

const remainingBudget = computed(() => weeklyBudget.value - usedBudget.value)

const bestDeals = ref([
  {
    id: 1,
    name: '사과',
    emoji: '🍎',
    unit: '1kg',
    avgPrice: 8000,
    lowestPrice: 5900,
    discount: 26,
    seller: '이마트 강남점'
  },
  {
    id: 2,
    name: '배추',
    emoji: '🥬',
    unit: '1포기',
    avgPrice: 5000,
    lowestPrice: 3500,
    discount: 30,
    seller: '롯데마트 서초점'
  },
  {
    id: 3,
    name: '달걀',
    emoji: '🥚',
    unit: '30구',
    avgPrice: 7500,
    lowestPrice: 6200,
    discount: 17,
    seller: '홈플러스 역삼점'
  }
])

const suggestedItems = ref([
  { id: 1, name: '사과', emoji: '🍎', price: 5900 },
  { id: 2, name: '바나나', emoji: '🍌', price: 3500 },
  { id: 3, name: '우유', emoji: '🥛', price: 2800 },
  { id: 4, name: '달걀', emoji: '🥚', price: 6200 }
])

const suggestedTotal = computed(() => {
  return suggestedItems.value.reduce((sum, item) => sum + item.price, 0)
})

const nearbyStores = ref([
  { id: 1, name: '이마트 강남점', distance: '0.8km', type: '대형마트' },
  { id: 2, name: '롯데마트 서초점', distance: '1.2km', type: '대형마트' },
  { id: 3, name: '동네슈퍼 행복점', distance: '0.3km', type: '동네마트' },
  { id: 4, name: '쿠팡 로켓배송', distance: '온라인', type: '온라인' }
])

const showBudgetModal = ref(false)

const saveBudget = () => {
  alert('예산이 저장되었습니다!')
  showBudgetModal.value = false
}

const goToStore = (deal) => {
  alert(`${deal.seller}로 이동합니다`)
}

const navigateToStore = (store) => {
  alert(`${store.name} 길찾기를 시작합니다`)
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.purchase-guide-page {
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

.budget-btn {
  background: #4ade80;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.budget-summary {
  background: linear-gradient(135deg, #1a2a35 0%, #253d47 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-around;
}

.budget-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.budget-item .label {
  font-size: 12px;
  color: #9ca3af;
}

.budget-item .value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.budget-item .value.spent {
  color: #ef4444;
}

.budget-item .value.remaining {
  color: #4ade80;
}

.best-deals-section h3,
.cart-suggestion h3,
.nearby-stores h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.deal-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.deal-product {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.product-emoji {
  font-size: 36px;
}

.product-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.product-info p {
  font-size: 12px;
  color: #9ca3af;
}

.deal-prices {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.price-comparison {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.old-price {
  font-size: 12px;
  color: #9ca3af;
  text-decoration: line-through;
}

.new-price {
  font-size: 16px;
  font-weight: 700;
  color: #4ade80;
}

.discount {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.seller {
  font-size: 11px;
  color: #60a5fa;
}

.goto-btn {
  background: #60a5fa;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
}

.cart-suggestion {
  margin: 2rem 0;
}

.suggestion-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.total-price {
  font-size: 16px;
  font-weight: 700;
  color: #4ade80;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.item .emoji {
  font-size: 24px;
}

.item .name {
  flex: 1;
  font-size: 13px;
}

.item .price {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
}

.apply-btn {
  width: 100%;
  background: #4ade80;
  border: none;
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.nearby-stores {
  margin-top: 2rem;
}

.store-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.store-details {
  display: flex;
  gap: 0.8rem;
  font-size: 12px;
  color: #9ca3af;
}

.distance {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.type {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 11px;
}

.navigate-btn {
  background: #60a5fa;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
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
