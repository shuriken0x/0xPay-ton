import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const schema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(150),
  filter: z
    .object({
      id: z.coerce.number().int().positive().transform(String).optional(),
      memo: z.coerce.number().int().positive().transform(String).optional(),
      payload: z.string().or(z.null()).optional(),
    })
    .default({}),
  sort: z
    .object({
      createdAt: z.literal("ASC").or(z.literal("DESC")).optional(),
    })
    .default({}),
})

export class ChargeListDto extends createZodDto(schema) {}
