import { WinstonModule } from "nest-winston"
import { AppService } from "../app.service"
import { TestingModule, TestingModuleBuilder } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { DatabaseConfig } from "../config"

export class TestingService {
  static async getApp(module: TestingModule) {
    const app = module.createNestApplication({
      logger: WinstonModule.createLogger(AppService.getLoggerOptions()),
    })
    await AppService.upgrade(app)

    await app.init()
    await app.listen(8000, "0.0.0.0")
    return app
  }

  static async compileModule(builder: TestingModuleBuilder) {
    return await builder.setLogger(WinstonModule.createLogger(AppService.getLoggerOptions())).compile()
  }

  static async dropDataSources() {
    const dataSource = new DataSource(DatabaseConfig)
    await dataSource.initialize()
    await dataSource.synchronize(true)
    await dataSource.destroy()
  }
}
