const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const isProd = process.env.NODE_ENV === 'production'
const PORT = isProd ? 2026 : 3001
const ROSTERS_PATH = path.join(__dirname, 'src/data/rosters2026.json')
const BAK_DIR = path.join(__dirname, 'bak')

app.use(express.json())

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
}

// GET /api/rosters
app.get('/api/rosters', (req, res) => {
  try {
    const data = fs.readFileSync(ROSTERS_PATH, 'utf8')
    res.json(JSON.parse(data))
  } catch (err) {
    console.error('GET /api/rosters error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/rosters
app.post('/api/rosters', (req, res) => {
  try {
    if (!fs.existsSync(BAK_DIR)) fs.mkdirSync(BAK_DIR)
    const timestamp = Date.now()
    fs.copyFileSync(ROSTERS_PATH, path.join(BAK_DIR, `rosters2026-${timestamp}.json`))
    fs.writeFileSync(ROSTERS_PATH, JSON.stringify(req.body, null, 2))
    res.json({ success: true, timestamp })
  } catch (err) {
    console.error('POST /api/rosters error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

if (isProd) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`BBPool 2026 ${isProd ? 'server' : 'API'} running on http://localhost:${PORT}`)
})
