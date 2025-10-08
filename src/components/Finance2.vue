<template>
  <div class="finance-page">
    <!-- 📌 상단 제목 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
      <h1>My 금융</h1>
      <i class="fas fa-star star-icon"></i>
    </div>

    <!-- 종목 정보 -->
    <div class="stock-info">*SK하이닉스 263,000</div>

    <!-- 📊 바 차트 카드 -->
    <div class="card">
      <div class="bar-chart">📊 Bar Chart Placeholder</div>
    </div>

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
      <div class="asset-card red">
        <i class="fas fa-coins icon"></i>
        <div>예금/펀드/주택자산</div>
        <div class="percent">15%</div>
      </div>
      <div class="asset-card green">
        <i class="fas fa-piggy-bank icon"></i>
        <div>위험 자산</div>
        <div class="percent">79%</div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'

const router = useRouter()

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

.stock-info {
  font-size: 14px;
  color: #ccc;
  margin: 0.5rem 0 1rem;
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
.asset-card .percent {
  font-weight: bold;
  margin-top: 0.5rem;
}

.asset-card.red {
  background-color: #c0392b;
}
.asset-card.green {
  background-color: #27ae60;
}

</style>
