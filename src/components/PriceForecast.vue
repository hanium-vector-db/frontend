<template>
  <div class="forecast-page">
    <!-- 상단 헤더 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
      <h2 class="page-title">식료품 가격 비교</h2>
    </div>

    <!-- 카테고리 선택 -->
    <div class="category-section">
      <h3>카테고리 선택</h3>
      <div class="category-grid">
        <div
          v-for="category in categories"
          :key="category.name"
          class="category-card"
          :class="{ active: selectedCategory === category.name }"
          @click="selectCategory(category.name)"
        >
          <span class="category-emoji">{{ category.emoji }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ category.count }}개</span>
        </div>
      </div>
    </div>

    <!-- 상품 목록 -->
    <div v-if="selectedCategory" class="products-section">
      <h3>{{ selectedCategory }} 상품 목록</h3>
      <div class="product-list">
        <div
          v-for="product in filteredProducts"
          :key="product.product"
          class="product-card"
          @click="selectProduct(product)"
        >
          <div class="product-header">
            <h4>{{ product.product }}</h4>
            <span class="product-unit">{{ product.unit }}</span>
          </div>
          <div class="product-price-range">
            <span class="min-price">{{ formatWon(getMinPrice(product)) }}</span>
            <span class="price-separator">~</span>
            <span class="max-price">{{ formatWon(getMaxPrice(product)) }}</span>
          </div>
          <div class="product-stores">
            {{ product.stores.length }}개 매장
          </div>
        </div>
      </div>
    </div>

    <!-- 상품 상세 모달 -->
    <div v-if="selectedProduct" class="overlay" @click.self="selectedProduct=null">
      <div class="modal">
        <header class="modal-head">
          <div>
            <h3>{{ selectedProduct.product }}</h3>
            <span class="modal-unit">{{ selectedProduct.unit }}</span>
          </div>
          <button class="x" @click="selectedProduct=null">✕</button>
        </header>

        <div class="modal-body">
          <div class="price-info">
            <div class="price-stat">
              <span class="label">최저가</span>
              <span class="value best">{{ formatWon(getMinPrice(selectedProduct)) }}</span>
            </div>
            <div class="price-stat">
              <span class="label">최고가</span>
              <span class="value">{{ formatWon(getMaxPrice(selectedProduct)) }}</span>
            </div>
            <div class="price-stat">
              <span class="label">평균가</span>
              <span class="value">{{ formatWon(getAvgPrice(selectedProduct)) }}</span>
            </div>
          </div>

          <div class="stores-list">
            <h4>매장별 가격 비교</h4>
            <div
              v-for="(store, idx) in sortedStores(selectedProduct)"
              :key="idx"
              class="store-item"
              :class="{ best: idx === 0 }"
            >
              <div class="store-rank">{{ idx + 1 }}</div>
              <div class="store-info">
                <div class="store-name">
                  {{ store.name }}
                  <span v-if="idx === 0" class="best-badge">최저가</span>
                </div>
                <div class="store-location">{{ store.location }}</div>
                <div v-if="store.discount" class="store-discount">{{ store.discount }}</div>
              </div>
              <div class="store-price">{{ formatWon(store.price) }}</div>
            </div>
          </div>
        </div>

        <footer class="modal-foot">
          <button class="cta" @click="selectedProduct=null">확인</button>
        </footer>
      </div>
    </div>

    <!-- 하단 네비 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const goBack = () => router.go(-1)

interface Store {
  name: string
  price: number
  location: string
  discount: string | null
}

interface GroceryItem {
  category: string
  product: string
  unit: string
  stores: Store[]
}

const groceryData = ref<GroceryItem[]>([])
const selectedCategory = ref<string | null>(null)
const selectedProduct = ref<GroceryItem | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const categoryEmojiMap: Record<string, string> = {
  '과일': '🍎',
  '채소': '🥬',
  '육류': '🥩',
  '유제품': '🥛',
  '생활용품': '🧴',
  '곡물': '🌾',
  '간식': '🍪',
  '음료': '🥤',
  '수산물': '🐟',
  '양념': '🧂',
  '냉동식품': '🧊',
  '베이커리': '🍞',
  '계란': '🥚'
}

const categories = computed(() => {
  const categoryMap = new Map<string, number>()
  groceryData.value.forEach(item => {
    categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1)
  })

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
    emoji: categoryEmojiMap[name] || '🛒'
  }))
})

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return []
  return groceryData.value.filter(item => item.category === selectedCategory.value)
})

const formatWon = (v: number) => `${v.toLocaleString()}원`

const getMinPrice = (product: GroceryItem) => {
  return Math.min(...product.stores.map(s => s.price))
}

const getMaxPrice = (product: GroceryItem) => {
  return Math.max(...product.stores.map(s => s.price))
}

const getAvgPrice = (product: GroceryItem) => {
  const sum = product.stores.reduce((acc, s) => acc + s.price, 0)
  return Math.round(sum / product.stores.length)
}

