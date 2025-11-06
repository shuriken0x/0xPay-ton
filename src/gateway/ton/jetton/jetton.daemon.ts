import { Logger, Provider } from "@nestjs/common"
import { JettonService } from "./jetton.service"

import { getRepositoryToken, InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { getJettonServiceToken } from "./get-jetton-service-token"
import { getJettonDaemonToken } from "./get-jetton-daemon-token"
import { PaymentService } from "../../payment/payment.service"
import { ProcessedTransaction } from "../processed-transaction.entity"
import { Address, Transaction } from "@ton/ton"
import { Token } from "../../token.enum"
import { TONDaemon } from "../ton.daemon"
import { TONUtilities } from "../ton.utilities"
import { ZeroPayConfig } from "../../../config"

export class JettonDaemon extends TONDaemon {
  protected logger: Logger
  protected token = Token.USDT

  constructor(
    protected address: Address,
    @InjectRepository(ProcessedTransaction) protected repository: Repository<ProcessedTransaction>,
    protected service: PaymentService,
    protected jettonService: JettonService
  ) {
    super(repository, service)
    this.logger = new Logger(`${JettonDaemon.name}-${this.token}`)
  }

  async handlePage(transactions: Transaction[]) {
    for (let tx of transactions) {
      const txid = tx.hash().toString("hex")
      if (await this.isProcessed(txid)) {
        continue
      }
      const inMsg = tx.inMessage
      const outMsgs = tx.outMessages

      if (inMsg && inMsg.info.type === "internal") {
        const body = inMsg.body.beginParse()
        const op = body.remainingBits < 32 ? null : body.loadUint(32)

        if (op !== 0x178d4519) {
          this.logger.warn({
            message: "Transaction with unexpected opcode detected",
            txid,
          })
          await this.markAsProcessed(txid, "Unexpected opcode")
          continue
        }

        if (TONUtilities.standardizeAddress(this.address) !== TONUtilities.standardizeAddress(inMsg.info.dest)) {
          this.logger.warn({
            message: "Transaction with incorrect [dest] detected",
            txid,
          })
          await this.markAsProcessed(txid, "Incorrect address in dest")
          continue
        }

        const result = await this.provider.runMethod(inMsg.info.src, "get_wallet_data")
        const stack = result.stack

        const balance = BigInt(stack.readBigNumber())
        const owner = stack.readAddress()
        const jettonMaster = stack.readAddress()

        if (
          TONUtilities.standardizeAddress(jettonMaster) !==
          TONUtilities.standardizeAddress(this.jettonService.getJettonMaster())
        ) {
          this.logger.warn({
            message: "Wrong jetton master",
            txid,
          })
          await this.markAsProcessed(txid, "scam transaction, wrong jetton master")
          continue
        }

        try {
          let _comment: null | string = null
          const queryId = body.loadUintBig(64)
          const amount = body.loadCoins()
          const from = body.loadAddress()
          const responseDestination = body.loadAddress() // response_destination
          const forwardTonAmount = body.loadCoins() // uint64

          if (body.remainingRefs > 0) {
            const payloadCell = body.loadRef()
            const payloadSlice = payloadCell.beginParse()

            const maybeOp = payloadSlice.loadUint(32)
            if (maybeOp === 0) {
              _comment = payloadSlice.loadStringTail() // UTF-8 строка
            }
          }

          if (!_comment) {
            this.logger.warn({
              message: "Transaction without payload detected",
              txid,
            })
            await this.markAsProcessed(txid, "memo isn't exists")
            continue
          }

          try {
            const comment = this.validateComment(_comment)
            await this.service.process({
              txid,
              amount,
              token: this.token,
              memo: comment,
            })
          } catch (e) {
            this.logger.warn({
              message: "Transaction has invalid memo in payload",
              txid,
            })
            await this.markAsProcessed(txid, "invalid memo")
          }
        } catch (e) {
          this.logger.error(e)
          await this.markAsProcessed(txid, "Invalid transaction, parsing error")
          continue
        }
      } else {
        await this.markAsProcessed(txid, "not interested transaction")
      }
    }
  }

  public static async initialize(
    repository: Repository<ProcessedTransaction>,
    service: PaymentService,
    jettonService: JettonService
  ) {
    const jettonWallet = await jettonService.getJettonWallet(ZeroPayConfig.ton.address)
    return new JettonDaemon(jettonWallet, repository, service, jettonService)
  }
}

export const getJettonDaemonProvider = (token: Token): Provider => {
  return {
    provide: getJettonDaemonToken(token),
    inject: [getRepositoryToken(ProcessedTransaction), getJettonServiceToken(token), PaymentService],
    useFactory: async (
      repository: Repository<ProcessedTransaction>,
      jettonService: JettonService,
      service: PaymentService,
    ) => {
      return await JettonDaemon.initialize(repository, service, jettonService)
    },
  }
}
