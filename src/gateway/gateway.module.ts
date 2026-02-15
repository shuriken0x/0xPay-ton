import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Charge } from "./charge/charge.entity"
import { ProcessedTransaction } from "./ton/processed-transaction.entity"
import { ChargeService } from "./charge/charge.service"
import { Token } from "./consts/token"
import { getToncoinDaemonProvider } from "./ton/toncoin.daemon"
import { getJettonDaemonProvider } from "./ton/jetton/jetton.daemon"
import { Webhook } from "./webhook/webhook.entity"
import { WebhookService } from "./webhook/webhook.service"
import { ChargeController } from "./charge/charge.controller"
import { JettonController } from "./ton/jetton/jetton.controller"
import { ZeroPayConfig } from "../config"
import { JettonServiceLocatorProvider } from "./ton/jetton/jetton-service.locator"

@Module({
  imports: [TypeOrmModule.forFeature([Charge, ProcessedTransaction, Webhook])],
  providers: [
    JettonServiceLocatorProvider,
    ...ZeroPayConfig.ton.enabled.map((token) => {
      if (token === Token.TON) {
        return getToncoinDaemonProvider(ZeroPayConfig.ton.address)
      } else {
        return getJettonDaemonProvider(ZeroPayConfig.ton.address, token)
      }
    }),
    ChargeService,
    WebhookService,
  ],
  controllers: [ChargeController, JettonController],
  exports: [],
})
export class GatewayModule {}
