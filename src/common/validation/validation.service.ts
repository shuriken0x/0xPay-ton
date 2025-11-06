import { z } from "zod"

export class ValidationService {
  public static stringBigInt = z.coerce.bigint().positive().transform(String)

  static toBoolean(value: unknown) {
    if (typeof value === "boolean") {
      return value
    }
    if (typeof value !== "string") {
      return undefined
    }
    if (value.toLowerCase() === "true") {
      return true
    } else if (value.toLowerCase() === "false") {
      return false
    } else {
      return undefined
    }
  }

  static getZodBooleanValidator(optional: boolean) {
    return z.preprocess(ValidationService.toBoolean, optional ? z.boolean().optional() : z.boolean())
  }
}
