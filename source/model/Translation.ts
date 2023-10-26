export interface Translation {
  timestamp: number;
  primaryText: string;
  secondaryText: string;
  primaryLanguage: string;
  secondaryLanguage: string;
  timestamps: number[];
}

export const TranslationMappings = {
  properties: {
    timestamp: { type: "long" },
    primaryText: { type: "text" },
    secondaryText: { type: "text" },
    primaryLanguage: { type: "keyword" },
    secondaryLanguage: { type: "keyword" },
    timestamps: { type: "long" },
  },
};
