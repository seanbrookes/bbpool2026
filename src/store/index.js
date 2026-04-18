import { reactive } from 'vue'
import { CONSTANTS } from '../constants.js'
import { getHitterStats, getPitcherStats } from '../data/fetchStats.js'

// Central reactive store — shared across all components and pages.
// mlbHitters / mlbPitchers shape: { timestamp: Number, stats: { [playerId]: statObj } }
export const store = reactive({
  rosterData:  {},
  mlbHitters:  null,
  mlbPitchers: null,
  isAdminMode: false,
  statsLoading: false,
})

export const refreshStats = async () => {
  if (store.statsLoading) return
  store.statsLoading = true
  try {
    const [hitterData, pitcherData] = await Promise.all([getHitterStats(), getPitcherStats()])

    if (hitterData?.stats) {
      const statsObj = {}
      hitterData.stats.forEach((p) => { statsObj[p.playerId] = p })
      store.mlbHitters = { timestamp: Date.now(), stats: statsObj }
      window.localStorage.setItem(CONSTANTS.RAW_HITTER_STATS, JSON.stringify(store.mlbHitters))
    }

    if (pitcherData?.stats) {
      const statsObj = {}
      pitcherData.stats.forEach((p) => { statsObj[p.playerId] = p })
      store.mlbPitchers = { timestamp: Date.now(), stats: statsObj }
      window.localStorage.setItem(CONSTANTS.RAW_PITCHER_STATS, JSON.stringify(store.mlbPitchers))
    }
  } catch (e) {
    console.error('refreshStats error', e)
  }
  store.statsLoading = false
}
