<template>
  <header class="page-header">

    <div class="header-top">
      <router-link to="/" class="header-title">BB Pool 2026</router-link>
      <span v-if="lastUpdated" class="last-updated">last update: {{ lastUpdated }}</span>
      <button
        class="refresh-btn"
        :class="{ spinning: store.statsLoading }"
        :disabled="store.statsLoading"
        :aria-label="store.statsLoading ? 'Fetching stats…' : 'Refresh stats'"
        @click="refreshStats"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>

    <div class="header-bottom">
      <nav class="pos-nav">
        <router-link
          v-for="p in positions"
          :key="p"
          :to="`/pos/${p}`"
          class="pos-nav-link"
          :class="{ active: currentPos === p }"
        >{{ p }}</router-link>
      </nav>
      <div class="header-links">
        <a href="https://www.mlb.com/probable-pitchers" target="_blank">Probable</a>
        <a href="https://sports.yahoo.com/mlb/scoreboard/" target="_blank">Scores</a>
        <a href="https://www.nbcsports.com/fantasy/baseball/player-news" target="_blank">News</a>
      </div>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { store, refreshStats } from '../store/index.js'

const route = useRoute()
const positions = ['All', 'C', '1B', '2B', '3B', 'SS', 'OF', 'SP', 'RP']
const currentPos = computed(() => route.params.pos || null)

// Ticks every 15s so the relative timestamp stays fresh
const now = ref(Date.now())
let ticker = null
onMounted(()  => { ticker = setInterval(() => { now.value = Date.now() }, 15000) })
onUnmounted(() => clearInterval(ticker))

const lastUpdated = computed(() => {
  const ts = store.mlbHitters?.timestamp || store.mlbPitchers?.timestamp
  if (!ts) return null
  const s = Math.floor((now.value - ts) / 1000)
  if (s < 10)   return 'just now'
  if (s < 60)   return `${s} seconds ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m} minute${m === 1 ? '' : 's'} ago`
  const h = Math.floor(m / 60)
  return `${h} hour${h === 1 ? '' : 's'} ago`
})
</script>
