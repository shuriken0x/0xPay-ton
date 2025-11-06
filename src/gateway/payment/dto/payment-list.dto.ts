import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { ValidationService } from "../../../common/validation"

const schema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(150),
  filter: z
    .object({
      id: z.coerce.bigint().positive().transform(String).optional(),
      txid: z.coerce.string().min(1).optional(),
      paid: z.union([z.stringbool(), z.boolean()]).optional(),
      memo: z.coerce.bigint().positive().transform(String).optional(),
      payload: z.string().or(z.null()).optional(),
    })
    .default({}),
  sort: z
    .object({
      createdAt: z.literal("ASC").or(z.literal("DESC")).optional(),
    })
    .default({}),
})

export class PaymentListDto extends createZodDto(schema) {}
