export interface ScrapeSetEntry {
  id: string;
  title: string;
  images: string[];
}

export interface ScrapeManifest {
  generatedAt?: string;
  sets?: ScrapeSetEntry[];
}
