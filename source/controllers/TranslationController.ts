import { Request, Response } from "express";
import TranslationService from "../services/TranslationService";
import { SearchType } from "../services/SearchType";

class TranslationController {
  private service: TranslationService;

  constructor() {
    this.service = new TranslationService();
  }

  async getTranslationById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const translation = await this.service.getTranslationById(id);
      if (translation) {
        res.json(translation);
      } else {
        res.status(404).json({ error: `Translation with ID ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve translation" });
    }
  }

  async createTranslation(req: Request, res: Response) {
    const translationData = req.body;
    // simple validation - mandatory fields - TODO find a better way to validate input
    if (this.isValidInputTranslation(translationData)) {
      res.status(400).json({
        error: "Mandatory fields are timestamp, primaryText, secondaryText",
      });
      return;
    }
    try {
      const translationId =
        await this.service.createTranslation(translationData);
      res.status(201).json({ translationId });
    } catch (error) {
      res.status(500).json({ error: "Failed to create translation" });
    }
  }

  async updateTranslation(req: Request, res: Response) {
    const { id } = req.params;
    const updatedTranslationData = req.body;
    const translationData = req.body;
    if (this.isValidInputTranslation(translationData)) {
      this.setBadRequestCode(res);
      return;
    }

    try {
      const result = await this.service.updateTranslation(
        id,
        updatedTranslationData,
      );
      res.sendStatus(result ? 204 : 404);
    } catch (error) {
      res.status(500).json({ error: "Failed to update translation" });
    }
  }

  async deleteTranslation(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await this.service.deleteTranslation(id);
      res.sendStatus(result ? 204 : 404);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete translation" });
    }
  }

  async getAllTranslations(req: Request, res: Response) {
    const page = this.determinePageNumber(req);
    try {
      const translations = await this.service.getAllTranslations(page);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve translations" });
    }
  }

  async searchTranslations(req: Request, res: Response) {
    const page = this.determinePageNumber(req);
    try {
      const term = <string>req.query.term;
      // below line for compatibility with --noImplicitAny
      const type =
        SearchType[
          (<string>req.query.type).toUpperCase() as keyof typeof SearchType
        ];
      const translations = await this.service.searchTranslations(
        term,
        type,
        page,
      );
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve translations" });
    }
  }

  private determinePageNumber(req: Request) {
    const { pageNumber } = req.query;
    return pageNumber ? Number.parseInt(<string>pageNumber, 10) : 0;
  }

  private isValidInputTranslation(translationData: any) {
    return !(
      translationData.timestamp &&
      translationData.primaryText &&
      translationData.secondaryText
    );
  }

  private setBadRequestCode(res: Response<any, Record<string, any>>) {
    res.status(400).json({
      error: "Mandatory fields are timestamp, primaryText, secondaryText",
    });
  }
}

export default new TranslationController();
