import { Token } from "../../consts/token"

export function getJettonDaemonToken(token: Token) {
  return `Jetton-Daemon-${token}`
}
