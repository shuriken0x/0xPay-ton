import { Injectable, Logger } from "@nestjs/common"
import { Token } from "../token.enum"
import { z } from "zod"
import { Payment } from "./payment.entity"
import { DataSource, IsNull, Repository } from "typeorm"
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm"
import { retryWithExponentialBackoff } from "../../common/utils"
import { DbHelpers } from "../../db/db-helpers"
import { ProcessedTransaction } from "../ton/processed-transaction.entity"
import { WebhookService } from "../webhook/webhook.service"
import { PaymentListDto } from "./dto/payment-list.dto"
import { paginate } from "nestjs-typeorm-paginate"

@Injectable()
export class PaymentService {
  protected logger = new Logger(PaymentService.name)

  constructor(
    @InjectRepository(Payment) protected repository: Repository<Payment>,
    protected webhookService: WebhookService,
  ) {}

  async create({ payload }: CreatePaymentParams) {
    const insertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .into(Payment)
      .values({
        txid: null,
        token: null,
        amount: null,
        paid: false,
        payload,
      })
      .returning("*")
      .execute()
    return this.repository.create(insertResult.raw[0] as object)
  }

  async retrieve(id: string) {
    return this.repository.findOneOrFail({
      where: {
        id,
      },
    })
  }

  async list({ page, limit, filter, sort }: PaymentListDto) {
    return await paginate(
      this.repository,
      { page, limit },
      {
        where: {
          id: filter.id,
          txid: filter.txid,
          paid: filter.paid,
          memo: filter.memo,
          payload: filter.payload === null ? IsNull() : filter.payload,
        },
        order: {
          createdAt: sort.createdAt,
        },
      },
    )
  }

  async process(params: ProcessPaymentParams) {
    const result = schema.safeParse(params)

    if (!result.success) {
      throw new Error(`Invalid data provided, data: ${JSON.stringify(params)}`)
    }

    const { txid, amount, token, memo } = result.data

    await retryWithExponentialBackoff(
      async () => {
        return this.repository.manager.transaction("SERIALIZABLE", async (manager) => {
          const repository = manager.getRepository(Payment)
          const payment = await repository.findOne({
            where: {
              memo: memo.toString(),
            },
          })
          if (!payment) {
            await manager.getRepository(ProcessedTransaction).insert({
              txid,
              note: "No associated payment",
            })
            this.logger.warn({
              message: "No associated payment",
              txid,
            })
            return
          }

          if (payment.paid) {
            if (payment.txid !== txid) {
              await manager.getRepository(ProcessedTransaction).insert({
                txid,
                note: "transaction contains the memo that is associated with another transaction",
              })
            }
            return
          }
          await repository.update(
            { id: payment.id },
            {
              paid: true,
              txid,
              amount: amount.toString(),
              token,
            },
          )

          await manager.getRepository(ProcessedTransaction).insert({
            txid,
            note: null,
          })

          await this.webhookService.create(
            {
              event: "payment:new",
              data: {
                id: payment.id,
                txid,
                amount: amount.toString(),
                token,
                memo: memo.toString(),
                payload: payment.payload,
              },
            },
            manager,
          )
        })
      },
      (e) => DbHelpers.isSerializationFailure(e),
    )
  }
}

const schema = z.object({
  txid: z.string().min(1),
  amount: z.bigint().positive(),
  token: z.enum(Token),
  memo: z.bigint().positive(),
})

type ProcessPaymentParams = z.infer<typeof schema>

type CreatePaymentParams = {
  payload: string | null
}
