import log4js, { Logger } from "log4js";
import { ExpressService } from "./services/ExpressService";
import dotenv from "dotenv";

class Main {
  private LOGGER!: Logger;
  private expressService!: ExpressService;

  constructor() {
    console.log("--- Starting the translations application ---");
    this.configureLogger();
    this.configureDotenv();
  }

  private configureLogger() {
    const config = require("../config/log4js.json");
    log4js.configure(config);
    this.LOGGER = log4js.getLogger("Main");
    this.LOGGER.info("Current directory: " + __dirname);
  }

  private configureDotenv() {
    dotenv.config();
    this.LOGGER.info(
      `Express JS server port set to: ${process.env.EXPRESS_PORT}`,
    );
    this.LOGGER.info(
      `Elastic Search host set to: ${process.env.ELASTICSEARCH_URL}`,
    );
  }

  public start() {
    this.expressService = new ExpressService(
      this.normalizePort(process.env.EXPRESS_PORT || "3001"),
    );
    this.expressService.start();

    this.LOGGER.info("Application started.");
  }

  private normalizePort(val: any) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }
}

const main = new Main();
main.start();
