import { Token } from "../../token.enum"


export function getJettonDaemonToken(token: Token) {
  return `Jetton-Daemon-${token}`
}
