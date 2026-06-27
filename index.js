import { Client } from "zaileys";
import CONFIG from "./config.js";
import getStatus from "./commands/server.js";

const client = new Client({
  authType: 'pairing',
  phoneNumber: CONFIG.BotNumber,
  sessionId: 'minecraft-bot',
  commandPrefix: CONFIG.prefix
})

client.on('pairing-code', ({ code }) => console.log("Your Pairing Code : ", code))
client.on('connect', ({ me }) => console.log("Bot Ready Login On : ", me.id))


client.command('server', async (ctx) => {
  await ctx.react('⏱️')
  const target = ctx.roomId ?? ctx.senderId
  await client.send(target).buttons(
    [
      { id: 'owner', text: 'Owner' },
      { id: 'version', text: 'Version' },
    ],
    {
      text: String(await getStatus()),
      image: './assets/banner.jpg',
    }
  ).reply(ctx.message())
})

client.on('button-click', async (ctx) => {
  const target = ctx.key.remoteJid ?? ctx.sender.jid
  if (ctx.buttonId === 'owner') {
    await client.send(target).text(`Owner: ${CONFIG.OwnNumber}`)
  } else if (ctx.buttonId === 'version') {
    await client.send(target).text('Bot Version 1.0.0')
  }
})