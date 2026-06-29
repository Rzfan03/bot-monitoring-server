const fs = require("fs")
const path = require("path")

const DATA_PATH = path.join(__dirname, "../data/reminders.json")

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
  } catch {
    return []
  }
}

function save(reminders) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(reminders, null, 2))
}

function add(userJid, message, targetJid) {
  const reminders = load()
  const reminder = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userJid,
    message,
    targetJid,
    createdAt: Date.now(),
    sendAt: Date.now() + 24 * 60 * 60 * 1000,
  }
  reminders.push(reminder)
  save(reminders)
  return reminder
}

function getDue() {
  const reminders = load()
  const now = Date.now()
  return reminders.filter(r => r.sendAt <= now)
}

function remove(id) {
  const reminders = load()
  const filtered = reminders.filter(r => r.id !== id)
  if (filtered.length < reminders.length) {
    save(filtered)
    return true
  }
  return false
}

module.exports = { add, getDue, remove }
