<template>
  <div class="screen">
    <!-- 헤더 -->
    <header class="header">
      <h1>My 금융</h1>
    </header>

    <main class="content">
      <!-- 카드 1: 관심 종목 + 캔들 차트 -->
      <section class="card card-dark">
        <div class="row between mid">
          <div class="ticker">*{{ stockName }} {{ stockPrice.toLocaleString() }}</div>

          <!-- ⭐ 즐겨찾기 -->
          <button class="star-btn" @click="toggleFavorite" :aria-pressed="isFavorite">
            <svg viewBox="0 0 24 24" class="ico star"
                 :fill="isFavorite ? '#FFC93C' : 'rgba(255,255,255,0.25)'">
              <path d="M12 2l2.9 5.88 6.5.95-4.7 4.58 1.1 6.49L12 17.77 6.2 20.9l1.1-6.49L2.6 8.83l6.5-.95L12 2z"/>
            </svg>
          </button>
        </div>

        <div class="chart-wrap tall">
          <CandleChart :labels="candle.labels" :ohlc="candle.ohlc" />
        </div>
      </section>

      <!-- 카드 2: 월별 상승 추이 -->
      <section class="card card-dark">
        <div class="row between mid">
          <h3 class="title">월별 상승 추이</h3>
          <div class="legend">
            <span class="dot dot-yellow"></span> 공매도
            <span class="spacer"></span>
            <span class="dot dot-orange"></span> 대차거래잔고
          </div>
        </div>

        <div class="chart-wrap med">
          <MultiLineChart
            :labels="trend.labels"
            :series="[ 
              { name:'공매도',  data: trend.shortSell,  color: COLORS.yellow },
              { name:'대차거래잔고', data: trend.balanceLoan, color: COLORS.orange }
            ]"
          />
        </div>

        <div class="balloon">
          <span>$ 4865</span>
          <svg viewBox="0 0 16 8" class="tail"><path d="M0 0 L8 8 L16 0 Z"/></svg>
        </div>
      </section>

      <!-- 카드 3: 지표/자산 바 -->
      <section class="card card-mid">
        <div class="mini">
          <!-- 예금/펀드/주식 (주황/핑크톤) -->
          <div class="mini-item">
            <div class="mini-icon red">
              <svg viewBox="0 0 24 24" class="ico"><path fill="currentColor"
                d="M12 3v14l5-5 2 2-8 8-8-8 2-2 5 5V3z"/></svg>
            </div>
            <div class="mini-body">
              <div class="mini-title">예금/펀드/주식 자산</div>
              <!-- 게이지 = 퍼센트 색상과 동일 -->
              <ProgressBar :value="15" :color="COLORS.orange" />
            </div>
            <div class="mini-val" :style="{color: COLORS.orange}">15%</div>
          </div>

          <!-- 위험 자산 (노랑) -->
          <div class="mini-item">
            <div class="mini-icon amber">
              <svg viewBox="0 0 24 24" class="ico"><path fill="currentColor"
                d="M12 2l7 4v6c0 5-3.8 9.3-7 10-3.2-.7-7-5-7-10V6l7-4z"/></svg>
            </div>
            <div class="mini-body">
              <div class="mini-title">위험 자산</div>
              <ProgressBar :value="70" :color="COLORS.yellow" />
            </div>
            <div class="mini-val" :style="{color: COLORS.yellow}">70%</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 하단 네비 -->
    <BottomNav />
  </div>
</template>

<script>
import { h, ref, onMounted, onUnmounted, defineComponent, watch } from 'vue'
import Chart from 'chart.js/auto'
import BottomNav from './BottomNav.vue'

/* 색상 팔레트(그래프와 일치) */
const COLORS = {
  orange: '#FF6F61', // 대차거래잔고
  yellow: '#FFC93C'  // 공매도
}

