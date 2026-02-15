import { Injectable, Logger } from "@nestjs/common"
import { Token } from "../consts/token"
import { z } from "zod"
import { Charge } from "./charge.entity"
import { IsNull, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { ProcessedTransaction } from "../ton/processed-transaction.entity"
import { WebhookService } from "../webhook/webhook.service"
import { ChargeListDto } from "./dto/charge-list.dto"
import { paginate } from "nestjs-typeorm-paginate"
import { ChargeTransaction } from "./charge-transaction.entity"
import { TokenService } from "../utils/token.service"

@Injectable()
export class ChargeService {
  protected logger = new Logger(ChargeService.name)

  constructor(
    @InjectRepository(Charge) protected repository: Repository<Charge>,
    protected webhookService: WebhookService,
  ) {}

  async create({ payload }: CreatePaymentParams) {
    const insertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .into(Charge)
      .values({
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
      relations: {
        txs: true
      }
    })
  }

  async list({ page, limit, filter, sort }: ChargeListDto) {
    return await paginate(
      this.repository,
      { page, limit },
      {
        where: {
          id: filter.id,
          memo: filter.memo,
          payload: filter.payload === null ? IsNull() : filter.payload,
        },
        relations: {
          txs: true,
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

    await this.repository.manager.transaction("READ COMMITTED", async (manager) => {
      const repository = manager.getRepository(Charge)

      const isProcessed = await manager.exists(ProcessedTransaction, {
        where: {
          txid,
        },
        lock: {
          mode: "pessimistic_write",
        },
      })

      if (isProcessed) {
        return
      }

      const charge = await repository.findOne({
        where: {
          memo: memo.toString(),
        },
      })

      if (!charge) {
        await manager.insert(ProcessedTransaction, {
          txid,
          note: "no associated charge",
        })
        this.logger.log({
          message: "no associated charge",
          data: {
            memo,
          },
        })
        return
      }

      const txRepository = manager.getRepository(ChargeTransaction)

      const tx = await txRepository.findOne({
        where: {
          txid,
        },
        lock: {
          mode: "pessimistic_write",
        },
      })

      if (tx) {
        await manager.insert(ProcessedTransaction, {
          txid,
          note: null,
        })
        return
      }

      await txRepository.insert({
        txid,
        amount: amount.toString(),
        token,
        chargeId: charge.id,
      })

      await manager.getRepository(ProcessedTransaction).insert({
        txid,
        note: null,
      })

      await this.webhookService.create(
        {
          event: "payment:new",
          data: {
            id: charge.id,
            txid,
            amount: TokenService.format(amount, { token }),
            token,
            memo: memo.toString(),
            payload: charge.payload,
          },
        },
        manager,
      )
    })
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
