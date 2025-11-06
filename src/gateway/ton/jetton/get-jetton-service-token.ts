import { Token } from "../../token.enum"

export function getJettonServiceToken(token: Token) {
  return `Jetton-Service-${token}`
}
