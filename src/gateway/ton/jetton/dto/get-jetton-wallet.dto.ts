import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { TONUtilities } from "../../ton.utilities"
import { Token } from "../../../consts/token"

const schema = z.object({
  holder: z
    .string()
    .refine(TONUtilities.isValidAddress, { message: "Isn't valid TON address" })
    .transform(TONUtilities.standardizeAddress),
  token: z.enum(Token),
})

export class GetJettonWalletDto extends createZodDto(schema) {}
