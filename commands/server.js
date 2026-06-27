import CONFIG from "../config.js";
import axios from "axios";

const BASE_API = "https://api.mcsrvstat.us/3/"
const HOSTNAME = CONFIG.server.hostname
const PORT = CONFIG.server.port

async function getStatus() {
  const res = axios.get(`${BASE_API}${HOSTNAME}:${PORT}`)
  const result = (await res).data
  return `*Ryo's Servers*
  
HostName : ${result.hostname}
IP : ${result.ip}  
Status Server : ${result.online || "offline" }
Bedrock Support : ${result.bedrock || "❎" }
  `
}

export default getStatus