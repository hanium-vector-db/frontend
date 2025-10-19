<template>
  <div class="asset-trend-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  financeItems: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  // 기존 차트 인스턴스가 있으면 파괴
  if (chartInstance) {
    chartInstance.destroy()
  }

  // 자산 데이터를 날짜별로 그룹화
  const assetsByDate = {}

  props.financeItems.forEach(item => {
    const date = new Date(item.createdAt).toLocaleDateString('ko-KR')
    if (!assetsByDate[date]) {
      assetsByDate[date] = 0
    }
    assetsByDate[date] += item.amount || 0
  })

  // 날짜 정렬
  const sortedDates = Object.keys(assetsByDate).sort((a, b) => {
    return new Date(a) - new Date(b)
  })

  // 누적 자산 계산
  const cumulativeData = []
  let cumulative = 0
  sortedDates.forEach(date => {
    cumulative += assetsByDate[date]
    cumulativeData.push(cumulative)
  })

  // 데이터가 없으면 기본 데이터 표시
  const labels = sortedDates.length > 0 ? sortedDates : ['오늘']
  const data = cumulativeData.length > 0 ? cumulativeData : [0]

  // 차트 생성
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '총 자산',
          data: data,
          borderColor: '#3dd598',
          backgroundColor: 'rgba(61, 213, 152, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3dd598',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3dd598',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return '총 자산: ' + context.parsed.y.toLocaleString('ko-KR') + '원'
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 10
            },
            callback: function(value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(0) + 'M'
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'K'
              }
              return value.toLocaleString('ko-KR')
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

// financeItems가 변경될 때마다 차트 업데이트
watch(() => props.financeItems, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.asset-trend-chart {
  width: 100%;
  height: 200px;
  position: relative;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
