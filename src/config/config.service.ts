import appRoot from "app-root-path"
import dotenv from "dotenv"
import path from "path"
import process from "process"

export class ConfigService {
  static readonly mediaRoot = path.join(ConfigService.getRootDir(), "media")
  static readonly mediaPrivateRoot = path.join(ConfigService.mediaRoot, "private")

  static readonly mediaURL = "/media/"

  protected static NODE_ENV = process.env.NODE_ENV

  static loadEnv() {
    if (ConfigService.isDevelopment()) {
      dotenv.config({ path: path.join(ConfigService.getRootDir(), ".env.development"), quiet: true })
    }
  }

  static getRootDir() {
    return appRoot.path
  }

  static isDevelopment() {
    return ConfigService.NODE_ENV === "development"
  }

  static isProduction() {
    return ConfigService.NODE_ENV === "production"
  }

  static isTest() {
    return ConfigService.NODE_ENV === "test"
  }
}
