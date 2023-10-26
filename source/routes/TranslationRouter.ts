import express, { Router } from "express";
import controller from "../controllers/TranslationController";

class TranslationRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // TODO - can the #/component/schemas be moved to separate place (?)
    /**
     * @swagger
     * ### Type description
     * components:
     *   schemas:
     *     Translation:
     *       type: object
     *       properties:
     *         timestamp:
     *           type: number
     *           format: int64
     *         primaryText:
     *           type: string
     *         secondaryText:
     *           type: string
     *         primaryLanguage:
     *           type: string
     *         secondaryLanguage:
     *           type: string
     *         timestamps:
     *           type: array
     *           items:
     *             type: number
     *             format: int64
     *
     * ### HTTP operations
     * /translations/search/:
     *   get:
     *     summary: Get translations meeting the search criteria
     *     description: Retrieve translation entities based on the provided search criteria
     *     tags:
     *       - translation
     *     parameters:
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [primary, secondary, both]
     *         required: true
     *         description: Search for word in primary language/secondary language/both
     *       - in: query
     *         name: term
     *         schema:
     *           type: string
     *         required: true
     *         description: Search for a given word/char sequence
     *       - in: query
     *         name: pageNumber
     *         schema:
     *           type: number
     *         required: false
     *         description: Number of result page
     *     responses:
     *       200:
     *         description: Successful operation. Please note - lack of search results ends up with an empty array.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Translation'
     *       500:
     *         description: Internal server error.
     * */
    this.router.get("/search/", controller.searchTranslations.bind(controller));

    /**
     * @swagger
     * /translations/{translationId}:
     *   get:
     *     summary: Get a translation by Elastic Search ID
     *     description: Retrieve full translation entity based on the provided ID.
     *     tags:
     *       - translation
     *     parameters:
     *       - name: translationId
     *         in: path
     *         description: ID of translation
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Successful response
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Translation'
     *       404:
     *         description: Translation not found.
     *       500:
     *         description: Internal server error.
     */
    this.router.get("/:id", controller.getTranslationById.bind(controller));

    /**
     * @swagger
     * /translations/:
     *   get:
     *     summary: Get them all
     *     description: Retrieve all the translations
     *     tags:
     *       - translation
     *     parameters:
     *       - in: query
     *         name: pageNumber
     *         schema:
     *           type: number
     *         required: false
     *         description: Number of result page
     *     responses:
     *       200:
     *         description: List of translations. Please note - search with no result will return an empty array.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Translation'
     *       500:
     *         description: Internal server error.
     */
    this.router.get("/", controller.getAllTranslations.bind(controller));

    /**
     * @swagger
     * /translations/:
     *   post:
     *     summary: Create a new translation
     *     description: Create a new translation
     *     tags:
     *       - translation
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/Translation"
     *     responses:
     *       201:
     *         description: Translation created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Translation"
     *       400:
     *         description: Invalid request
     */
    this.router.post("/", controller.createTranslation.bind(controller));

    /**
     * @swagger
     * /translations/{translationId}:
     *   put:
     *     summary: Update a Translation
     *     description: Updates a Translation based on the provided ID parameter and full entity
     *     tags:
     *       - translation
     *     parameters:
     *       - name: translationId
     *         in: path
     *         description: Elastic Search ID of the Translation to update
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       description: Updated Translation object
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/Translation"
     *     responses:
     *       204:
     *         description: Translation updated successfully
     *       400:
     *          description: Bad request
     *       404:
     *         description: Translation not found
     *       500:
     *         description: Internal server error
     */
    this.router.put("/:id", controller.updateTranslation.bind(controller));

    /**
     * @swagger
     * /translations/{translationId}:
     *   delete:
     *     summary: Delete a translation by Elastic Search ID
     *     description: Deletes a translation based on the provided ID parameter
     *     tags:
     *       - translation
     *     parameters:
     *       - name: translationId
     *         in: path
     *         description: Elastic Search ID of the translation to delete
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Translation deleted successfully
     *       404:
     *         description: Translation not found
     *       500:
     *         description: Internal server error
     */
    this.router.delete("/:id", controller.deleteTranslation.bind(controller));
  }
}

export default new TranslationRouter().router;
