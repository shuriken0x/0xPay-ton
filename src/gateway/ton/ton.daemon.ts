import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { Address, TonClient, Transaction } from "@ton/ton"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Repository } from "typeorm"
import { catchError, concatMap, EMPTY, from, Subscription, tap, timer } from "rxjs"
import ms from "ms"
import { serializeError } from "serialize-error-cjs"
import z from "zod"
import { omit } from "lodash"
import { Token } from "../consts/token"
import { ProcessedTransaction } from "./processed-transaction.entity"
import { PaymentService } from "../payment/payment.service"
import { TONTransactionIterator } from "./ton-transaction.iterator"
import { ZeroPayConfig } from "../../config"

export abstract class TONDaemon implements OnModuleInit, OnModuleDestroy {
  protected abstract logger: Logger
  protected abstract token: Token
  protected abstract address: Address

  protected intervalPeriod = ms("30s")
  protected provider: TonClient
  private subscription: Subscription
  protected limit: number = 100

  protected constructor(
    @InjectRepository(ProcessedTransaction) protected repository: Repository<ProcessedTransaction>,
    protected service: PaymentService,
  ) {
    this.provider = new TonClient({
      endpoint: ZeroPayConfig.ton.apiEndpoint,
      apiKey: ZeroPayConfig.ton.apiKey,
    })
  }

  protected async process() {
    let txs: Transaction[] | null = null
    let foundProcessedPage = false
    const iterator = new TONTransactionIterator(this.provider, this.address, this.limit)

    while (iterator.canNext()) {
      txs = await iterator.next()

      const hasProcessed = await this.checkPage(txs)

      if (hasProcessed) {
        foundProcessedPage = true
        break
      }
    }

    if (!foundProcessedPage && txs == null) {
      if (iterator.canNext()) {
        txs = await iterator.next()
      }
    }

    if (!foundProcessedPage) {
      await this.handleBackward(iterator)
      return
    }

    if (txs) {
      await this.handlePage(txs)
    }

    if (iterator.canBack()) {
      await this.handleBackward(iterator)
    }
  }

  protected async handleBackward(iterator: TONTransactionIterator): Promise<void> {
    do {
      const txs = await iterator.back()
      await this.handlePage(txs)
    } while (iterator.canBack())
  }

  protected async checkPage(transactions: Transaction[]) {
    return await this.repository.exists({
      where: {
        txid: In(transactions.map((tx) => tx.hash().toString("hex"))),
      },
    })
  }

  protected abstract handlePage(transactions: Transaction[]): Promise<void>

  protected async isProcessed(txid: string) {
    return await this.repository.exists({
      where: {
        txid,
      },
    })
  }

  protected async markAsProcessed(txid: string, note: string) {
    await this.repository.insert({
      txid,
      note,
    })
  }

  protected validateComment(comment: unknown) {
    return z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.coerce.bigint().positive()).parse(comment)
  }

  async onModuleInit() {
    this.subscription = timer(ms("5s"), this.intervalPeriod)
      .pipe(
        concatMap(() => {
          return from(this.process()).pipe(
            tap(() => {
              this.logger.log({
                message: "Transactions retrieved and successfully processed",
              })
            }),
            catchError((e) => {
              this.logger.warn({
                message: "An error occurred while attempting to receive and process transactions",
                error: omit(serializeError(e), ["stack"]),
              })
              return EMPTY
            }),
          )
        }),
      )
      .subscribe({
        error: (e) => this.logger.error(e),
      })
  }

  async onModuleDestroy() {
    this.subscription && this.subscription.unsubscribe()
  }
}
