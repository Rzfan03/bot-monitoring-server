const { getDb } = require("./db")
const { fetchServerData } = require("../commands/server")

let prevOnline = null
let sessionStart = null

function init() {
  const db = getDb()
  const row = db.prepare("SELECT id, start_time FROM uptime_events WHERE end_time IS NULL ORDER BY id DESC LIMIT 1").get()
  if (row) {
    sessionStart = row.start_time
    prevOnline = true
  } else {
    prevOnline = null
    sessionStart = null
  }
}

async function check(client, groupJid) {
  try {
    const data = await fetchServerData()
    const online = data.online === true
    const db = getDb()

    if (prevOnline !== null && online !== prevOnline) {
      if (online) {
        sessionStart = Date.now()
        db.prepare("INSERT INTO uptime_events (start_time) VALUES (?)").run(sessionStart)
        if (groupJid) {
          await client.send(groupJid).text("✅ *Server Online!*")
        }
      } else {
        if (sessionStart) {
          db.prepare("UPDATE uptime_events SET end_time = ? WHERE end_time IS NULL").run(Date.now())
        }
        sessionStart = null
        if (groupJid) {
          await client.send(groupJid).text("❌ *Server Offline!*")
        }
      }
    }

    if (prevOnline === null && online) {
      sessionStart = Date.now()
      db.prepare("INSERT INTO uptime_events (start_time) VALUES (?)").run(sessionStart)
    }

    prevOnline = online
    return { online, data }
  } catch (e) {
    console.error("monitor error:", e.message)
    return { online: false, data: null }
  }
}

function getUptime() {
  const db = getDb()
  const row = db.prepare("SELECT COALESCE(SUM(end_time - start_time), 0) as total_ms FROM uptime_events WHERE end_time IS NOT NULL").get()
  let totalMs = row.total_ms

  if (sessionStart) {
    totalMs += Date.now() - sessionStart
  }

  const totalHours = totalMs / 3600000
  const days = Math.floor(totalHours / 24)
  const hours = Math.floor(totalHours % 24)
  const minutes = Math.floor((totalMs % 3600000) / 60000)

  let uptimePercent = 0
  const firstRow = db.prepare("SELECT start_time FROM uptime_events ORDER BY id ASC LIMIT 1").get()
  if (firstRow) {
    const firstTime = firstRow.start_time
    const elapsed = Date.now() - firstTime
    uptimePercent = elapsed > 0 ? Math.round((totalMs / elapsed) * 100) : 100
  }

  return {
    days,
    hours,
    minutes,
    totalHours: Math.round(totalHours * 10) / 10,
    uptimePercent
  }
}

module.exports = { check, getUptime, init }
