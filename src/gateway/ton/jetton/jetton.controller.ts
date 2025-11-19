import { Controller, Get, HttpException, HttpStatus, Query } from "@nestjs/common"
import { GetJettonWalletDto } from "./dto/get-jetton-wallet.dto"
import { TONUtilities } from "../ton.utilities"
import { GetJettonMasterDto } from "./dto/get-jetton-master.dto"
import { JettonServiceLocator } from "./jetton-service.locator"
import { ApiOkResponse } from "@nestjs/swagger"

@Controller("jetton")
export class JettonController {
  constructor(protected serviceLocator: JettonServiceLocator) {}

  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        address: { type: "string" },
      },
    },
  })
  @Get("get-jetton-master")
  async getJettonMaster(@Query() { token }: GetJettonMasterDto) {
    if (!TONUtilities.isJetton(token)) {
      throw new HttpException(`Cannot retrieve jetton master`, HttpStatus.BAD_REQUEST)
    }
    const jettonMaster = this.serviceLocator.get(token).getJettonMaster()
    return {
      address: TONUtilities.standardizeAddress(jettonMaster),
    }
  }

  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        address: { type: "string" },
      },
    },
  })
  @Get("get-jetton-wallet")
  async getJettonWallet(@Query() { holder, token }: GetJettonWalletDto) {
    if (!TONUtilities.isJetton(token)) {
      throw new HttpException(`Cannot retrieve jetton wallet`, HttpStatus.BAD_REQUEST)
    }
    const jettonWallet = await this.serviceLocator.get(token).getJettonWallet(holder)
    return {
      address: TONUtilities.standardizeAddress(jettonWallet),
    }
  }
}
