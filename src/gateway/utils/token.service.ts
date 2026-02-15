import { ethers } from "ethers"
import { Token } from "../consts/token"

export class TokenService {
  protected static tokens: Record<
    Token,
    {
      contract: string | null
      decimals: number
    }
  > = {
    TON: {
      contract: null,
      decimals: 9,
    },
    USDT: {
      contract: "UQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_p0p",
      decimals: 6,
    },
    NOT: {
      contract: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
      decimals: 9,
    },
  }

  public static getDecimals(token: Token): number {
    const tokenData = this.tokens[token]

    if (!tokenData) {
      throw new Error(`No decimals found matching these parameters: ${JSON.stringify({ token })}`)
    }

    return tokenData.decimals
  }

  public static format(value: bigint | string, { token }: { token: Token }) {
    const decimals = TokenService.getDecimals(token)
    return +ethers.formatUnits(BigInt(value), decimals)
  }

  public static parse(value: number | string, { token }: { token: Token }) {
    const decimals = TokenService.getDecimals(token)
    return ethers.parseUnits(typeof value === "number" ? value.toFixed(decimals) : value, decimals)
  }
}
