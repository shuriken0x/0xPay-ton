import {DataSource} from "typeorm";
import databaseConfig from "../config/database.config";
import { ConfigService } from "../config"



ConfigService.loadEnv()
export default new DataSource(databaseConfig()) // FOR CLI

