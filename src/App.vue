<template>
  <div id="bbpool-app">
    <PageHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import PageHeader from './components/PageHeader.vue'
import { store } from './store/index.js'
import { CONSTANTS } from './constants.js'
import rosterData from './data/rosters2026.json'

store.rosterData = rosterData

onMounted(() => {
  // Restore cached MLB stats from localStorage
  try {
    const h = window.localStorage.getItem(CONSTANTS.RAW_HITTER_STATS)
    if (h) store.mlbHitters = JSON.parse(h)
  } catch (e) { console.error('cannot load cached hitters', e) }

  try {
    const p = window.localStorage.getItem(CONSTANTS.RAW_PITCHER_STATS)
    if (p) store.mlbPitchers = JSON.parse(p)
  } catch (e) { console.error('cannot load cached pitchers', e) }
})
</script>
