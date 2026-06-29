const { Client } = require("zaileys")
const CONFIG = require("./config")
const { getStatus, getPlayers } = require("./commands/server")
const { getHelp } = require("./commands/help")
const reminderDb = require("./features/reminder")
const monitor = require("./features/monitor")

const client = new Client({
  authType: 'pairing',
  phoneNumber: CONFIG.BotNumber,
  sessionId: 'minecraft-bot',
  commandPrefix: CONFIG.prefix
})

client.on('pairing-code', ({ code }) => console.log("Your Pairing Code : ", code))
client.on('connect', ({ me }) => {
  console.log("Bot Ready Login On : ", me.id)
  monitor.init()
  startMonitor()
  startReminderScheduler()
})

// === !server ===
client.command('server', async (ctx) => {
  await ctx.react('⏱️')
  const target = ctx.roomId ?? ctx.senderId
  await client.send(target).buttons(
    [
      { id: 'owner', text: 'Owner' },
      { id: 'version', text: 'Version' },
    ],
    {
      text: await getStatus(),
      image: './assets/banner.jpg',
    }
  ).reply(ctx.message())
})

// === !players ===
client.command('players', async (ctx) => {
  await ctx.react('🎮')
  await ctx.reply(await getPlayers())
})

// === !help ===
client.command('help', async (ctx) => {
  await ctx.react('📖')
  await ctx.reply(getHelp())
})

// === !reminder ===
client.command('reminder', async (ctx) => {
  const text = ctx.raw
  const sepIndex = text.indexOf("|")
  if (sepIndex === -1) {
    await ctx.reply("Format: !reminder <pesan> | <nomor>\nContoh: !reminder jangan lupa maintain | 6281234567890")
    return
  }

  const message = text.slice(0, sepIndex).trim()
  const targetNumber = text.slice(sepIndex + 1).trim()

  if (!message || !targetNumber) {
    await ctx.reply("Format: !reminder <pesan> | <nomor>")
    return
  }

  const digits = targetNumber.replace(/\D/g, "")
  if (digits.length < 8) {
    await ctx.reply("Nomor target tidak valid")
    return
  }

  const targetJid = `${digits}@s.whatsapp.net`
  const reminder = reminderDb.add(ctx.senderId, message, targetJid)
  const sendTime = new Date(reminder.sendAt)
  await ctx.reply(
    `✅ *Reminder tersimpan!*\n\nPesan: ${message}\nTarget: ${digits}\nDikirim: ${sendTime.toLocaleString("id-ID")}`
  )
})

// === !uptime ===
client.command('uptime', async (ctx) => {
  const stats = monitor.getUptime()
  const msg = `*Uptime Server*\n\nOnline: ${stats.days}h ${stats.hours}j ${stats.minutes}m\nUptime: ${stats.uptimePercent}%\nTotal: ${stats.totalHours} jam`
  await ctx.reply(msg)
})

// === Button handler ===
client.on('button-click', async (ctx) => {
  const target = ctx.key.remoteJid ?? ctx.sender.jid
  if (ctx.buttonId === 'owner') {
    await client.send(target).text(`Owner: ${CONFIG.OwnNumber}`)
  } else if (ctx.buttonId === 'version') {
    await client.send(target).text(`
*Bot Minecraft v1.0.0*
Author: ${CONFIG.author}
Runtime: zaileys
`)
  }
})

// === Auto-monitor ===
let monitorTimer = null
function startMonitor() {
  if (monitorTimer) clearInterval(monitorTimer)
  monitorTimer = setInterval(() => {
    monitor.check(client, CONFIG.groupId || null)
  }, 5 * 60 * 1000)
}

// === Reminder scheduler ===
let reminderTimer = null
function startReminderScheduler() {
  if (reminderTimer) clearInterval(reminderTimer)
  reminderTimer = setInterval(() => {
    const due = reminderDb.getDue()
    for (const r of due) {
      client.send(r.targetJid).text(`⏰ *Reminder*\n\n${r.message}`).catch(e => {
        console.error("reminder send failed:", e.message)
      })
      reminderDb.remove(r.id)
    }
  }, 30 * 1000)
}
