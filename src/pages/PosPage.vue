<template>
  <div class="pos-page">

    <div v-if="!hasData" class="empty-state">
      No stats loaded. Go to the <router-link to="/">home page</router-link> and click Refresh Stats.
    </div>

    <table v-else class="pos-grid-table">
      <caption class="pos-grid-caption">{{ pos }}</caption>
      <thead>
        <tr>
          <th></th>
          <th v-for="col in columns" :key="col.key">
            <button class="sort-btn" @click="onSort(col.key)">
              {{ col.label }}
              <span v-if="sortCol === col.key" class="sort-indicator">
                {{ sortDir === 'desc' ? '↓' : '↑' }}
              </span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(player, i) in players" :key="player.nickname" :class="rowClass(player)">
          <td class="rank-cell">{{ i + 1 }}</td>
          <td class="team-roster-cell">{{ player.roster }}</td>
          <td class="name-cell">
            <a v-if="playerUrl(player)" :href="playerUrl(player)" target="_blank">{{ player.name }}</a>
            <span v-else>{{ player.name }}</span>
          </td>
          <td class="team-cell">{{ player.team }}</td>
          <template v-if="isPitcher">
            <td v-if="pos === 'RP'" class="stat-cell">{{ player.saves        || '' }}</td>
            <td class="stat-cell">{{ player.wins           || '' }}</td>
            <td class="stat-cell">{{ player.losses         || '' }}</td>
            <td class="stat-cell">{{ player.strikeOuts     || '' }}</td>
            <td class="stat-cell">{{ player.inningsPitched || '' }}</td>
          </template>
          <template v-else>
            <td class="stat-cell">{{ player.runs        || '' }}</td>
            <td class="stat-cell">{{ player.hits        || '' }}</td>
            <td class="stat-cell">{{ player.homeRuns    || '' }}</td>
            <td class="stat-cell">{{ player.rbi         || '' }}</td>
            <td class="stat-cell">{{ player.stolenBases || '' }}</td>
          </template>
          <td class="total-cell">{{ player.total || '' }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { buildScoreData, mlbPlayerUrl } from '../utils/rosterHelpers.js'

const route  = useRoute()
const router = useRouter()

const pos     = computed(() => route.params.pos)
const sortCol = computed(() => route.query.sort || 'total')
const sortDir = computed(() => route.query.dir  || 'desc')

const isPitcher = computed(() => pos.value === 'SP' || pos.value === 'RP')

const columns = computed(() => {
  const base = [
    { key: 'roster', label: 'Roster' },
    { key: 'name',   label: 'Name'   },
    { key: 'team',   label: 'Team'   },
  ]
  if (pos.value === 'RP') return [...base,
    { key: 'saves',          label: 'Sv'    },
    { key: 'wins',           label: 'W'     },
    { key: 'losses',         label: 'L'     },
    { key: 'strikeOuts',     label: 'K'     },
    { key: 'inningsPitched', label: 'IP'    },
    { key: 'total',          label: 'Total' },
  ]
  if (pos.value === 'SP') return [...base,
    { key: 'wins',           label: 'W'     },
    { key: 'losses',         label: 'L'     },
    { key: 'strikeOuts',     label: 'K'     },
    { key: 'inningsPitched', label: 'IP'    },
    { key: 'total',          label: 'Total' },
  ]
  return [...base,
    { key: 'runs',        label: 'R'     },
    { key: 'hits',        label: 'H'     },
    { key: 'homeRuns',    label: 'HR'    },
    { key: 'rbi',         label: 'RBI'   },
    { key: 'stolenBases', label: 'SB'    },
    { key: 'total',       label: 'Total' },
  ]
})

const scoreData = computed(() => {
  if (!Object.keys(store.rosterData).length) return {}
  return buildScoreData(
    store.rosterData,
    store.mlbHitters?.stats  || null,
    store.mlbPitchers?.stats || null,
  )
})

const hasData = computed(() => Object.keys(scoreData.value).length > 0)

const players = computed(() => {
  const p = pos.value
  let list = []

  if (p === 'All') {
    ;['C', '1B', '2B', '3B', 'SS', 'OF'].forEach((hp) => {
      const group = scoreData.value[hp]
      if (group) list.push(...Object.values(group))
    })
  } else {
    const group = scoreData.value[p]
    if (group) list = Object.values(group)
  }

  const col = sortCol.value
  const dir = sortDir.value === 'asc' ? 1 : -1

  return list.slice().sort((a, b) => {
    const av = a[col] ?? (typeof a[col] === 'number' ? 0 : '')
    const bv = b[col] ?? (typeof b[col] === 'number' ? 0 : '')
    if (av < bv) return dir
    if (av > bv) return -dir
    return 0
  })
})

// Clicking a new column → desc; clicking active column → toggle direction
const onSort = (col) => {
  const newDir = sortCol.value === col && sortDir.value === 'desc' ? 'asc' : 'desc'
  router.push({ query: { sort: col, dir: newDir } })
}

const rowClass = (player) => ({
  'row-prospect': player.status === 'prospect',
})

const playerUrl = (player) => mlbPlayerUrl(player)
</script>
