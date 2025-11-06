import axios from "axios"
import { Body, Controller, INestApplication, NestMiddleware, Post } from "@nestjs/common"
import { PaymentService } from "../../payment/payment.service"
import { TestingService } from "../../../testing/testing.service"
import { Test } from "@nestjs/testing"
import { AppModule } from "../../../app.module"
import { Payment } from "../../payment/payment.entity"
import { WebhookService } from "../webhook.service"
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm"
import { Webhook } from "../webhook.entity"
import { Repository } from "typeorm"
import { AppMiddleware } from "../../../app.middleware"
import { NextFunction, Request, Response } from "express"

jest.mock("../../../app.middleware", () => {
  return {
    AppMiddleware: class AppMiddleware implements NestMiddleware {
      async use(req: Request, res: Response, next: NextFunction) {
        next()
      }
    },
    __esModule: true,
  }
})

const url = `http://localhost:8000/api`
axios.defaults.baseURL = url
axios.defaults.validateStatus = (status) => status <= 500
axios.defaults.withCredentials = true
describe("WebhookService", () => {
  let app: INestApplication
  let service: WebhookService

  beforeEach(async () => {
    await TestingService.dropDataSources()
    const module = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [WebhookController],
    })
      .overrideProvider(WebhookService)
      .useFactory({
        inject: [getRepositoryToken(Webhook)],
        factory: async (repository: Repository<Webhook>) => {
          const service = new WebhookService(repository)
          // @ts-ignore
          service.url = `${url}/webhook/handle`
          return service
        },
      })
      .compile()
    app = await TestingService.getApp(module)

    service = module.get(WebhookService)
  })

  afterAll(async () => {
    await app.close()
  })

  it("should create() works", async () => {
    const webhook = await service.create(
      {
        event: "payment:new",
        data: {
          id: "1",
        },
      },
      app.get(getDataSourceToken()).manager,
    )
    expect(webhook.id).toBeDefined()
    expect(webhook.sent).toBeFalsy()
    await service.process()

    const { sent } = await service.retrieve(webhook.id)
    expect(sent).toBeTruthy()
  })
})

@Controller("webhook")
class WebhookController {
  @Post("handle")
  async handle(@Body() dto: object) {}
}
