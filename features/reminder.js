const { getDb } = require("./db")

function add(userJid, message, targetJid, sendAt) {
  const db = getDb()
  const reminder = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userJid,
    message,
    targetJid,
    createdAt: Date.now(),
    sendAt: sendAt || Date.now() + 24 * 60 * 60 * 1000,
  }
  db.prepare(
    "INSERT INTO reminders (id, user_jid, message, target_jid, created_at, send_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(reminder.id, reminder.userJid, reminder.message, reminder.targetJid, reminder.createdAt, reminder.sendAt)
  return reminder
}

function getDue() {
  const db = getDb()
  return db.prepare("SELECT * FROM reminders WHERE send_at <= ?").all(Date.now())
}

function remove(id) {
  const db = getDb()
  const result = db.prepare("DELETE FROM reminders WHERE id = ?").run(id)
  return result.changes > 0
}

module.exports = { add, getDue, remove }
