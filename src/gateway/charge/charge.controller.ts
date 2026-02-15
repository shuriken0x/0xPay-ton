import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ChargeService } from "./charge.service"
import { RetrieveChargeDto } from "./dto/retrieve-charge.dto"
import { CreateChargeDto } from "./dto/create-charge.dto"
import { ChargeListDto } from "./dto/charge-list.dto"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"
import { Charge } from "./charge.entity"
import { ZeroPayConfig } from "../../config"

@ApiExtraModels(Charge)
@Controller("charge")
export class ChargeController {
  constructor(protected service: ChargeService) {}

  @ApiOkResponse({
    schema: { $ref: getSchemaPath(Charge) },
  })
  @Post("create")
  async create(@Body() dto: CreateChargeDto) {
    return await this.service.create(dto)
  }

  @ApiOkResponse({
    schema: { $ref: getSchemaPath(Charge) },
  })
  @Get("retrieve")
  async retrieve(@Query() { id }: RetrieveChargeDto) {
    return await this.service.retrieve(id)
  }

  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        items: { type: "array", items: { $ref: getSchemaPath(Charge) } },
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
  async list(@Query() dto: ChargeListDto) {
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
