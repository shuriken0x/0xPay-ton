import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const schema = z.object({
  payload: z.string().or(z.null()),
})

export class CreatePaymentDto extends createZodDto(schema) {}
