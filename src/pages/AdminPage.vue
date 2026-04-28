<template>
  <div class="admin-page">

    <div class="admin-header">
      <h2 class="admin-title">Admin</h2>
      <div class="admin-tabs">
        <button :class="['tab-btn', { active: activeSection === 'roster' }]" @click="activeSection = 'roster'">Roster Editor</button>
        <button :class="['tab-btn', { active: activeSection === 'mapper' }]" @click="activeSection = 'mapper'">Player Mapper</button>
      </div>
    </div>

    <!-- ── ROSTER EDITOR ── -->
    <div v-if="activeSection === 'roster'" class="roster-editor">

      <div class="add-player-section">
        <h3>Add Player</h3>
        <div class="add-player-row">
          <select v-model="newPlayer.roster">
            <option value="">— Roster —</option>
            <option v-for="(r, slug) in store.rosterData" :key="slug" :value="slug">{{ r.name }}</option>
          </select>
          <input v-model="newPlayer.name" placeholder="Name" class="add-name-input" />
          <select v-model="newPlayer.pos">
            <option value="">— Pos —</option>
            <option v-for="p in POSITIONS" :key="p" :value="p">{{ p }}</option>
          </select>
          <select v-model="newPlayer.team">
            <option value="">— Team —</option>
            <option v-for="t in AL_TEAMS" :key="t" :value="t">{{ t }}</option>
          </select>
          <select v-model="newPlayer.status">
            <option value="regular">regular</option>
            <option value="prospect">prospect</option>
            <option value="protected">protected</option>
          </select>
          <button @click="onAddPlayer" :disabled="saving">Add</button>
        </div>
        <div v-if="addErr" class="msg-error">{{ addErr }}</div>
        <div v-if="addMsg" class="msg-success">{{ addMsg }}</div>
      </div>

      <div v-for="(roster, slug) in store.rosterData" :key="slug" class="roster-section">
        <h3 class="roster-title">
          {{ roster.name }}
          <span class="owner-label">{{ roster.owner }}</span>
        </h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roster</th>
              <th>Pos</th>
              <th>Team</th>
              <th>Status</th>
              <th>MLB ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, idx) in roster.players" :key="idx" :class="{ 'row-pitcher': player.posType === 'pitcher' }">
              <td>
                <input v-model="player.name" class="player-name-input" @change="onPlayerFieldChanged" />
              </td>
              <td>
                <select :value="player.roster" @change="onRosterChanged(player, slug, $event)">
                  <option v-for="(r, rSlug) in store.rosterData" :key="rSlug" :value="rSlug">{{ r.name }}</option>
                </select>
              </td>
              <td>
                <select v-model="player.pos" @change="onPosChanged(player)">
                  <option v-for="p in POSITIONS" :key="p" :value="p">{{ p }}</option>
                </select>
              </td>
              <td>
                <select v-model="player.team" @change="onPlayerFieldChanged">
                  <option v-for="t in AL_TEAMS" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td>
                <select v-model="player.status" @change="onPlayerFieldChanged">
                  <option value="regular">regular</option>
                  <option value="prospect">prospect</option>
                  <option value="protected">protected</option>
                </select>
              </td>
              <td class="player-id-cell">{{ player.playerId || 0 }}</td>
              <td>
                <button class="delete-btn" @click="onDeletePlayer(player, slug)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── PLAYER MAPPER ── -->
    <div v-if="activeSection === 'mapper'" class="player-mapper">

      <div class="mapper-controls">
        <button @click="onLoadData" :disabled="store.statsLoading">
          {{ store.statsLoading ? 'Loading…' : 'Load Data' }}
        </button>
        <button @click="toggleHittersPitchers">
          {{ isShowHitters ? 'Showing: Hitters' : 'Showing: Pitchers' }}
        </button>
        <span class="mapper-status">
          {{ unmappedCount }} unmapped {{ isShowHitters ? 'hitters' : 'pitchers' }}
          <span v-if="!mlbList" class="no-data-note"> · MLB data not loaded</span>
        </span>
      </div>

      <div class="mapper-tabs">
        <button :class="['tab-btn', { active: mapperTab === 'auto' }]" @click="mapperTab = 'auto'">Auto-Map</button>
        <button :class="['tab-btn', { active: mapperTab === 'manual' }]" @click="mapperTab = 'manual'">Manual Map</button>
      </div>

      <!-- AUTO-MAP -->
      <div v-if="mapperTab === 'auto'" class="automap-panel">
        <div class="mapper-controls">
          <button @click="onRunAutoMap" :disabled="isAutoMapping">
            {{ isAutoMapping ? 'Running…' : 'Run Auto-Map' }}
          </button>
          <button v-if="matchLog.length && !isAutoMapping" @click="matchLog = []">Clear Log</button>
        </div>
        <div class="log-box" ref="logBoxRef">
          <div v-if="!matchLog.length" class="log-placeholder">
            Press "Run Auto-Map" to attempt automatic name matching for all unmapped
            {{ isShowHitters ? 'hitters' : 'pitchers' }}.
          </div>
          <template v-for="(entry, i) in matchLog" :key="i">
            <div v-if="entry.type === 'error'" class="log-line log-error">⚠ {{ entry.message }}</div>
            <div v-else-if="entry.type === 'info'" class="log-line log-info">ℹ {{ entry.message }}</div>
            <div v-else-if="entry.type === 'summary'" class="log-line log-summary">
              ✔ Complete — {{ entry.matched }} matched, {{ entry.notFound }} not found
              {{ entry.notFound > 0 ? ' (use Manual Map for the remainder)' : ' — all done!' }}
            </div>
            <div v-else-if="entry.status === 'matched'" class="log-line log-matched">
              ✓ {{ entry.playerName }}
              <span class="log-detail"> ({{ entry.roster }} · {{ entry.pos }})</span>
              <div class="log-sub">→ matched "{{ entry.mlbName }}" [ID: {{ entry.playerId }}] — saved ✓</div>
            </div>
            <div v-else-if="entry.status === 'not_found'" class="log-line log-not-found">
              ✗ {{ entry.playerName }}
              <span class="log-detail"> ({{ entry.roster }} · {{ entry.pos }})</span>
              <div class="log-sub">→ no match found — use Manual Map tab</div>
            </div>
          </template>
        </div>
      </div>

      <!-- MANUAL MAP -->
      <div v-if="mapperTab === 'manual'" class="manual-map-panel">
        <div v-if="pendingMatch" class="save-bar">
          Map <strong>{{ pendingMatch.rosterPlayer.name }}</strong> →
          <strong>{{ pendingMatch.mlbPlayer.playerName }}</strong>
          [{{ pendingMatch.mlbPlayer.playerId }}]
          <button @click="onSaveMatch">Save Match</button>
          <button @click="clearPending">Cancel</button>
        </div>
        <label class="show-mapped-toggle">
          <input type="checkbox" v-model="showMapped" /> Show already-mapped
        </label>
        <div class="two-col">
          <div class="col">
            <div class="col-label">Roster ({{ filteredRosterList.length }})</div>
            <input v-model="filterRoster" placeholder="Filter roster…" class="filter-input" />
            <div class="scroll-box">
              <div
                v-for="(player, i) in filteredRosterList"
                :key="i"
                class="player-row"
                :class="{ selected: selectedRosterPlayer === player }"
                @click="selectedRosterPlayer = selectedRosterPlayer === player ? null : player"
              >
                <span :class="['mapped-badge', player.playerId > 0 ? 'badge-mapped' : 'badge-unmapped']">
                  {{ player.playerId > 0 ? 'mapped' : 'unmapped' }}
                </span>
                {{ player.name }}
                <span class="player-meta"> {{ player.roster }} · {{ player.team }} · {{ player.pos }}</span>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="col-label">MLB {{ isShowHitters ? 'Hitters' : 'Pitchers' }} ({{ filteredMlbList.length }})</div>
            <input v-model="filterMlb" placeholder="Filter MLB players…" class="filter-input" />
            <div class="scroll-box">
              <div v-if="!mlbList" class="no-data">Load data first</div>
              <div
                v-for="(player, i) in filteredMlbList"
                :key="i"
                class="player-row"
                :class="{ selected: selectedMlbPlayer === player }"
                @click="selectedMlbPlayer = selectedMlbPlayer === player ? null : player"
              >
                {{ player.playerName }}
                <span class="player-meta"> [{{ player.playerId }}]</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="saveError" class="save-error">Save error: {{ saveError }}</div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { store, refreshStats } from '../store/index.js'
