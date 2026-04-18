// ─── Scoring formulas ─────────────────────────────────────────────────────────

export const getHitterTotal = (s) => {
  if (!s) return 0
  return (s.runs || 0) + (s.hits || 0) / 2 + (s.rbi || 0) + (s.homeRuns || 0) * 2 + (s.stolenBases || 0) / 2
}

export const getStarterTotal = (s) => {
  if (!s) return 0
  return (s.wins || 0) * 15 - (s.losses || 0) * 4 + (s.strikeOuts || 0) / 2
}

export const getCloserTotal = (s) => {
  if (!s) return 0
  return (s.saves || 0) * 7 + (s.wins || 0) * 6 + (s.strikeOuts || 0) / 2 + (s.inningsPitched || 0) / 2
}

// ─── Build enriched score data ─────────────────────────────────────────────────
//
// Returns positionScoreData: { [pos]: { [nickname]: enrichedPlayer } }
//
// Merges roster player definitions with live MLB stats, computes totals.
// Normalises LF/CF/RF → OF. Uses explicit field list to avoid MLB API fields
// stomping on pool-specific fields (pos, name, roster, etc.).

export const buildScoreData = (rosterData, mlbHitters, mlbPitchers) => {
  const byPos = {}

  Object.values(rosterData).forEach((roster) => {
    roster.players.forEach((player) => {
      const pos = ['LF', 'CF', 'RF'].includes(player.pos) ? 'OF' : player.pos
      let stats = null
      let total = 0

      if (player.posType === 'hitter') {
        stats = mlbHitters && player.playerId ? mlbHitters[player.playerId] : null
        total = getHitterTotal(stats)
      } else if (pos === 'SP') {
        stats = mlbPitchers && player.playerId ? mlbPitchers[player.playerId] : null
        total = getStarterTotal(stats)
      } else if (pos === 'RP') {
        stats = mlbPitchers && player.playerId ? mlbPitchers[player.playerId] : null
        total = getCloserTotal(stats)
      }

      const enriched = {
        // pool identity — always from roster JSON, never overwritten by API data
        name:     player.name,
        nickname: player.nickname,
        roster:   player.roster,
        pos,
        posType:  player.posType,
        team:     player.team,
        playerId: player.playerId,
        newsLink: player.newsLink || '',
        status:   player.status || null,
        // stats from MLB API (zeroed when unavailable)
        runs:           stats?.runs          || 0,
        hits:           stats?.hits          || 0,
        homeRuns:       stats?.homeRuns      || 0,
        rbi:            stats?.rbi           || 0,
        stolenBases:    stats?.stolenBases   || 0,
        wins:           stats?.wins          || 0,
        losses:         stats?.losses        || 0,
        strikeOuts:     stats?.strikeOuts    || 0,
        inningsPitched: stats?.inningsPitched || 0,
        saves:          stats?.saves         || 0,
        total:          parseFloat(total.toFixed(2)),
      }

      if (!byPos[pos]) byPos[pos] = {}
      byPos[pos][player.nickname] = enriched
    })
  })

  return byPos
}

// ─── Roster position totals ───────────────────────────────────────────────────
//
// Scoring rules: SP top 4, RP top 2, OF top 4, all other positions top 1.

export const getRosterTotals = (rosterSlug, scoreData) => {
  const topN = (pos, n) => {
    const group = scoreData[pos]
    if (!group) return 0
    return Object.values(group)
      .filter((p) => p.roster === rosterSlug)
      .sort((a, b) => b.total - a.total)
      .slice(0, n)
      .reduce((sum, p) => sum + p.total, 0)
  }

  const SP = topN('SP', 4)
  const RP = topN('RP', 2)
  const OF = topN('OF', 4)
  const C  = topN('C',  1)
  const b1 = topN('1B', 1)
  const b2 = topN('2B', 1)
  const b3 = topN('3B', 1)
  const SS = topN('SS', 1)

  const hitters  = OF + C + b1 + b2 + b3 + SS
  const grandTotal = parseFloat((hitters + SP + RP).toFixed(2))

  return { SP, RP, OF, C, '1B': b1, '2B': b2, '3B': b3, SS, hitters, grandTotal }
}

// ─── Dynamic MLB.com player URL ────────────────────────────────────────────────

export const mlbPlayerUrl = (player) => {
  if (!player.playerId || player.playerId === 0) return null
  const slug = (player.nickname || '').replace(/_/g, '-')
  return `https://www.mlb.com/player/${slug}-${player.playerId}`
}
