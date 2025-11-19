import { ConfigService } from "./config.service"
import { z } from "zod"
import databaseConfig from "./database.config"
import { TONUtilities } from "../gateway/ton/ton.utilities"
import { Token } from "../gateway/consts/token"

z.enum(["development", "production", "test"]).parse(process.env.NODE_ENV)
ConfigService.loadEnv()

export const DatabaseConfig = databaseConfig()
export const ZeroPayConfig = z
  .object({
    ton: z.object({
      enabled: z.array(z.enum(Token)),
      address: z
        .string()
        .refine(TONUtilities.isValidAddress, { message: "Isn't valid TON address" })
        .transform(TONUtilities.standardizeAddress),
      apiEndpoint: z.url(),
      apiKey: z.string().optional(),
    }),
    apiSecret: z.string().min(1),
    webhookUrl: z.url(),
  })
  .parse({
    ton: {
      enabled: [Token.TON, Token.USDT, Token.NOT],
      address: process.env.TON_ADDRESS_FOR_ACCEPT_PAYMENTS,
      apiEndpoint: process.env.TON_API_ENDPOINT,
      apiKey: process.env.TON_API_KEY,
    },
    apiSecret: process.env.API_SECRET,
    webhookUrl: process.env.WEBHOOK_URL,
  })
