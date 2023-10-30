import log4js, { Logger } from "log4js";
import { ExpressService } from "./services/ExpressService";
import dotenv from "dotenv";
import * as log4jConfig from "../config/log4js.json";

class Main {
    private LOGGER!: Logger;
    private expressService!: ExpressService;

    constructor() {
        console.log("--- Starting the translations application ---");
        this.configureLogger();
        this.configureDotenv();
    }

    private configureLogger() {
        log4js.configure(log4jConfig);
        this.LOGGER = log4js.getLogger("Main");
        this.LOGGER.info("Current directory: " + __dirname);
    }

    private configureDotenv() {
        dotenv.config();
        this.LOGGER.info(`Express JS server port set to: ${process.env.EXPRESS_PORT}`);
        this.LOGGER.info(`Elastic Search host set to: ${process.env.ELASTICSEARCH_URL}`);
    }

    public start() {
        const port = process.env.EXPRESS_PORT || "3001"; // fallback to 3001 :)
        this.expressService = new ExpressService(parseInt(port));
        this.expressService.start();

        this.LOGGER.info("Application started.");
    }
}

const main = new Main();
main.start();
