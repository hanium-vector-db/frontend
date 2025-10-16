<template>
  <div class="voice-container">
    <!-- 상단 콘텐츠 영역 -->
    <div class="top-content">
      <!-- 음성 인식 중이 아닐 때 -->
      <div v-if="!isListening" class="idle-state">
        <div class="info-message">
          <i class="fas fa-microphone-alt"></i>
          <p>마이크 버튼을 눌러<br>음성 명령을 시작하세요</p>
        </div>
      </div>

      <!-- 음성 인식 중일 때 -->
      <div v-else class="listening-state">
        <!-- 상태 텍스트 -->
        <div class="listening-status">음성 인식 중...</div>

        <!-- 큰 마이크 아이콘 -->
        <div class="mic-icon-container">
          <div class="mic-pulse"></div>
          <i class="fas fa-microphone mic-icon"></i>
        </div>

        <!-- 파형 애니메이션 -->
        <div class="waveform-container">
          <div v-for="n in 30" :key="n" class="wave-bar" :style="getWaveBarStyle(n)" />
        </div>

        <!-- 인식된 텍스트 표시 영역 -->
        <div class="recognized-text">
          <div v-if="recognizedText" class="text-content">
            {{ recognizedText }}
          </div>
          <div v-else class="text-placeholder">
            말씀해주세요...
          </div>
        </div>

        <!-- 중단 버튼 -->
        <button class="stop-btn" @click="stopListening">
          <i class="fas fa-stop"></i>
          <span>음성 인식 중단</span>
        </button>
      </div>
    </div>

    <!-- 하단 명령 원 -->
    <div class="bottom-command">
      <div class="big-circle">
        <!-- 반원 위 5개 버튼 -->
        <div class="option news" @click="goToNews"><i class="fas fa-newspaper"></i></div>
        <div class="option health" @click="goToHealth"><i class="fas fa-heartbeat"></i></div>
        <div class="option mic" @click="startListening"><i class="fas fa-microphone"></i></div>
        <div class="option price" @click="goToPrice"><i class="fas fa-tag"></i></div>
        <div class="option finance" @click="goToFinance"><i class="fas fa-chart-line"></i></div>

        <!-- 중앙 홈 버튼 -->
        <div class="option home-center" @click="goToHome">
          <i class="fas fa-home"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isListening = ref(false)
const recognizedText = ref('')
const waveHeights = ref<number[]>(Array(30).fill(15))

// Web Audio API 변수
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let microphone: MediaStreamAudioSourceNode | null = null
let animationId: number | null = null
let mediaStream: MediaStream | null = null

// Web Speech API 변수
let recognition: any = null

// 파형 바 스타일 생성
const getWaveBarStyle = (index: number) => {
  const height = waveHeights.value[index - 1] || 15
  return {
    height: `${height}px`
  }
}

// 실시간 파형 데이터 분석 및 업데이트
const updateWaveform = () => {
  if (!analyser || !isListening.value) return

  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(dataArray)

  // 30개의 샘플로 파형 데이터 생성
  const newHeights: number[] = []
  const step = Math.floor(dataArray.length / 30)

  for (let i = 0; i < 30; i++) {
    const index = i * step
    const value = dataArray[index]
    // 값을 중심(128)에서 얼마나 벗어났는지 계산
    const amplitude = Math.abs(value - 128)
    // 값을 15~65 범위로 정규화 (더 민감하게)
    const height = 15 + (amplitude / 128) * 50
    newHeights.push(height)
  }

  waveHeights.value = newHeights

  // 계속 업데이트
  animationId = requestAnimationFrame(updateWaveform)
}

// 마이크 접근 및 오디오 분석 시작
const startAudioAnalysis = async () => {
  try {
    // 마이크 권한 요청
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // AudioContext 생성
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.3 // 더 빠른 반응을 위해 낮춤

    // 마이크 스트림 연결
    microphone = audioContext.createMediaStreamSource(mediaStream)
    microphone.connect(analyser)

    // 파형 업데이트 시작
    updateWaveform()

    console.log('🎤 오디오 분석 시작')
  } catch (error) {
    console.error('마이크 접근 오류:', error)
    alert('마이크 접근 권한이 필요합니다.')
    stopListening()
  }
}

// 음성 인식 시작
const startSpeechRecognition = () => {
  // Web Speech API 지원 확인
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('이 브라우저는 음성 인식을 지원하지 않습니다.')
    recognizedText.value = '이 브라우저는 음성 인식을 지원하지 않습니다.'
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'ko-KR'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event: any) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
      } else {
        interimTranscript += transcript
      }
    }

    recognizedText.value = finalTranscript + interimTranscript
  }

  recognition.onerror = (event: any) => {
    console.error('음성 인식 오류:', event.error)
    if (event.error === 'no-speech') {
      recognizedText.value = '음성이 감지되지 않았습니다. 다시 말씀해주세요.'
    } else if (event.error === 'network') {
      recognizedText.value = '네트워크 오류가 발생했습니다.'
    }
  }

  recognition.onend = () => {
    if (isListening.value) {
      // 자동으로 재시작
      recognition.start()
    }
  }

  recognition.start()
  console.log('🗣️ 음성 인식 시작')
}

