import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { PaymentService } from "./payment.service"
import { RetrievePaymentDto } from "./dto/retrieve-payment.dto"
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { PaymentListDto } from "./dto/payment-list.dto"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"
import { Payment } from "./payment.entity"
import { ZeroPayConfig } from "../../config"

@ApiExtraModels(Payment)
@Controller("payment")
export class PaymentController {
  constructor(protected service: PaymentService) {}

  @ApiOkResponse({
    schema: { $ref: getSchemaPath(Payment) },
  })
  @Post("create")
  async create(@Body() dto: CreatePaymentDto) {
    return await this.service.create(dto)
  }

  @ApiOkResponse({
    schema: { $ref: getSchemaPath(Payment) },
  })
  @Get("retrieve")
  async retrieve(@Query() { id }: RetrievePaymentDto) {
    return await this.service.retrieve(id)
  }

  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        items: { type: "array", items: { $ref: getSchemaPath(Payment) } },
        meta: {
          type: "object",
          properties: {
            itemCount: { type: "number" },
            totalItems: { type: "number" },
            itemsPerPage: { type: "number" },
            totalPages: { type: "number" },
            currentPage: { type: "number" },
          },
        },
      },
    },
  })
  @Get("list")
  async list(@Query() dto: PaymentListDto) {
    return await this.service.list(dto)
  }

  @ApiOkResponse({
    description: "Address for accept payments",
    schema: {
      type: "object",
      properties: {
        address: { type: "string" },
      },
    },
  })
  @Get("get-receiving-address")
  async getReceivingAddress() {
    return {
      address: ZeroPayConfig.ton.address,
    }
  }
}
