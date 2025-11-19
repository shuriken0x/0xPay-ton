import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Webhook } from "./webhook.entity"
import { EntityManager, Repository } from "typeorm"
import { Agent as HttpsAgent } from "https"
import { Agent as HttpAgent } from "http"
import axios from "axios"
import { ZeroPayConfig } from "../../config"
import ms from "ms"
import { catchError, concatMap, EMPTY, from, interval, Subscription } from "rxjs"
import crypto from "crypto"
import { get } from "lodash"

@Injectable()
export class WebhookService implements OnModuleInit, OnModuleDestroy {
  protected logger = new Logger(WebhookService.name)
  public static readonly signatureHeader = "X-Webhook-Signature" as string
  protected readonly url = ZeroPayConfig.webhookUrl
  protected agent: any
  protected subscription: Subscription
  protected secret = Buffer.from(ZeroPayConfig.apiSecret, "hex")
  protected static readonly intervalPeriod = ms("5s")

  constructor(@InjectRepository(Webhook) protected repository: Repository<Webhook>) {
    this.agent = this.url.startsWith("https://")
      ? new HttpsAgent({
          keepAlive: true,
          keepAliveMsecs: ms("10m"),
        })
      : new HttpAgent({
          keepAlive: true,
          keepAliveMsecs: ms("10m"),
        })
  }

  async create({ event, data }: CreateWebhookParams, manager: EntityManager) {
    const insertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(Webhook)
      .values({
        event,
        data,
        sent: false,
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

  async process() {
    const webhooks = await this.repository.find({
      where: {
        sent: false,
      },
      order: {
        createdAt: "asc",
      },
    })

    for (let webhook of webhooks) {
      try {
        await this.sendMessage({
          id: webhook.id,
          event: webhook.event,
          data: webhook.data,
          timestamp: Math.floor(Date.now() / 1000),
        })
        await this.repository.update({ id: webhook.id }, { sent: true })
        this.logger.log({
          message: "Webhook notification successfully sent",
          data: {
            id: webhook.id,
          },
        })
      } catch (e) {
        this.logger.warn({
          message: `The server did not respond with a 2XX response`,
          data: {
            id: webhook.id,
            error: get(e, "message", "unknown error"),
          },
        })
        return
      }
    }
  }

  protected async sendMessage(data: object) {
    await axios.post(this.url, data, {
      httpAgent: this.agent,
      httpsAgent: this.agent,
      timeout: ms("10s"),
      headers: {
        [WebhookService.signatureHeader]: WebhookService.computeMessageSignature(
          WebhookService.plainObjectToBuffer(data),
          this.secret,
        ),
        "Content-Type": "application/json",
      },
      responseType: "json",
      validateStatus: (status) => {
        return status >= 200 && status <= 299
      },
    })
  }

  protected static computeMessageSignature(message: Buffer, apiSecret: Buffer) {
    return crypto.createHmac(`sha256`, apiSecret).update(message).digest(`hex`)
  }

  protected static plainObjectToBuffer(o: object) {
    return Buffer.from(JSON.stringify(o), "utf-8")
  }

  async onModuleInit() {
    this.subscription = interval(WebhookService.intervalPeriod)
      .pipe(
        concatMap(() => {
          return from(this.process()).pipe(
            catchError((e) => {
              this.logger.error(e)
              return EMPTY
            }),
          )
        }),
      )
      .subscribe()
  }

  async onModuleDestroy() {
    this.subscription && this.subscription.unsubscribe()
  }
}

type CreateWebhookParams = {
  event: string
  data: object
}
