import { ArgumentMetadata, HttpCode, HttpException, HttpStatus, Injectable, Logger, Optional } from "@nestjs/common"
import { ZodDto, ZodValidationPipe } from "nestjs-zod"
import { isZodDto } from "nestjs-zod/dto"
import { ZodError } from "zod"

@Injectable()
export class ValidationPipe extends ZodValidationPipe {
  protected logger = new Logger(ValidationPipe.name)

  constructor(@Optional() private schemaOrDto?: UnknownSchema | ZodDto<UnknownSchema>) {
    super(schemaOrDto)
  }

  public async transform(value: unknown, metadata: ArgumentMetadata) {
    if (this.schemaOrDto) {
      return await this.validate(value, this.schemaOrDto)
    }

    const { metatype } = metadata
    if (!isZodDto(metatype)) {
      return value
    }

    return this.validate(value, metatype.schema as any)
  }

  async validate<TSchema extends UnknownSchema>(value: unknown, schemaOrDto: TSchema | ZodDto<TSchema>) {
    const schema = isZodDto(schemaOrDto) ? schemaOrDto.schema : schemaOrDto

    try {
      return await schema.parseAsync(value)
    } catch (e) {
      throw this.createValidationException(e as ZodError)
    }
  }

  createValidationException(error: ZodError) {
    return new HttpException(
      {
        error: error.issues,
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}

export interface UnknownSchema {
  parse(input: unknown): unknown
  parseAsync(input: unknown): Promise<unknown>

  array?: () => UnknownSchema
}
