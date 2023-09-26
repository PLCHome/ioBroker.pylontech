export interface IParser {
    isParser(data: string): boolean;
    parseData(data: string): object;
    getParserName(): string;
}