import { saveRosters } from '../data/saveRosters.js'

const POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'OF', 'SP', 'RP']
const AL_TEAMS  = ['ATH', 'BAL', 'BOS', 'CWS', 'CLE', 'DET', 'HOU', 'KC', 'LAA', 'MIN', 'NYY', 'SEA', 'TB', 'TEX', 'TOR']

// ── section / tab ─────────────────────────────────────────────────────────
const activeSection = ref('roster')
const mapperTab     = ref('auto')

// ── save ──────────────────────────────────────────────────────────────────
const saving   = ref(false)
const saveError = ref(null)

const doSave = async () => {
  saving.value    = true
  saveError.value = null
  try {
    await saveRosters(store.rosterData)
  } catch (e) {
    saveError.value = e.message
  }
  saving.value = false
}

// ── add player ────────────────────────────────────────────────────────────
const emptyNewPlayer = () => ({ name: '', roster: '', pos: '', team: '', status: 'regular' })
const newPlayer = ref(emptyNewPlayer())
const addErr    = ref('')
const addMsg    = ref('')

const toNickname = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

const onAddPlayer = async () => {
  addErr.value = ''
  addMsg.value = ''
  const { name, roster, pos, team } = newPlayer.value
  if (!name.trim()) { addErr.value = 'Name is required.';     return }
  if (!roster)      { addErr.value = 'Roster is required.';   return }
  if (!pos)         { addErr.value = 'Position is required.'; return }
  if (!team)        { addErr.value = 'Team is required.';     return }

  const player = {
    name:     name.trim(),
    nickname: toNickname(name),
    roster,
    pos,
    team,
    posType:  (pos === 'SP' || pos === 'RP') ? 'pitcher' : 'hitter',
    status:   newPlayer.value.status,
    playerId: 0,
    total:    0,
    newsLink: '',
  }
  store.rosterData[roster].players.push(player)
  await doSave()
  addMsg.value = `${player.name} added to ${store.rosterData[roster].name}.`
  newPlayer.value = emptyNewPlayer()
}