/* 진행바 */
const ProgressBar = defineComponent({
  name: 'ProgressBar',
  props: {
    value: { type: Number, required: true },   // 0~100
    color: { type: String, default: COLORS.orange }
  },
  template: `
    <div class="bar">
      <div class="bar-fill"
           :style="{
             width: Math.max(0, Math.min(100, value)) + '%',
             background: color
           }"></div>
    </div>
  `
})

/* 멀티라인 (render 함수) */
const MultiLineChart = defineComponent({
  name: 'MultiLineChart',
  props: { labels: Array, series: Array },
  setup(props){
    const el = ref(null)
    let chart
    const renderChart = () => {
      if (!el.value) return
      if (chart) chart.destroy()
      const ctx = el.value.getContext('2d')
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: props.labels,
          datasets: props.series.map(s => ({
            label: s.name,
            data: s.data,
            borderColor: s.color,
            backgroundColor: s.color + '33',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }))
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks:{ color:'#AFC4CE' }, grid:{ color:'rgba(255,255,255,.08)' } },
            y: { ticks:{ color:'#AFC4CE' }, grid:{ color:'rgba(255,255,255,.08)' } }
          }
        }
      })
    }
    const onResize = () => chart?.resize()
    onMounted(()=>{ requestAnimationFrame(renderChart); window.addEventListener('resize', onResize) })
    onUnmounted(()=>{ window.removeEventListener('resize', onResize); chart?.destroy() })
    watch(()=>props.series, renderChart, { deep:true })
    return () => h('canvas', { ref: el, style: 'display:block;width:100%;height:100%' })
  }
})

/* 캔들 (render 함수) */
const CandleChart = defineComponent({
  name: 'CandleChart',
  props: { labels: Array, ohlc: Array },
  setup(props){
    const el = ref(null)
    let chart
    const renderChart = () => {
      if (!el.value) return
      if (chart) chart.destroy()
      const highs = props.ohlc.map(v => v.h)
      const lows  = props.ohlc.map(v => v.l)
      const ctx = el.value.getContext('2d')
      chart = new Chart(ctx, {
        type: 'line',
        data: { labels: props.labels, datasets: [{ data: highs, borderWidth: 0, pointRadius: 0 }] },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { ticks:{ color:'#AFC4CE' }, grid:{ color:'rgba(255,255,255,.10)' } },
            y: { ticks:{ color:'#AFC4CE' }, grid:{ color:'rgba(255,255,255,.10)' } }
          },
          animation: false
        },
        plugins: [{
          id: 'candles',
          afterDraw(chartInst) {
            const { ctx, chartArea, scales: { x, y } } = chartInst
            const bw = (chartArea.right - chartArea.left) / props.labels.length * 0.6
            props.ohlc.forEach((d, i) => {
              const color = d.c >= d.o ? '#29D17F' : COLORS.orange
              const cx = x.getPixelForValue(i)
              const yO = y.getPixelForValue(d.o)
              const yC = y.getPixelForValue(d.c)
              const yH = y.getPixelForValue(d.h)
              const yL = y.getPixelForValue(d.l)
              ctx.strokeStyle = color; ctx.lineWidth = 2
              ctx.beginPath(); ctx.moveTo(cx, yH); ctx.lineTo(cx, yL); ctx.stroke()
              ctx.fillStyle = color
              ctx.fillRect(cx - bw / 2, Math.min(yO, yC), bw, Math.max(2, Math.abs(yC - yO)))
              if (i === props.ohlc.length - 1) {
                ctx.beginPath()
                ctx.arc(cx + bw * 0.7, y.getPixelForValue(lows[i]), 4, 0, Math.PI * 2)
                ctx.fillStyle = COLORS.orange
                ctx.fill()
              }
            })
          }
        }]
      })
    }
    const onResize = () => chart?.resize()
    onMounted(()=>{ requestAnimationFrame(renderChart); window.addEventListener('resize', onResize) })
    onUnmounted(()=>{ window.removeEventListener('resize', onResize); chart?.destroy() })
    return () => h('canvas', { ref: el, style: 'display:block;width:100%;height:100%' })
  }
})

