<template>
  <div class="kospi-chart-container">
    <div class="chart-header">
      <div class="chart-title">
        <h3>코스피 (KOSPI)</h3>
        <span class="index-value" :class="priceChangeClass">
          {{ currentPrice.toLocaleString() }}
          <span class="change">{{ priceChangeText }}</span>
        </span>
      </div>
      <div class="chart-controls">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="changePeriod(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
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

// 실시간 데이터 시뮬레이션
const generateInitialData = (period, targetCurrentPrice = null) => {
  const labels = []
  const data = []
  let dataPoints = 100
  let timeInterval = 300000 // 기본 5분 (밀리초)
  let labelFormat = 'time'

  switch (period) {
    case '5m': // 5분봉
      dataPoints = 78 // 6.5시간 (하루 장시간)
      timeInterval = 5 * 60 * 1000 // 5분
      labelFormat = 'time'
      break
    case '30m': // 30분봉
      dataPoints = 78 // 39시간 (약 5일)
      timeInterval = 30 * 60 * 1000 // 30분
      labelFormat = 'datetime'
      break
    case '1d': // 일봉
      dataPoints = 120 // 4개월
      timeInterval = 24 * 60 * 60 * 1000 // 1일
      labelFormat = 'date'
      break
    case '1w': // 주봉
      dataPoints = 52 // 1년
      timeInterval = 7 * 24 * 60 * 60 * 1000 // 1주
      labelFormat = 'date'
      break
    case '1mo': // 월봉
      dataPoints = 60 // 5년
      timeInterval = 30 * 24 * 60 * 60 * 1000 // 1개월 (30일 기준)
      labelFormat = 'month'
      break
  }

  const now = new Date()

  // 현재가가 주어진 경우 역으로 계산, 아니면 랜덤 생성
  if (targetCurrentPrice !== null) {
    // 시작가를 현재가 기준으로 역산
    let basePrice = targetCurrentPrice - (Math.random() - 0.3) * 100

    for (let i = dataPoints; i >= 0; i--) {
      const time = new Date(now.getTime() - i * timeInterval)

      // 라벨 포맷에 따라 다르게 표시
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

      if (i === 0) {
        // 마지막 값은 정확히 현재가
        data.push(targetCurrentPrice)
      } else {
        const randomChange = (Math.random() - 0.5) * 20
        basePrice += randomChange
        data.push(parseFloat(basePrice.toFixed(2)))
      }
    }
  } else {
    // 초기 로딩: 랜덤 데이터 생성
    let basePrice = 2640.0

    for (let i = dataPoints; i >= 0; i--) {
      const time = new Date(now.getTime() - i * timeInterval)

      // 라벨 포맷에 따라 다르게 표시
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

      const randomChange = (Math.random() - 0.5) * 20
      basePrice += randomChange
      data.push(parseFloat(basePrice.toFixed(2)))
    }
  }

  return { labels, data, startPrice: data[0] }
}

const initChart = async () => {
  await nextTick()

  if (!chartCanvas.value) {
    console.error('Chart canvas not found')
    return
  }

  try {
    const ctx = chartCanvas.value.getContext('2d')
    const { labels, data, startPrice } = generateInitialData(selectedPeriod.value)

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
  }
}

const updateChartData = (period) => {
  if (!chart) return

  // 현재가를 유지하면서 데이터 재생성
  const { labels, data, startPrice } = generateInitialData(period, currentPrice.value)

  chart.data.labels = labels
  chart.data.datasets[0].data = data
  chart.update('none') // 애니메이션 없이 즉시 업데이트

  // previousClose만 업데이트 (currentPrice는 그대로 유지)
  previousClose.value = startPrice
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  updateChartData(period)
}

// 실시간 데이터 업데이트 시뮬레이션 (5분봉만)
const startRealTimeUpdates = () => {
  updateInterval = setInterval(() => {
    if (selectedPeriod.value === '5m' && chart) {
      const lastPrice = currentPrice.value
      const randomChange = (Math.random() - 0.5) * 5
      const newPrice = parseFloat((lastPrice + randomChange).toFixed(2))

      currentPrice.value = newPrice

      // 차트 데이터 업데이트
      chart.data.labels.shift()
      chart.data.labels.push(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))

      chart.data.datasets[0].data.shift()
      chart.data.datasets[0].data.push(newPrice)

      chart.update('none')
    }
  }, 3000) // 3초마다 업데이트
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

.chart-title {
  margin-bottom: 0.8rem;
}

.chart-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #e5e7eb;
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
</style>
