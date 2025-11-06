import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { PaymentService } from "./payment.service"
import { RetrievePaymentDto } from "./dto/retrieve-payment.dto"
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { PaymentListDto } from "./dto/payment-list.dto"

@Controller("payment")
export class PaymentController {
  constructor(protected service: PaymentService) {}

  @Post("create")
  async create(@Body() dto: CreatePaymentDto) {
    return await this.service.create(dto)
  }

  @Get("retrieve")
  async retrieve(@Query() { id }: RetrievePaymentDto) {
    return await this.service.retrieve(id)
  }

  @Get("list")
  async list(@Query() dto: PaymentListDto) {
    return await this.service.list(dto)
  }
}
