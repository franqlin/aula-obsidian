declare module 'duck-duck-scrape' {
    export enum SafeSearchType {
        STRICT = 'strict',
        MODERATE = 'moderate',
        OFF = 'off'
    }

    export interface SearchOptions {
        safeSearch?: SafeSearchType;
    }

    export interface SearchResult {
        title: string;
        url: string;
        snippet: string;
    }

    export function search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}