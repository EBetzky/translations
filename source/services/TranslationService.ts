import { Translation, TranslationMappings } from "../model/Translation";
import { ElasticService, elasticService } from "./ElasticService";
import log4js from "log4js";
import { MOCKED_TRANSLATIONS } from "../data/MockData";
import { SearchType } from "./SearchType";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";

class TranslationService {
    private readonly LOGGER = log4js.getLogger("TranslationService");
    private readonly indexName = "translations";
    private dataService: ElasticService;

    constructor() {
        this.dataService = elasticService;
        this.dataService.initializeIndex(this.indexName, TranslationMappings).then((created) => {
            if (created) {
                this.putMockData([...MOCKED_TRANSLATIONS]);
            } else {
                this.LOGGER.warn("Skipping feeding index with mock data.");
            }
        });
    }

    public async getTranslationById(id: string): Promise<Translation | null | undefined> {
        try {
            return await this.dataService.findById(this.indexName, id);
        } catch (error) {
            throw new Error("Failed to retrieve translation");
        }
    }

    public async createTranslation(translationData: Translation) {
        try {
            return await this.dataService.indexDocument(this.indexName, translationData);
        } catch (error) {
            throw new Error("Failed to create translation");
        }
    }

    public async updateTranslation(
        id: string,
        updatedTranslationData: Translation
    ): Promise<boolean> {
        try {
            return await this.dataService.updateDocument(
                this.indexName,
                id,
                updatedTranslationData
            );
        } catch (error) {
            throw new Error("Failed to update translation");
        }
    }

    public async deleteTranslation(id: string): Promise<boolean> {
        try {
            return await this.dataService.deleteDocument(this.indexName, id);
        } catch (error) {
            throw new Error("Failed to delete translation");
        }
    }

    public async searchTranslations(
        text: string,
        type: SearchType = SearchType.PRIMARY,
        page: number = 0
    ) {
        const query = this.configureSearchQuery(text, type);

        try {
            const translations = <Translation[]>(
                await this.dataService.searchDocuments(this.indexName, query, page)
            );
            this.LOGGER.debug(
                `Search of '${text}', type: ${SearchType[type]} resulted in ${translations?.length} translations.`
            );
            return translations;
        } catch (error) {
            throw new Error("Failed to search translations");
        }
    }

    public async getAllTranslations(page: number) {
        return await this.searchTranslations("", SearchType.ALL, page);
    }

    // TODO change to bulk indexing (?)
    private putMockData(mocks: Translation[]) {
        if (mocks.length > 0) {
            this.createTranslation(mocks[0]).then(() => {
                mocks.shift();
                this.putMockData(mocks);
            });
        } else {
            this.LOGGER.info(`Feeding index ${this.indexName} with mock data has been completed.`);
        }
    }

    private configureSearchQuery(text: string, type: SearchType): QueryDslQueryContainer {
        switch (type) {
            case SearchType.PRIMARY:
                return {
                    match: {
                        primaryText: text
                    }
                };
            case SearchType.SECONDARY:
                return {
                    match: {
                        secondaryText: text
                    }
                };
            case SearchType.BOTH:
                return {
                    multi_match: {
                        query: text,
                        fields: ["*Text"]
                    }
                };
            case SearchType.ALL:
                return {
                    match_all: {}
                };
        }
    }
}

export default TranslationService;
