<template>
  <div class="kospi-chart-container">
    <div class="chart-header">
      <div class="chart-title-row">
        <div class="chart-title">
          <h3>코스피 (KOSPI)</h3>
          <span v-if="!isLoading" class="index-value" :class="priceChangeClass">
            {{ currentPrice.toLocaleString() }}
            <span class="change">{{ priceChangeText }}</span>
          </span>
          <span v-else class="index-value loading-text">로딩 중...</span>
        </div>
        <div class="market-status" :class="marketStatus.class">
          <span class="status-dot"></span>
          {{ marketStatus.text }}
        </div>
      </div>
      <div class="chart-controls">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="changePeriod(period.value)"
          :disabled="isLoading"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import yahooFinanceService from '@/services/yahooFinanceService'

// Chart.js 등록
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

const chartCanvas = ref(null)
const selectedPeriod = ref('5m')
const currentPrice = ref(2650.5)
const previousClose = ref(2640.0)
const currentTime = ref(new Date())
const isLoading = ref(true)
const errorMessage = ref('')
let chart = null
let updateInterval = null

const periods = [
  { label: '5분봉', value: '5m' },
  { label: '30분봉', value: '30m' },
  { label: '일봉', value: '1d' },
  { label: '주봉', value: '1w' },
  { label: '월봉', value: '1mo' }
]

const priceChange = computed(() => currentPrice.value - previousClose.value)
const priceChangePercent = computed(() => ((priceChange.value / previousClose.value) * 100).toFixed(2))
const priceChangeClass = computed(() => priceChange.value >= 0 ? 'positive' : 'negative')
const priceChangeText = computed(() => {
  const sign = priceChange.value >= 0 ? '+' : ''
  return `${sign}${priceChange.value.toFixed(2)} (${sign}${priceChangePercent.value}%)`
})

// 장중 여부 확인
const isMarketOpen = computed(() => {
  const now = currentTime.value
  const day = now.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // 주말 체크
  if (day === 0 || day === 6) {
    return false
  }

  // 평일 장중 시간: 09:00 ~ 15:30
  const marketOpen = 9 * 60 // 09:00
  const marketClose = 15 * 60 + 30 // 15:30

  return totalMinutes >= marketOpen && totalMinutes < marketClose
})

const marketStatus = computed(() => {
  if (isMarketOpen.value) {
    return {
      text: '장중',
      class: 'market-open'
    }
  } else {
    return {
      text: '장마감',
      class: 'market-closed'
    }
  }
})

// Yahoo Finance API를 통해 실제 코스피 데이터 가져오기
const fetchKospiData = async (period) => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // 히스토리컬 데이터 가져오기
    const historyData = await yahooFinanceService.getKospiHistory(period)

    if (!historyData || historyData.length === 0) {
      throw new Error('데이터를 가져올 수 없습니다')
    }

    // 현재 시세 가져오기
    const quote = await yahooFinanceService.getKospiQuote()

    if (quote) {
      currentPrice.value = quote.regularMarketPrice
      previousClose.value = quote.regularMarketPreviousClose
    }

    // 데이터 포맷 변환
    const labels = []
    const data = []
    let labelFormat = 'time'

    switch (period) {
      case '5m':
        labelFormat = 'time'
        break
      case '30m':
        labelFormat = 'datetime'
        break
      case '1d':
        labelFormat = 'date'
        break
      case '1w':
        labelFormat = 'date'
        break
      case '1mo':
        labelFormat = 'month'
        break
    }

    historyData.forEach((item) => {
      const time = new Date(item.time)

      if (labelFormat === 'time') {
        labels.push(time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      } else if (labelFormat === 'datetime') {
        labels.push(time.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) + ' ' +
                   time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      } else if (labelFormat === 'date') {
        labels.push(time.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }))
      } else if (labelFormat === 'month') {
        labels.push(time.toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' }))
      }

      data.push(parseFloat(item.price.toFixed(2)))
    })

    isLoading.value = false
    return { labels, data, startPrice: data[0] || previousClose.value }
  } catch (error) {
    console.error('Error fetching KOSPI data:', error)
    errorMessage.value = '코스피 데이터를 가져오는 중 오류가 발생했습니다'
    isLoading.value = false

    // 오류 발생 시 빈 데이터 반환
    return { labels: [], data: [], startPrice: 2640.0 }
  }
}

