<template>
  <div class="roster-card">
    <h2 class="roster-title">
      [{{ rank }}] {{ info.name }}
      <span class="roster-owner">{{ info.owner }}</span>
      <span class="roster-grand-total">{{ totals.grandTotal }}</span>
    </h2>

    <!-- Hitter positions -->
    <div class="pos-section">
      <table v-for="pos in hitterPositions" :key="pos" class="pos-table">
        <thead>
          <tr>
            <th></th>
            <th><router-link :to="`/pos/${pos}`" class="pos-link">{{ pos }}</router-link></th>
            <th></th>
            <th>R</th><th>H</th><th>HR</th><th>RBI</th><th>SB</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, i) in rosterPlayers(pos)"
            :key="player.nickname"
            :class="rowClass(player, i, pos)"
          >
            <td class="rank-cell">{{ i + 1 }}</td>
            <td class="name-cell">
              <a v-if="playerUrl(player)" :href="playerUrl(player)" target="_blank">{{ player.name }}</a>
              <span v-else>{{ player.name }}</span>
            </td>
            <td class="team-cell">{{ player.team }}</td>
            <td class="stat-cell">{{ player.runs      || '' }}</td>
            <td class="stat-cell">{{ player.hits      || '' }}</td>
            <td class="stat-cell">{{ player.homeRuns  || '' }}</td>
            <td class="stat-cell">{{ player.rbi       || '' }}</td>
            <td class="stat-cell">{{ player.stolenBases || '' }}</td>
            <td class="total-cell">{{ player.total    || '' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="section-score">
        <span class="score-label">Hitters:</span>
        <span class="score-value">{{ totals.hitters.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Starters -->
    <div class="pos-section">
      <table class="pos-table">
        <thead>
          <tr>
            <th></th>
            <th><router-link to="/pos/SP" class="pos-link">SP</router-link></th>
            <th></th>
            <th>W</th><th>L</th><th>K</th><th>IP</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, i) in rosterPlayers('SP')"
            :key="player.nickname"
            :class="rowClass(player, i, 'SP')"
          >
            <td class="rank-cell">{{ i + 1 }}</td>
            <td class="name-cell">
              <a v-if="playerUrl(player)" :href="playerUrl(player)" target="_blank">{{ player.name }}</a>
              <span v-else>{{ player.name }}</span>
            </td>
            <td class="team-cell">{{ player.team }}</td>
            <td class="stat-cell">{{ player.wins           || '' }}</td>
            <td class="stat-cell">{{ player.losses         || '' }}</td>
            <td class="stat-cell">{{ player.strikeOuts     || '' }}</td>
            <td class="stat-cell">{{ player.inningsPitched || '' }}</td>
            <td class="total-cell">{{ player.total         || '' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="section-score">
        <span class="score-label">Starters:</span>
        <span class="score-value">{{ totals.SP.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Relievers -->
    <div class="pos-section">
      <table class="pos-table">
        <thead>
          <tr>
            <th></th>
            <th><router-link to="/pos/RP" class="pos-link">RP</router-link></th>
            <th></th>
            <th>Sv</th><th>W</th><th>L</th><th>K</th><th>IP</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, i) in rosterPlayers('RP')"
            :key="player.nickname"
            :class="rowClass(player, i, 'RP')"
          >
            <td class="rank-cell">{{ i + 1 }}</td>
            <td class="name-cell">
              <a v-if="playerUrl(player)" :href="playerUrl(player)" target="_blank">{{ player.name }}</a>
              <span v-else>{{ player.name }}</span>
            </td>
            <td class="team-cell">{{ player.team }}</td>
            <td class="stat-cell">{{ player.saves          || '' }}</td>
            <td class="stat-cell">{{ player.wins           || '' }}</td>
            <td class="stat-cell">{{ player.losses         || '' }}</td>
            <td class="stat-cell">{{ player.strikeOuts     || '' }}</td>
            <td class="stat-cell">{{ player.inningsPitched || '' }}</td>
            <td class="total-cell">{{ player.total         || '' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="section-score">
        <span class="score-label">Closers:</span>
        <span class="score-value">{{ totals.RP.toFixed(2) }}</span>
      </div>
    </div>

    <div class="grand-total-row">
      <span class="score-label">Grand Total:</span>
      <span class="score-value">{{ totals.grandTotal }}</span>
    </div>
  </div>
</template>

<script setup>
import { mlbPlayerUrl } from '../utils/rosterHelpers.js'

const props = defineProps({
  rank:      Number,
  slug:      String,
  info:      Object,
  totals:    Object,
  scoreData: Object,
})

const hitterPositions = ['C', '1B', '2B', '3B', 'SS', 'OF']
const activeCount = { C: 1, '1B': 1, '2B': 1, '3B': 1, SS: 1, OF: 4, SP: 4, RP: 2 }

const rosterPlayers = (pos) => {
  const group = props.scoreData?.[pos]
  if (!group) return []
  return Object.values(group)
    .filter((p) => p.roster === props.slug)
    .sort((a, b) => b.total - a.total)
}

const rowClass = (player, index, pos) => ({
  'row-active':   index < (activeCount[pos] ?? 1),
  'row-bench':    index >= (activeCount[pos] ?? 1),
  'row-prospect': player.status === 'prospect',
})

const playerUrl = (player) => mlbPlayerUrl(player)
</script>
