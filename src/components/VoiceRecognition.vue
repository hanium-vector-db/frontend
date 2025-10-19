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
          <div class="section-label">🎤 인식된 음성:</div>
          <div v-if="recognizedText" class="text-content">
            {{ recognizedText }}
          </div>
          <div v-else class="text-placeholder">
            말씀해주세요...
          </div>
        </div>

        <!-- LLM 응답 표시 영역 -->
        <div v-if="isProcessing || llmResponse" class="llm-response">
          <div class="section-label">🤖 AI 응답:</div>
          <div class="response-content">
            <div v-if="isProcessing && !llmResponse" class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <div v-else class="text-content">
              <template v-for="(part, index) in parseResponseParts(llmResponse)" :key="index">
                <div v-if="part.type === 'text'" v-html="formatMarkdown(part.content)" class="markdown-content"></div>
                <button
                  v-else-if="part.type === 'link'"
                  class="page-link-btn"
                  @click="navigateToPage(part.path)"
                >
                  <i class="fas fa-external-link-alt"></i>
                  {{ part.description }}
                </button>
              </template>
              <span v-if="isProcessing" class="typing-cursor">▋</span>
            </div>
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
import axios from 'axios'

const router = useRouter()
const isListening = ref(false)
const recognizedText = ref('')
const llmResponse = ref('')
const isProcessing = ref(false)
const waveHeights = ref<number[]>(Array(30).fill(15))

const API_BASE_URL = 'http://localhost:8000/api/v1'

// Web Audio API 변수
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let microphone: MediaStreamAudioSourceNode | null = null
let animationId: number | null = null
let mediaStream: MediaStream | null = null

// Web Speech API 변수
let recognition: any = null

// LLM에 텍스트 전송 (스트리밍 + 툴콜링)
const sendToLLM = async (text: string) => {
  if (isProcessing.value) return

  isProcessing.value = true
  llmResponse.value = ''

  try {
    console.log('🤖 LLM에 요청 전송 (툴콜링 스트리밍):', text)

    // JWT 토큰 가져오기
    const token = localStorage.getItem('jwt_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('✅ JWT 토큰 추가됨')
    } else {
      console.warn('⚠️ JWT 토큰이 없습니다')
    }

    const response = await fetch(`${API_BASE_URL}/chat-with-tools`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: text,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body reader is null')
    }

    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        console.log('✅ 스트리밍 완료')
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // 'data: ' 제거

          if (data.trim()) {
            try {
              const parsed = JSON.parse(data)

              if (parsed.done) {
                console.log('✅ LLM 응답 완료:', fullResponse)
                break
              }

              if (parsed.content) {
                fullResponse += parsed.content
                llmResponse.value = fullResponse
              }
            } catch (e) {
              console.warn('JSON 파싱 실패:', data)
            }
          }
        }
      }
    }

    // 음성으로 응답 재생 (선택사항)
    // await playTTSResponse(fullResponse)
  } catch (error) {
    console.error('❌ LLM 요청 실패:', error)
    llmResponse.value = 'AI 응답을 가져오는데 실패했습니다.'
  } finally {
    isProcessing.value = false
  }
}

// TTS로 응답 재생 (선택사항)
const playTTSResponse = async (text: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/speech/text-to-speech`, {
      text: text,
      language: 'ko',
      slow: false
    }, {
      responseType: 'blob'
    })

    const audioUrl = URL.createObjectURL(response.data)
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (error) {
    console.error('TTS 재생 실패:', error)
  }
}

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

  recognition.onresult = async (event: any) => {
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

    // 최종 결과가 있으면 LLM에 전송
    if (finalTranscript.trim()) {
      await sendToLLM(finalTranscript.trim())
    }
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

    // 상태 초기화
    recognizedText.value = ''
    llmResponse.value = ''
    isProcessing.value = false

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

// 페이지로 이동
const navigateToPage = (path: string) => {
  router.push(path)
}

// 마크다운 포맷팅 함수
const formatMarkdown = (text: string): string => {
  if (!text) return ''

  let html = text

  // 코드 블록 (```) - 먼저 처리
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')

  // 인라인 코드 (`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // 볼드 (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // 이탤릭 (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')

  // 헤딩 (### Heading)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 리스트 항목
  const lines = html.split('\n')
  let inList = false
  let listType = ''
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/)
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/)

    if (unorderedMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ul class="markdown-list">')
        inList = true
        listType = 'ul'
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`)
    } else if (orderedMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`)
        processedLines.push('<ol class="markdown-list">')
        inList = true
        listType = 'ol'
      }
      processedLines.push(`<li>${orderedMatch[1]}</li>`)
    } else {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = ''
      }
      processedLines.push(line)
    }
  }

  if (inList) {
    processedLines.push(`</${listType}>`)
  }

  html = processedLines.join('\n')

  // 줄바꿈을 <br>로 변환 (리스트와 헤딩 제외)
  html = html.replace(/\n(?!<[uo]l|<\/[uo]l|<li|<\/li|<h[1-3]|<\/h[1-3])/g, '<br>')

  return html
}

