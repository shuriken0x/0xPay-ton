import { Test, TestingModule } from "@nestjs/testing"
import { PaymentService } from "../payment.service"
import { TestingService } from "../../../testing/testing.service"
import { AppModule } from "../../../app.module"
import axios from "axios"
import { INestApplication } from "@nestjs/common"
import { Payment } from "../payment.entity"

const url = `http://localhost:8000/api`
axios.defaults.baseURL = url
axios.defaults.validateStatus = (status) => status <= 500
axios.defaults.withCredentials = true
describe("PaymentController", () => {
  let app: INestApplication
  let service: PaymentService

  beforeEach(async () => {
    await TestingService.dropDataSources()
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = await TestingService.getApp(module)

    service = module.get(PaymentService)
  })

  afterAll(async () => {
    await app.close()
  })

  it("POST /payment/create 200", async () => {
    const resp = await axios.post("payment/create", {
      payload: "123",
    },
      {
        headers: {
            "X-Access-Token": process.env.API_SECRET
        }
      })
    expect(resp.status).toBe(201)
    const payment = resp.data as Payment
    expect(payment.id).toBeDefined()
    expect(payment.payload).toBeDefined()
  })
})