const sortedStores = (product: GroceryItem) => {
  return [...product.stores].sort((a, b) => a.price - b.price)
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const selectProduct = (product: GroceryItem) => {
  selectedProduct.value = product
}

// 더미 데이터
const dummyGroceryData: GroceryItem[] = [
  {
    category: '과일',
    product: '사과',
    unit: '1kg',
    stores: [
      { name: '이마트 성수점', price: 8900, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 9500, location: '서울 송파구', discount: '10% 할인' },
      { name: '홈플러스 강동점', price: 8500, location: '서울 강동구', discount: null },
      { name: '동네슈퍼 행복마트', price: 10000, location: '서울 성동구', discount: null }
    ]
  },
  {
    category: '과일',
    product: '바나나',
    unit: '1송이',
    stores: [
      { name: '이마트 성수점', price: 3500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 3800, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 3200, location: '서울 강동구', discount: '특가' }
    ]
  },
  {
    category: '채소',
    product: '양파',
    unit: '1kg',
    stores: [
      { name: '이마트 성수점', price: 2500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 2800, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 2300, location: '서울 강동구', discount: '세일' },
      { name: '농협 하나로마트', price: 2000, location: '서울 성동구', discount: '직거래' }
    ]
  },
  {
    category: '채소',
    product: '당근',
    unit: '500g',
    stores: [
      { name: '이마트 성수점', price: 1500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 1800, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 1400, location: '서울 강동구', discount: null }
    ]
  },
  {
    category: '육류',
    product: '돼지고기 삼겹살',
    unit: '100g',
    stores: [
      { name: '이마트 성수점', price: 2500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 2800, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 2400, location: '서울 강동구', discount: '특가' },
      { name: '정육점 한우마을', price: 2900, location: '서울 성동구', discount: null }
    ]
  },
  {
    category: '육류',
    product: '닭가슴살',
    unit: '1kg',
    stores: [
      { name: '이마트 성수점', price: 7500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 8000, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 7200, location: '서울 강동구', discount: '세일' }
    ]
  },
  {
    category: '유제품',
    product: '우유',
    unit: '1L',
    stores: [
      { name: '이마트 성수점', price: 2800, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 3000, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 2700, location: '서울 강동구', discount: null },
      { name: 'GS25 편의점', price: 3200, location: '서울 성동구', discount: null }
    ]
  },
  {
    category: '유제품',
    product: '요구르트',
    unit: '4개입',
    stores: [
      { name: '이마트 성수점', price: 3500, location: '서울 성동구', discount: '1+1' },
      { name: '롯데마트 잠실점', price: 3800, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 3400, location: '서울 강동구', discount: null }
    ]
  },
  {
    category: '계란',
    product: '계란',
    unit: '30개',
    stores: [
      { name: '이마트 성수점', price: 6500, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 7000, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 6200, location: '서울 강동구', discount: '특가' },
      { name: '농협 하나로마트', price: 5800, location: '서울 성동구', discount: '직거래' }
    ]
  },
  {
    category: '곡물',
    product: '쌀',
    unit: '10kg',
    stores: [
      { name: '이마트 성수점', price: 35000, location: '서울 성동구', discount: null },
      { name: '롯데마트 잠실점', price: 36000, location: '서울 송파구', discount: null },
      { name: '홈플러스 강동점', price: 34500, location: '서울 강동구', discount: null },
      { name: '농협 하나로마트', price: 33000, location: '서울 성동구', discount: '햅쌀특가' }
    ]
  }
]

onMounted(async () => {
  try {
    loading.value = true
    error.value = null

    console.log('Loading grocery data with dummy data...')

    // 더미 데이터 사용
    groceryData.value = dummyGroceryData
    console.log('Loaded grocery data:', groceryData.value.length, 'items')

    // 첫 번째 카테고리를 기본 선택
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0].name
      console.log('Selected category:', selectedCategory.value)
    }
  } catch (err) {
    error.value = `Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`
    console.error('Error loading grocery data:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.forecast-page {
  background: #0f1e25;
  color: #fff;
  padding: 1.5rem;
  padding-bottom: 80px;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.back-btn {
  color: #ffc107;
  cursor: pointer;
  font-size: 14px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  flex: 1;
  text-align: center;
  margin-right: 60px;
}

/* 카테고리 섹션 */
.category-section {
  margin-bottom: 2rem;
}

.category-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #e5e7eb;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.8rem;
}

.category-card {
  background: #1a2a35;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.category-card:hover {
  border-color: #4ade80;
  background: #253d47;
}

.category-card.active {
  border-color: #4ade80;
  background: #253d47;
}

.category-emoji {
  font-size: 32px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
}

.category-count {
  font-size: 11px;
  color: #9ca3af;
}

/* 상품 목록 */
.products-section {
  margin-bottom: 2rem;
}

.products-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #e5e7eb;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.product-card {
  background: #1a2a35;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  border-color: #60a5fa;
  background: #253d47;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.product-header h4 {
  font-size: 15px;
  font-weight: 600;
}

.product-unit {
  font-size: 12px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.product-price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.min-price {
  font-size: 16px;
  font-weight: 700;
  color: #4ade80;
}

.price-separator {
  color: #6b7280;
}

.max-price {
  font-size: 14px;
  color: #9ca3af;
}

.product-stores {
  font-size: 12px;
  color: #60a5fa;
}

/* 모달 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: #1a2a35;
  color: #e5e7eb;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-head h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.modal-unit {
  font-size: 13px;
  color: #9ca3af;
}

.x {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.x:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.price-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.price-stat {
  background: #0f1e25;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.price-stat .label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.price-stat .value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
}

.price-stat .value.best {
  color: #4ade80;
}

.stores-list h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #e5e7eb;
}

.store-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #0f1e25;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  border: 2px solid transparent;
}

.store-item.best {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.store-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
}

.store-item.best .store-rank {
  background: #4ade80;
  color: #0f1e25;
}

.store-info {
  flex: 1;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.best-badge {
  background: #4ade80;
  color: #0f1e25;
  font-size: 11px;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
}

.store-location {
  font-size: 12px;
  color: #9ca3af;
}

.store-discount {
  font-size: 12px;
  color: #ffc107;
  margin-top: 0.2rem;
}

.store-price {
  font-size: 16px;
  font-weight: 700;
  color: #4ade80;
}

.modal-foot {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cta {
  width: 100%;
  background: #4ade80;
  color: #0f1e25;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cta:hover {
  background: #22c55e;
}
</style>