// ── roster editor ─────────────────────────────────────────────────────────
const onPosChanged = async (player) => {
  player.posType = (player.pos === 'SP' || player.pos === 'RP') ? 'pitcher' : 'hitter'
  await doSave()
}

const onPlayerFieldChanged = async () => { await doSave() }

const onDeletePlayer = async (player, slug) => {
  if (!confirm(`Delete ${player.name}?`)) return
  store.rosterData[slug].players = store.rosterData[slug].players.filter(p => p !== player)
  await doSave()
}

const onRosterChanged = async (player, oldSlug, event) => {
  const newSlug = event.target.value
  if (newSlug === oldSlug) return
  player.roster = newSlug
  store.rosterData[oldSlug].players = store.rosterData[oldSlug].players.filter(p => p !== player)
  store.rosterData[newSlug].players.push(player)
  await doSave()
}

// ── player mapper ─────────────────────────────────────────────────────────
const isShowHitters       = ref(true)
const showMapped          = ref(false)
const filterRoster        = ref('')
const filterMlb           = ref('')
const selectedRosterPlayer = ref(null)
const selectedMlbPlayer   = ref(null)
const matchLog            = ref([])
const isAutoMapping       = ref(false)
const logBoxRef           = ref(null)

const toggleHittersPitchers = () => {
  isShowHitters.value       = !isShowHitters.value
  filterRoster.value        = ''
  filterMlb.value           = ''
  selectedRosterPlayer.value = null
  selectedMlbPlayer.value   = null
}

const onLoadData = () => refreshStats()

const mlbList = computed(() => {
  const src = isShowHitters.value ? store.mlbHitters?.stats : store.mlbPitchers?.stats
  if (!src) return null
  return Object.values(src).sort((a, b) => a.playerName < b.playerName ? -1 : 1)
})

const rosterList = computed(() => {
  const list = []
  Object.values(store.rosterData).forEach(roster => {
    roster.players.forEach(player => {
      const isHitter = player.posType === 'hitter'
      if (isShowHitters.value ? isHitter : !isHitter) list.push(player)
    })
  })
  return list.sort((a, b) => a.name < b.name ? -1 : 1)
})