// 오디오 분석 중지
const stopAudioAnalysis = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (microphone) {
    microphone.disconnect()
    microphone = null
  }

  if (analyser) {
    analyser.disconnect()
    analyser = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  // 파형 초기화
  waveHeights.value = Array(30).fill(15)
}

// 음성 인식 중지
const stopSpeechRecognition = () => {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}

const startListening = async () => {
  if (!isListening.value) {
    isListening.value = true
    recognizedText.value = ''

    // 오디오 분석 및 음성 인식 시작
    await startAudioAnalysis()
    startSpeechRecognition()
  }
}

const stopListening = () => {
  if (isListening.value) {
    isListening.value = false

    // 오디오 분석 및 음성 인식 중지
    stopAudioAnalysis()
    stopSpeechRecognition()

    console.log('🛑 음성 인식 중단됨')
  }
}

onUnmounted(() => {
  stopListening()
})

const goToHealth = () => {
  router.push('/health')
}

const goToNews = () => {
  router.push('/news')
}

const goToPrice = () => {
  router.push('/price')
}

const goToFinance = () => {
  router.push('/finance')
}

const goToHome = () => {
  router.push('/main_home')
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.voice-container {
  background-color: #0f1e25;
  color: white;
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 상단 콘텐츠 영역 */
.top-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  padding-bottom: 280px; /* 하단 아이콘 공간 확보 */
}

/* 대기 상태 */
.idle-state {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* 안내 메시지 */
.info-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.info-message:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(61, 213, 152, 0.3);
}

.info-message i {
  font-size: 52px;
  color: #3dd598;
  filter: drop-shadow(0 0 10px rgba(61, 213, 152, 0.3));
}

.info-message p {
  font-size: 17px;
  color: #d1d5db;
  text-align: center;
  line-height: 1.7;
  margin: 0;
  font-weight: 500;
}

/* 음성 인식 중 상태 */
.listening-state {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.listening-status {
  font-size: 20px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 마이크 아이콘 컨테이너 */
.mic-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(61, 213, 152, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

.mic-icon {
  font-size: 40px;
  color: #3dd598;
  z-index: 1;
  filter: drop-shadow(0 0 15px rgba(61, 213, 152, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 파형 컨테이너 */
.waveform-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 60px;
  width: 100%;
  margin: 0.5rem 0;
}

.wave-bar {
  width: 4px;
  min-height: 15px;
  background: linear-gradient(to top, #3dd598, #60a5fa);
  border-radius: 2px;
  transition: height 0.05s ease-out;
  will-change: height;
}

/* 인식된 텍스트 영역 */
.recognized-text {
  width: 100%;
  min-height: 50px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 0.5rem;
}

.text-content {
  font-size: 16px;
  color: white;
  line-height: 1.5;
}

.text-placeholder {
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
}

/* 중단 버튼 */
.stop-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  margin-top: 0.5rem;
}

.stop-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.stop-btn:active {
  transform: scale(0.98);
}

.stop-btn i {
  font-size: 16px;
}

/* 하단 명령 원형 UI */
.bottom-command {
  position: absolute;
  bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
.big-circle {
  width: 320px;
  height: 200px;
  position: relative;
  overflow: visible;
}
.big-circle::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 320px;
  border: 40px solid #1e333d;
  border-radius: 50%;
  border-bottom: none;
  box-sizing: border-box;
  top: 0;
  left: 0;
}
.option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #3dd598;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0f1e25;
  font-size: 20px;
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.option:hover {
  transform: scale(1.1);
}

/* 중앙 홈 버튼 - 배경 없음 */
.home-center {
  background-color: transparent !important;
  left: 50%;
  top: 60%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  color: #3dd598;
  font-size: 32px;
  width: 56px;
  height: 56px;
  z-index: 10;
}
.home-center:hover {
  transform: translate(-50%, -50%) scale(1.1) !important;
  color: #33c18a;
}

/* 반원 위 5개 버튼 - 좌측부터 시계방향으로 자연스럽게 배치 */
.news {
  background-color: #6366f1;
  left: 8%;
  top: 35%;
}
.health {
  background-color: #f87171;
  left: 22%;
  top: 12%;
}
.mic {
  background-color: #3dd598;
  left: 50%;
  top: 3%;
  transform: translateX(-50%);
}
.mic:hover {
  transform: translateX(-50%) scale(1.1);
}
.price {
  background-color: #fbbf24;
  right: 22%;
  top: 12%;
}
.finance {
  background-color: #60a5fa;
  right: 8%;
  top: 35%;
}
</style>
