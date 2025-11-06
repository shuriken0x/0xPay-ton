import { Address } from "@ton/core"

export class TONUtilities {
  public static isValidAddress(address: unknown) {
    if (typeof address === "string") {
      try {
        Address.parse(address)
        return true
      } catch (e) {
        return false
      }
    }
    return false
  }

  public static standardizeAddress(address: string | Address): string {
    let a: Address | string = address
    if (typeof address === "string") {
      a = Address.parse(address)
    }

    return a.toString({ bounceable: false, urlSafe: true, testOnly: false })
  }
}
