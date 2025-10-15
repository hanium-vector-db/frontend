<template>
  <!-- FAB 버튼 -->
  <button class="fab" @click="open = true">⚙️</button>

  <!-- 패널 -->
  <div v-if="open" class="drawer" @click.self="open = false">
    <aside class="panel">
      <header class="head">
        <strong>저장된 일일 보고서</strong>
        <div class="g">
          <button class="btn" @click="genDaily">일일 생성</button>
          <button class="x" @click="open = false">✕</button>
        </div>
      </header>

      <ul class="list">
        <li v-for="r in reports" :key="r.id">
          <span>{{ r.date }} · {{ r.type === 'daily' ? '일일' : '주간' }}</span>
          <a v-if="r.url" :href="r.url" target="_blank">다운로드</a>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Report = { id: string; date: string; type: 'daily' | 'weekly'; url?: string }

const open = ref(false)
const reports = ref<Report[]>([])

const KEY = 'reports-demo'

function load() {
  reports.value = JSON.parse(localStorage.getItem(KEY) || '[]')
}

function save(list: Report[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
  load()
}

function genDaily() {
  const newReport: Report = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    type: 'daily',
    url: '/sample.pdf'
  }
  save([newReport, ...reports.value])
}

onMounted(() => load())
</script>

<style scoped>
.fab {
  position: fixed;
  right: calc(50% - 195px + 16px);
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #111827;
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  z-index: 40;
}
.drawer {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 390px;
  max-width: 390px;
  height: 100vh;
  max-height: 844px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-end;
  z-index: 60;
}
.panel {
  width: 100%;
  height: 100%;
  background: #0b1220;
  color: #e5e7eb;
  padding: 14px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.g {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn {
  background: #1f2937;
  color: #fff;
  border-radius: 10px;
  padding: 6px 10px;
}
.x {
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
}
.list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #0f172a;
  border-radius: 8px;
}
.list a {
  color: #60a5fa;
}
</style>
