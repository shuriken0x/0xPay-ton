import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../../app.module"
import { PaymentService } from "../payment.service"
import { TestingService } from "../../../testing/testing.service"

describe("PaymentService", () => {
  let module: TestingModule
  let service: PaymentService

  beforeEach(async () => {
    await TestingService.dropDataSources()
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    service = module.get(PaymentService)
  })

  afterAll(async () => {
    await module.close()
  })

  it("should create() works", async () => {
    const payment = await service.create({
      payload: "123",
    })

    expect(payment.id).toBeDefined()
    expect(payment.payload).toBe("123")
  })

  it("should retrieve() works", async () => {
    const { id } = await service.create({
      payload: "123",
    })
    const payment = await service.retrieve(id)
    expect(payment.id).toBe(id)
  })
})
