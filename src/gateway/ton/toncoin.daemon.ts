import { Address, Transaction } from "@ton/ton"
import { Injectable, Logger, Provider } from "@nestjs/common"
import { getRepositoryToken, InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { TONDaemon } from "./ton.daemon"
import { ProcessedTransaction } from "./processed-transaction.entity"
import { PaymentService } from "../payment/payment.service"
import { TONUtilities } from "./ton.utilities"
import { Token } from "../consts/token"

@Injectable()
export class ToncoinDaemon extends TONDaemon {
  protected logger = new Logger(ToncoinDaemon.name)
  protected token = Token.TON

  constructor(
    protected address: Address,
    @InjectRepository(ProcessedTransaction) protected repository: Repository<ProcessedTransaction>,
    protected service: PaymentService,
  ) {
    super(repository, service)
  }

  async handlePage(transactions: Transaction[]) {
    for (let tx of transactions) {
      const txid = tx.hash().toString("hex")
      if (await this.isProcessed(txid)) {
        continue
      }

      const inMsg = tx.inMessage
      const outMsgs = tx.outMessages

      if (inMsg && inMsg.info.type === "internal" && outMsgs.size === 0) {
        const from = TONUtilities.standardizeAddress(inMsg.info.src)
        const to = TONUtilities.standardizeAddress(inMsg.info.dest)
        const body = inMsg.body.beginParse()
        const op = body.remainingBits < 32 ? null : body.loadUint(32)

        if (to !== TONUtilities.standardizeAddress(this.address)) {
          this.logger.warn({
            message: "Transaction with incorrect [dest] detected",
            txid,
          })
          await this.markAsProcessed(txid, "incorrect address in dest")
          continue
        }

        if (op !== 0 && op !== null) {
          this.logger.warn({
            message: "Transaction with unexpected opcode detected",
            txid,
          })
          await this.markAsProcessed(txid, "unexpected opcode")
          continue
        }

        if (op === null) {
          this.logger.warn({
            message: "Transaction without payload detected",
            txid,
          })
          await this.markAsProcessed(txid, "memo isn't exists")
          continue
        }

        try {
          const _comment = body.loadStringTail()
          const comment = this.validateComment(_comment)
          await this.service.process({
            txid,
            amount: inMsg.info.value.coins,
            token: this.token,
            memo: comment,
          })
        } catch (e: any) {
          this.logger.warn({
            message: "Transaction has invalid memo in payload",
            txid,
          })
          await this.markAsProcessed(txid, "invalid memo")
        }
      } else {
        await this.markAsProcessed(txid, "not interested transaction")
      }
    }
  }
}

export function getToncoinDaemonProvider(holder: string): Provider {
  return {
    provide: ToncoinDaemon,
    inject: [getRepositoryToken(ProcessedTransaction), PaymentService],
    useFactory: async (repository: Repository<ProcessedTransaction>, service: PaymentService) => {
      return new ToncoinDaemon(Address.parse(holder), repository, service)
    },
  }
}
