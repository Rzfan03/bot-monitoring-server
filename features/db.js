const { DatabaseSync } = require('node:sqlite')
const path = require('path')

const DB_PATH = path.join(__dirname, '../data/bot.db')

let db = null

function getDb() {
  if (db) return db
  db = new DatabaseSync(DB_PATH)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_jid TEXT NOT NULL,
      message TEXT NOT NULL,
      target_jid TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      send_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uptime_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER NOT NULL,
      end_time INTEGER
    );
  `)
  return db
}

module.exports = { getDb }
