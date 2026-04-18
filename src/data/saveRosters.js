export const saveRosters = async (rosterData) => {
  const res = await fetch('/api/rosters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rosterData),
  })
  if (!res.ok) throw new Error(`saveRosters: ${res.status} ${res.statusText}`)
  return res.json()
}
