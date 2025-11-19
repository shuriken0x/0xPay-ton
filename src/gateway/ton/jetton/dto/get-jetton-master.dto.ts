import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { Token } from "../../../consts/token"

const schema = z.object({
  token: z.enum(Token),
})

export class GetJettonMasterDto extends createZodDto(schema) {}