// 응답을 텍스트와 링크로 파싱
const parseResponseParts = (text: string) => {
  if (!text) return []

  const parts: Array<{ type: string; content?: string; path?: string; description?: string }> = []
  const linkPattern = /\[PAGE:(\/[^:]+):([^\]]+)\]/g

  let lastIndex = 0
  let match

  while ((match = linkPattern.exec(text)) !== null) {
    // 링크 이전의 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      })
    }

    // 링크 추가
    parts.push({
      type: 'link',
      path: match[1],
      description: match[2]
    })

    lastIndex = match.index + match[0].length
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    })
  }

  return parts
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
  margin-top: 0.5rem;
}

.section-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  font-weight: 600;
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
  text-align: center;
}

/* LLM 응답 영역 */
.llm-response {
  width: 100%;
  min-height: 80px;
  background: rgba(61, 213, 152, 0.1);
  border: 1px solid rgba(61, 213, 152, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.75rem;
}

.response-content {
  min-height: 40px;
}

/* 로딩 애니메이션 */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #3dd598;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 타이핑 커서 애니메이션 */
.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  color: #3dd598;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
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

/* 페이지 링크 버튼 */
.page-link-btn {
  background: linear-gradient(135deg, #3dd598, #2db87c);
  color: #0f1e25;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  margin: 0.3rem 0.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(61, 213, 152, 0.3);
}

.page-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 213, 152, 0.4);
}

.page-link-btn:active {
  transform: translateY(0);
}

.page-link-btn i {
  font-size: 11px;
}

/* 마크다운 스타일 */
.markdown-content {
  line-height: 1.8;
  color: #e5e7eb;
}

.markdown-content strong {
  font-weight: 700;
  color: #3dd598;
}

.markdown-content em {
  font-style: italic;
  color: #60a5fa;
}

.markdown-content h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 1rem 0 0.8rem 0;
  color: #3dd598;
  border-bottom: 2px solid rgba(61, 213, 152, 0.3);
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0.8rem 0 0.6rem 0;
  color: #3dd598;
}

.markdown-content h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0.6rem 0 0.4rem 0;
  color: #60a5fa;
}

.markdown-content :deep(.markdown-list) {
  margin: 0.8rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(.markdown-list li) {
  margin: 0.4rem 0;
  line-height: 1.6;
  position: relative;
}

.markdown-content :deep(ul.markdown-list li) {
  list-style-type: none;
}

.markdown-content :deep(ul.markdown-list li::before) {
  content: '•';
  color: #3dd598;
  font-weight: 700;
  font-size: 18px;
  position: absolute;
  left: -1.2rem;
}

.markdown-content :deep(ol.markdown-list) {
  counter-reset: item;
  list-style-type: none;
  padding-left: 1.5rem;
}

.markdown-content :deep(ol.markdown-list li) {
  counter-increment: item;
  list-style-type: none;
}

.markdown-content :deep(ol.markdown-list li::before) {
  content: counter(item) '.';
  color: #60a5fa;
  font-weight: 700;
  position: absolute;
  left: -1.5rem;
}

.markdown-content :deep(.code-block) {
  background: #1a2a35;
  border: 1px solid rgba(61, 213, 152, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.8rem 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.markdown-content :deep(.code-block code) {
  color: #3dd598;
  background: transparent;
  padding: 0;
}

.markdown-content :deep(.inline-code) {
  background: rgba(61, 213, 152, 0.1);
  color: #3dd598;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  border: 1px solid rgba(61, 213, 152, 0.2);
}
</style>
