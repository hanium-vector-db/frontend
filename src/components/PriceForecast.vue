<template>
  <div class="forecast-page">
    <!-- 상단 헤더 -->
    <div class="header">
      <span class="back-btn" @click="goBack">← Back</span>
    </div>

    <!-- 상단 제목 -->
    <h1 class="title">바나나 구매를<br />도와드릴게요</h1>

    <!-- 1) 주간 바나나 가격 변동 추이 (라인차트) -->
    <div class="card">
      <div class="chart-title">주간 바나나 가격 변동 추이</div>
      <!-- 기존 placeholder 대신 차트 컨테이너 -->
      <div ref="weeklyRef" class="bar-chart-placeholder"></div>
    </div>

    <!-- 2) 작년 대비 현재 가격 (막대차트) -->
    <div class="card">
      <div class="chart-title">작년 대비 현재 가격</div>
      <!-- 상단 좌측 라벨은 현재가 표시 -->
      <div class="line-chart-placeholder">
        <span class="label">{{ formatWon(currentPrice) }}</span>
        <!-- 실제 차트는 아래 div에 렌더 -->
        <div ref="yoyRef" style="position:absolute; inset:0; border-radius:12px;"></div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const goBack = () => router.go(-1)

// 차트 컨테이너 ref
const weeklyRef = ref(null)
const yoyRef = ref(null)

// 데이터 (더미) 생성
const weekly = ref([])       // [{date, value}]
const currentPrice = ref(0)  // 오늘가
const lastYearPrice = ref(0) // 작년가(더미)

// 포맷터
const formatWon = (v) => `${(v || 0).toLocaleString()}원`

let lineChart = null
let barChart  = null

function drawWeekly() {
  if (!weeklyRef.value) return
  lineChart = lineChart || echarts.init(weeklyRef.value)
  lineChart.setOption({
    grid: { left: 10, right: 8, top: 10, bottom: 22 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: weekly.value.map(d => d.date) },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: weekly.value.map(d => d.value)
    }]
  })
  lineChart.resize()
}

function drawYoY() {
  if (!yoyRef.value) return
  barChart = barChart || echarts.init(yoyRef.value)
  barChart.setOption({
    grid: { left: 28, right: 8, top: 14, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['작년', '현재'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [lastYearPrice.value, currentPrice.value],
      barWidth: '40%'
    }]
  })
  barChart.resize()
}

function handleResize() {
  lineChart && lineChart.resize()
  barChart && barChart.resize()
}

onMounted(() => {
  // 최근 14일 더미 데이터
  const base = 3500
  weekly.value = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(5, 10),
    value: Math.round(base + Math.sin(i / 2) * 120 + (Math.random() * 60 - 30))
  }))
  currentPrice.value = weekly.value[weekly.value.length - 1].value
  // 작년가(더미) — 현재가에 ±200 정도 변동
  lastYearPrice.value = Math.max(0, currentPrice.value + (Math.random() * 400 - 200))

  drawWeekly()
  drawYoY()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart && lineChart.dispose()
  barChart && barChart.dispose()
})
</script>

<style scoped>
.forecast-page {
  background-color: #0f1e25;
  color: white;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 1.5rem;
  padding-bottom: 80px;
  min-height: 100vh;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: flex-start;
  font-size: 14px;
  margin-bottom: 1rem;
}
.back-btn { color: #ffc107; cursor: pointer; }
.title { font-size: 24px; font-weight: bold; margin-bottom: 1.5rem; line-height: 1.4; }
.card { background-color: #1e2e36; border-radius: 20px; padding: 1rem; margin-bottom: 1.2rem; }
.chart-title { font-size: 14px; color: #ccc; margin-bottom: 0.6rem; }

/* 기존 placeholder 스타일을 차트 컨테이너로 재사용 */
.bar-chart-placeholder,
.line-chart-placeholder {
  background-color: #263843;
  height: 160px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #9ca3af;
  position: relative;
}

/* 현재가 라벨 */
.line-chart-placeholder .label {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #3dd598;
  color: #0f1e25;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
}
</style>
