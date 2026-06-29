const fs = require("fs")
const path = require("path")
const { fetchServerData } = require("../commands/server")

const UPTIME_PATH = path.join(__dirname, "../data/uptime.json")

let prevOnline = null
let sessionStart = null
let history = []

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(UPTIME_PATH, "utf-8"))
  } catch {
    return []
  }
}

function saveHistory() {
  fs.writeFileSync(UPTIME_PATH, JSON.stringify(history, null, 2))
}

function init() {
  history = loadHistory()
  prevOnline = null
  sessionStart = Date.now()
}

async function check(client, groupJid) {
  try {
    const data = await fetchServerData()
    const online = data.online === true

    if (prevOnline !== null && online !== prevOnline) {
      if (online) {
        sessionStart = Date.now()
        if (groupJid) {
          await client.send(groupJid).text("✅ *Server Online!*\nServer Minecraft sekarang online.")
        }
      } else {
        if (sessionStart) {
          history.push({ start: sessionStart, end: Date.now() })
          saveHistory()
        }
        sessionStart = null
        if (groupJid) {
          await client.send(groupJid).text("❌ *Server Offline!*\nServer Minecraft sekarang offline.")
        }
      }
    }

    if (prevOnline === null && online) {
      sessionStart = Date.now()
    }

    prevOnline = online
    return { online, data }
  } catch (e) {
    console.error("monitor error:", e.message)
    return { online: false, data: null }
  }
}

function getUptime() {
  const now = Date.now()
  let totalMs = history.reduce((acc, s) => acc + (s.end - s.start), 0)
  if (sessionStart) {
    totalMs += now - sessionStart
  }

  const totalHours = totalMs / 3600000
  const days = Math.floor(totalHours / 24)
  const hours = Math.floor(totalHours % 24)
  const minutes = Math.floor((totalMs % 3600000) / 60000)

  let uptimePercent = 0
  if (history.length > 0 || sessionStart) {
    const first = history.length > 0 ? history[0].start : sessionStart
    const elapsed = now - first
    uptimePercent = elapsed > 0 ? Math.round((totalMs / elapsed) * 100) : 100
  }

  return { days, hours, minutes, totalHours: Math.round(totalHours * 10) / 10, uptimePercent }
}

module.exports = { check, getUptime, init }
