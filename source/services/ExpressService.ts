import express, { Application } from "express";
import log4js from "log4js";
import path from "path";
import TranslationRouter from "../routes/TranslationRouter";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export class ExpressService {
    private readonly LOGGER = log4js.getLogger("ExpressService");
    private app: Application;
    private readonly port: number;

    private readonly swaggerOptions = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Translation API",
                version: "0.0.1",
                description: "API documentation for Translations App"
            }
        },
        apis: ["./routes/*.ts"]
    };

    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.initializeSwagger();
    }

    private configureMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        // this.LOGGER.info("Current directory: " + __dirname);
        this.app.use(express.static(path.join(__dirname, "../../public")));
    }

    private configureRoutes() {
        // the following two routes are for testing purposes only
        this.app.get("/test", (req, res) => {
            res.send("Test response, do not remove");
        });
        this.app.get("/", function (req, res) {
            res.render("index", { title: "Translations" });
        });

        this.app.use("/translations/", TranslationRouter);
    }

    private initializeSwagger() {
        const swaggerDocs = swaggerJsDoc(this.swaggerOptions);
        this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }

    public start() {
        this.app.listen(this.port, () => {
            this.LOGGER.info(`Web server is running on port ${this.port}`);
        });
    }
}