const filteredRosterList = computed(() =>
  rosterList.value
    .filter(p => showMapped.value || !p.playerId || p.playerId === 0)
    .filter(p => !filterRoster.value || p.name.toLowerCase().includes(filterRoster.value.toLowerCase()))
)

const filteredMlbList = computed(() =>
  (mlbList.value || [])
    .filter(p => !filterMlb.value || p.playerName.toLowerCase().includes(filterMlb.value.toLowerCase()))
)

const unmappedCount = computed(() =>
  rosterList.value.filter(p => !p.playerId || p.playerId === 0).length
)

const pendingMatch = computed(() =>
  selectedRosterPlayer.value && selectedMlbPlayer.value
    ? { rosterPlayer: selectedRosterPlayer.value, mlbPlayer: selectedMlbPlayer.value }
    : null
)

const clearPending = () => {
  selectedRosterPlayer.value = null
  selectedMlbPlayer.value    = null
}

const onSaveMatch = async () => {
  if (!pendingMatch.value) return
  pendingMatch.value.rosterPlayer.playerId = pendingMatch.value.mlbPlayer.playerId
  await doSave()
  clearPending()
}

const normalizeName = (name) =>
  name.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')

const onRunAutoMap = async () => {
  const sourceList = mlbList.value
  const targets    = rosterList.value.filter(p => !p.playerId || p.playerId === 0)
  const typeLabel  = isShowHitters.value ? 'hitters' : 'pitchers'

  isAutoMapping.value = true
  matchLog.value      = []

  if (!sourceList?.length) {
    matchLog.value      = [{ type: 'error', message: 'MLB data not loaded — click "Load Data" first.' }]
    isAutoMapping.value = false
    return
  }
  if (!targets.length) {
    matchLog.value      = [{ type: 'info', message: `All ${typeLabel} are already mapped — nothing to do.` }]
    isAutoMapping.value = false
    return
  }

  matchLog.value = [{ type: 'info', message: `Starting auto-map for ${targets.length} unmapped ${typeLabel}…` }]
  await new Promise(r => setTimeout(r, 80))

  let matched = 0, notFound = 0
  for (const player of targets) {
    await new Promise(r => setTimeout(r, 50))
    const mlbMatch = sourceList.find(p => normalizeName(p.playerName) === normalizeName(player.name))
    if (mlbMatch) {
      player.playerId = mlbMatch.playerId
      matched++
      matchLog.value = [...matchLog.value, {
        status: 'matched', playerName: player.name, roster: player.roster,
        pos: player.pos, mlbName: mlbMatch.playerName, playerId: mlbMatch.playerId,
      }]
    } else {
      notFound++
      matchLog.value = [...matchLog.value, {
        status: 'not_found', playerName: player.name, roster: player.roster, pos: player.pos,
      }]
    }
  }

  if (matched > 0) await doSave()

  matchLog.value  = [...matchLog.value, { type: 'summary', total: targets.length, matched, notFound }]
  isAutoMapping.value = false
}

watch(matchLog, async () => {
  await nextTick()
  if (logBoxRef.value) logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight
})
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  font-family: arial, sans-serif;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: .75rem;
  border-bottom: 2px solid #ddd;
}

