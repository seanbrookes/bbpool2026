<template>
  <div class="home-page">

    <!-- No data state -->
    <div v-if="!rankedRosters.length" class="empty-state">
      Roster data unavailable. Make sure the Express server is running.
    </div>

    <!-- Leaderboard -->
    <div class="roster-grid">

      <RosterCard
        v-for="(entry, i) in rankedRosters"
        :key="entry.slug"
        :rank="i + 1"
        :slug="entry.slug"
        :info="entry.info"
        :totals="entry.totals"
        :score-data="scoreData"
      />
    </div>

    <!-- Quick links -->
    <div class="home-links">
      <a href="https://www.mlb.com/probable-pitchers" target="_blank">Probable pitchers</a>
      <a href="https://www.nbcsports.com/fantasy/baseball/player-news" target="_blank">Player news</a>
      <a href="https://sports.yahoo.com/mlb/scoreboard/" target="_blank">Scores</a>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import RosterCard from '../components/RosterCard.vue'
import { store } from '../store/index.js'
import { buildScoreData, getRosterTotals } from '../utils/rosterHelpers.js'

const scoreData = computed(() => {
  if (!Object.keys(store.rosterData).length) return {}
  return buildScoreData(
    store.rosterData,
    store.mlbHitters?.stats || null,
    store.mlbPitchers?.stats || null,
  )
})

const rankedRosters = computed(() => {
  if (!Object.keys(store.rosterData).length) return []
  return Object.keys(store.rosterData)
    .map((slug) => ({
      slug,
      info:   store.rosterData[slug],
      totals: getRosterTotals(slug, scoreData.value),
    }))
    .sort((a, b) => b.totals.grandTotal - a.totals.grandTotal)
})
</script>