const initChart = async () => {
  await nextTick()

  if (!chartCanvas.value) {
    console.error('Chart canvas not found')
    return
  }

  try {
    const ctx = chartCanvas.value.getContext('2d')
    const { labels, data, startPrice } = await fetchKospiData(selectedPeriod.value)

    if (chart) {
      chart.destroy()
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '코스피',
          data: data,
          borderColor: '#3dd598',
          backgroundColor: 'rgba(61, 213, 152, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#3dd598',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#3dd598',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return '₩ ' + context.parsed.y.toLocaleString()
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#9ca3af',
              maxTicksLimit: 8,
              font: {
                size: 10
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return '₩' + value.toLocaleString()
              },
              font: {
                size: 10
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    })

    // 현재가 및 시작가 업데이트
    if (data.length > 0) {
      previousClose.value = startPrice
      currentPrice.value = data[data.length - 1]
    }

    console.log('Chart initialized successfully')
  } catch (error) {
    console.error('Error initializing chart:', error)
    errorMessage.value = '차트를 초기화하는 중 오류가 발생했습니다'
  }
}

const updateChartData = async (period) => {
  if (!chart) return

  try {
    const { labels, data, startPrice } = await fetchKospiData(period)

    chart.data.labels = labels
    chart.data.datasets[0].data = data
    chart.update('none') // 애니메이션 없이 즉시 업데이트

    // previousClose만 업데이트 (currentPrice는 그대로 유지)
    previousClose.value = startPrice
  } catch (error) {
    console.error('Error updating chart data:', error)
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  updateChartData(period)
}

// 실시간 데이터 업데이트 (실제 API 호출)
const startRealTimeUpdates = () => {
  updateInterval = setInterval(async () => {
    // 현재 시간 업데이트 (장중/장마감 상태 확인용)
    currentTime.value = new Date()

    try {
      // 현재 시세 가져오기
      const quote = await yahooFinanceService.getKospiQuote()

      if (quote && chart) {
        const newPrice = quote.regularMarketPrice

        currentPrice.value = newPrice
        previousClose.value = quote.regularMarketPreviousClose

        // 5분봉일 때만 차트에 실시간 업데이트
        if (selectedPeriod.value === '5m') {
          // 차트 데이터 업데이트
          chart.data.labels.shift()
          chart.data.labels.push(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))

          chart.data.datasets[0].data.shift()
          chart.data.datasets[0].data.push(newPrice)

          chart.update('none')
        }
      }
    } catch (error) {
      console.error('Error updating real-time data:', error)
    }
  }, 60000) // 60초마다 업데이트 (Yahoo Finance API rate limit 고려)
}

onMounted(async () => {
  console.log('KospiChart mounted')
  await initChart()
  startRealTimeUpdates()
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.kospi-chart-container {
  background-color: #1e2f38;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.chart-header {
  margin-bottom: 1rem;
}

.chart-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.chart-title {
  flex: 1;
}

.chart-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #e5e7eb;
}

.market-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.market-status.market-open {
  background-color: rgba(61, 213, 152, 0.15);
  color: #3dd598;
}

.market-status.market-closed {
  background-color: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.market-open .status-dot {
  background-color: #3dd598;
}

.market-closed .status-dot {
  background-color: #9ca3af;
  animation: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.index-value {
  font-size: 24px;
  font-weight: 700;
  display: block;
}

.index-value.positive {
  color: #3dd598;
}

.index-value.negative {
  color: #ef4444;
}

.change {
  font-size: 14px;
  margin-left: 0.5rem;
  font-weight: 500;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.period-btn {
  background: #273a45;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #ccc;
  transition: all 0.2s ease;
  font-weight: 500;
}

.period-btn.active {
  background: #3dd598;
  color: #0f1e25;
  font-weight: 600;
}

.period-btn:hover:not(.active) {
  background: #2d4a56;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 47, 56, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(61, 213, 152, 0.2);
  border-top-color: #3dd598;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #9ca3af;
  font-size: 18px;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}

.period-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
