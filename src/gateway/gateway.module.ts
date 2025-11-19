import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Payment } from "./payment/payment.entity"
import { ProcessedTransaction } from "./ton/processed-transaction.entity"
import { PaymentService } from "./payment/payment.service"
import { Token } from "./consts/token"
import { getToncoinDaemonProvider } from "./ton/toncoin.daemon"
import { getJettonDaemonProvider } from "./ton/jetton/jetton.daemon"
import { Webhook } from "./webhook/webhook.entity"
import { WebhookService } from "./webhook/webhook.service"
import { PaymentController } from "./payment/payment.controller"
import { JettonController } from "./ton/jetton/jetton.controller"
import { ZeroPayConfig } from "../config"
import { JettonServiceLocatorProvider } from "./ton/jetton/jetton-service.locator"

@Module({
  imports: [TypeOrmModule.forFeature([Payment, ProcessedTransaction, Webhook])],
  providers: [
    JettonServiceLocatorProvider,
    ...ZeroPayConfig.ton.enabled.map((token) => {
      if (token === Token.TON) {
        return getToncoinDaemonProvider(ZeroPayConfig.ton.address)
      } else {
        return getJettonDaemonProvider(ZeroPayConfig.ton.address, token)
      }
    }),
    PaymentService,
    WebhookService,
  ],
  controllers: [PaymentController, JettonController],
  exports: [],
})
export class GatewayModule {}
