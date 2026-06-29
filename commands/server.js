const CONFIG = require("../config");
const axios = require("axios");

const BASE_API = "https://api.mcsrvstat.us/3/"
const HOSTNAME = CONFIG.server.hostname
const PORT = CONFIG.server.port

async function fetchServerData() {
  const { data } = await axios.get(`${BASE_API}${HOSTNAME}:${PORT}`)
  return data
}

async function getStatus() {
  try {
    const result = await fetchServerData()
    return `*Ryo's Servers*
    
HostName : ${result.hostname || "-"}
IP : ${result.ip || "-"}  
Status Server : ${result.online ? "✅ Online" : "❌ Offline"}
Bedrock Support : ${result.bedrock ? "✅ Ya" : "❎ Tidak"}
Players : ${result.players ? `${result.players.online}/${result.players.max}` : "-"}
    `
  } catch {
    return "*Server Status*\n\n❌ Gagal mengambil data server"
  }
}

async function getPlayers() {
  try {
    const data = await fetchServerData()
    if (!data.online || !data.players) {
      return "*Player Online*\n\nServer offline"
    }
    if (!data.players.online || data.players.online === 0) {
      return "*Player Online*\n\nTidak ada player online"
    }
    const list = data.players.list && data.players.list.length > 0
      ? data.players.list.map(p => `- ${p}`).join("\n")
      : "-"
    return `*Player Online*\n🎮 ${data.players.online}/${data.players.max} online\n\n${list}`
  } catch {
    return "*Player Online*\n\n❌ Gagal mengambil data player"
  }
}

module.exports = { getStatus, getPlayers, fetchServerData }
