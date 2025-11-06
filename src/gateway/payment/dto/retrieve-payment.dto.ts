import { z } from "zod"
import { createZodDto } from "nestjs-zod"


const schema = z.object({
  id: z.coerce.bigint().positive().transform(String)
})

export class RetrievePaymentDto extends createZodDto(schema) {}