export default {
  name: 'Finance',
  components: { BottomNav, ProgressBar, MultiLineChart, CandleChart },
  setup(){
    const stockName = ref('SK하이닉스')
    const stockPrice = ref(263000)
    const isFavorite = ref(false)
    const toggleFavorite = () => (isFavorite.value = !isFavorite.value)

    const candle = ref({
      labels: ['1','2','3','4','5','6','7','8'],
      ohlc: [
        {o:4200,h:6200,l:3500,c:5600},
        {o:5600,h:6800,l:5200,c:5400},
        {o:5400,h:5900,l:4800,c:5200},
        {o:5200,h:6500,l:5000,c:6400},
        {o:6400,h:7000,l:6100,c:6300},
        {o:6300,h:6600,l:5900,c:6000},
        {o:6000,h:6400,l:5800,c:6100},
        {o:6100,h:6300,l:2000,c:2300}
      ]
    })

    const trend = ref({
      labels: ['1월','2월','3월','4월','5월','6월','7월','8월','9월'],
      shortSell:   [30,35,28,36,42,38,33,26,28],
      balanceLoan: [15,18,21,25,29,27,23,21,18]
    })

    return { COLORS, stockName, stockPrice, isFavorite, toggleFavorite, candle, trend }
  }
}
</script>

<style scoped>
/* 전체 화면 */
.screen{
  width:100%; min-height:100vh;
  background: linear-gradient(180deg,#1E2D33 0%, #1B2A30 100%);
  color:#EAF2F6;
  font-family:'Noto Sans KR',sans-serif;
  padding-bottom:120px; /* 하단 네비 공간 */
}

/* 헤더/컨텐츠 */
.header{ padding:20px 24px 8px; }
.header h1{ margin:0; font-size:28px; font-weight:800; }
.content{ padding:0 24px; display:grid; gap:16px; }

/* 카드 */
.card{ width:100%; border-radius:18px; padding:14px; box-shadow:0 10px 26px rgba(0,0,0,.25); }
.card-dark{ background:#2B3D44; border:1px solid rgba(255,255,255,.06); }
.card-mid { background:#2E3F46; border:1px solid rgba(255,255,255,.08); }

/* 행/텍스트 */
.row{ display:flex; } .mid{ align-items:center; } .between{ justify-content:space-between; }
.ticker{ font-weight:700; opacity:.95; }
.star-btn{ background:none; border:0; cursor:pointer; }
.star{ width:28px; height:28px; transition:fill .2s; }

/* 차트 컨테이너 높이 */
.chart-wrap{ margin-top:10px; }
.chart-wrap.tall{ height:300px; }
.chart-wrap.med { height:240px; }

/* 범례 */
.legend{ display:flex; align-items:center; gap:8px; font-size:13px; }
.dot{ width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px; }
.dot-yellow{ background:#FFC93C; } .dot-orange{ background:#FF6F61; }
.spacer{ width:12px; display:inline-block; }

/* 말풍선 */
.balloon{
  background:#FF6F61; color:#fff; font-weight:700; font-size:12px;
  padding:6px 10px; border-radius:999px; margin-top:8px;
  display:inline-flex; align-items:center; position:relative;
}
.balloon .tail{ width:16px; height:8px; fill:#FF6F61; position:absolute; left:18px; bottom:-7px; }

/* 미니 카드 */
.mini{ display:grid; gap:12px; }
.mini-item{
  display:grid; grid-template-columns:48px 1fr auto; align-items:center; gap:12px;
  background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06);
  border-radius:14px; padding:12px;
}
.mini-icon{ width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; }
.mini-icon.red{ background:#FF6F61; } .mini-icon.amber{ background:#FFC93C; }
.mini-title{ font-size:14px; opacity:.95; } .mini-val{ font-weight:800; }

/* 진행바 */
.bar{ width:100%; height:10px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden; }
.bar-fill{ height:100%; border-radius:999px; }

/* 공통 아이콘 */
.ico{ width:24px; height:24px; display:block; }
</style>
