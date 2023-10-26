import { Client } from "@elastic/elasticsearch";
import log4js from "log4js";
import { Translation } from "../model/Translation";
import dotenv from "dotenv";

export class ElasticService {
  private readonly client: Client;
  private readonly LOGGER = log4js.getLogger("ElasticService");

  private readonly UPDATED_STATUS = "updated";
  private readonly DELETED_STATUS = "deleted";

  private readonly PAGE_SIZE: number;

  constructor() {
    dotenv.config(); // race condition, this class is loaded and instantiated before main
    this.client = new Client({ node: process.env.ELASTICSEARCH_URL });
    this.PAGE_SIZE = Number.parseInt(<string>process.env.QUERY_PAGE_SIZE, 10);
  }

  public async initializeIndex(index: string, mappings: any): Promise<boolean> {
    let created = false;
    try {
      const indexExists = await this.client.indices.exists({
        index,
      });

      if (!indexExists) {
        const response = await this.client.indices.create({
          index,
          mappings,
        });

        this.LOGGER.info("Index initialized: ", response);
        created = true;
      } else {
        this.LOGGER.warn("Index already exists.");
        created = false;
      }
    } catch (error) {
      this.LOGGER.error("Error initializing index:", error);
    }
    return created;
  }

  public async indexDocument(index: string, document: any) {
    try {
      const response = await this.client.index({
        index,
        document,
      });

      this.LOGGER.debug(`Document indexed: ${response._id}`);
      return response._id;
    } catch (error) {
      this.LOGGER.error("Error indexing document: ", error);
    } finally {
      // TODO
    }
  }

  public async updateDocument(index: string, id: string, document: any) {
    try {
      const response = await this.client.update({
        index,
        id,
        doc: document,
      });

      if (response.result === this.UPDATED_STATUS) {
        this.LOGGER.debug(`Document updated: ${id} in index ${index}`);
      }
    } catch (error) {
      this.LOGGER.error("Error updating document:", error);
      return false;
    }
    return true;
  }

  public async searchDocuments(index: string, query: any, page: number = 0) {
    try {
      const response = await this.client.search({
        from: page * this.PAGE_SIZE,
        size: this.PAGE_SIZE,
        index,
        query,
      });

      if (response.hits?.hits?.length > 0) {
        this.LOGGER.debug(`${response.hits.hits.length} hits found in search.`);
        return response.hits.hits.map((hit) => hit._source);
      }
      return [];
    } catch (error) {
      this.LOGGER.error("Error searching documents:", error);
    }
  }

  public async deleteDocument(index: string, id: string) {
    try {
      const response = await this.client.delete({
        index,
        id,
      });

      if (response.result === this.DELETED_STATUS) {
        this.LOGGER.debug(`Document deleted: ${id} from index ${index}`);
      }
    } catch (error) {
      this.LOGGER.error("Error deleting document:", error);
      return false;
    }
    return true;
  }

  async findById(index: string, id: string) {
    try {
      const response = await this.client.get({
        index,
        id,
      });
      return response?.found ? <Translation>response?._source : null;
    } catch (error) {
      this.LOGGER.error("Error finding document by ID:", error);
    }
  }
}

export const elasticService = new ElasticService();