.admin-title { margin: 0; font-size: 18px; color: #6d0000; }

.admin-tabs, .mapper-tabs {
  display: flex;
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 5px 14px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-bottom: none;
  background: #f5f5f5;
  margin-bottom: -2px;
}
.tab-btn.active { background: #fff; font-weight: 600; }

/* add player */
.add-player-section {
  background: #fffde7;
  border: 1px solid #ffe082;
  padding: .75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 3px;
}
.add-player-section h3 { margin: 0 0 .5rem 0; font-size: 13px; font-weight: 600; }
.add-player-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.add-player-row select, .add-player-row button {
  padding: 3px 6px; font-size: 12px; border: 1px solid #ccc; background: #f5f5f5; cursor: pointer;
}
.add-name-input { padding: 3px 6px; font-size: 12px; border: 1px solid #ccc; width: 160px; }
.add-player-row button:disabled { opacity: 0.5; cursor: default; }

.msg-error   { font-size: 11px; color: #c62828; margin-top: 4px; }
.msg-success { font-size: 11px; color: #2e7d32; margin-top: 4px; }

/* roster tables */
.roster-section { margin-bottom: 2rem; }

.roster-title {
  font-size: 15px; color: #6d0000; background: #eee;
  padding: 4px 8px; margin: 0 0 4px 0;
}
.owner-label { font-size: 11px; color: #888; font-weight: normal; margin-left: 8px; }

.admin-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.admin-table th {
  border-bottom: 1px solid #ddd; padding: 3px 6px;
  text-align: left; font-size: 11px; font-weight: 600; color: #555;
}
.admin-table td { border-bottom: 1px solid #f0f0f0; padding: 2px 4px; }
.admin-table tr.row-pitcher td { background: #f9f9ff; }

.player-name-input {
  font-size: 12px; border: 1px solid transparent;
  padding: 2px 4px; width: 160px; background: transparent;
}
.player-name-input:focus { border-color: #aaa; background: #fff; outline: none; }

.admin-table select { font-size: 11px; border: 1px solid #ddd; padding: 1px 2px; background: transparent; }

.player-id-cell { font-size: 11px; color: #888; }

.delete-btn {
  background: none; border: none; cursor: pointer;
  color: #c62828; font-size: 12px; padding: 0 4px; opacity: 0.4;
}
.delete-btn:hover { opacity: 1; }

/* mapper */
.mapper-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
.mapper-controls button {
  padding: 4px 10px; font-size: 12px; cursor: pointer; border: 1px solid #ccc; background: #f5f5f5;
}
.mapper-controls button:disabled { opacity: 0.5; cursor: default; }
.mapper-status  { font-size: 11px; color: #888; }
.no-data-note   { color: #e65100; }

.log-box {
  height: 380px; overflow-y: scroll;
  font-family: monospace; font-size: 12px;
  background: #1a1a1a; color: #ccc; padding: 10px; border-radius: 3px;
}
.log-placeholder { color: #555; }
.log-line        { padding: 3px 0; line-height: 1.5; }
.log-error       { color: #f48771; }
.log-info        { color: #9cdcfe; }
.log-summary     { color: #dcdcaa; border-top: 1px solid #333; margin-top: 6px; padding-top: 4px; }
.log-matched     { color: #4ec9b0; }
.log-not-found   { color: #f48771; }
.log-detail      { color: #608b4e; font-size: 10px; }
.log-sub         { padding-left: 20px; color: #666; font-size: 11px; }

.save-bar {
  padding: 8px; background: #fffde7; border: 1px solid #ffe082;
  margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
  font-size: 12px; flex-wrap: wrap;
}
.save-bar button { padding: 3px 10px; font-size: 12px; cursor: pointer; border: 1px solid #ccc; background: #f5f5f5; }

.show-mapped-toggle { font-size: 11px; display: block; margin-bottom: 8px; }

.two-col { display: flex; gap: 12px; }
.col     { flex: 1; min-width: 0; }

.col-label { font-size: 11px; font-weight: 600; color: #555; margin-bottom: 4px; }

.filter-input {
  width: 100%; padding: 4px 6px; margin-bottom: 4px;
  font-size: 12px; box-sizing: border-box; border: 1px solid #ddd;
}

.scroll-box { height: 380px; overflow-y: scroll; border: 1px solid #ddd; padding: 4px; }

.player-row { padding: 2px 3px; font-size: 11px; cursor: pointer; line-height: 1.6; }
.player-row:hover { background: #f5f5f5; }
.player-row.selected { background: #e3f2fd; }
.player-meta { color: #999; font-size: 10px; margin-left: 4px; }

.mapped-badge { display: inline-block; font-size: 9px; padding: 1px 4px; border-radius: 2px; margin-right: 4px; }
.badge-mapped   { background: #e8f5e9; color: #2e7d32; }
.badge-unmapped { background: #fff3e0; color: #e65100; }

.no-data { font-size: 11px; color: #999; padding: 4px; }

.save-error {
  margin-top: 1rem; font-size: 12px; color: #c62828;
  background: #ffebee; padding: 6px 10px; border-radius: 3px;
}
</style>
