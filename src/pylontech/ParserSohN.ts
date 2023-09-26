import ParserBase from "./ParserBase";

//const debugApi = Debug("pylontech:api");

const COMMAND: string = "soh";

export class ParserSohN extends ParserBase {
    isParser(data: string): boolean {
        const prompt: RegExp = /(>)(\S+)\s(\d+)$/gm;
        return this._isParser(data, prompt, COMMAND);
    }

    parseData(data: string): any {
        const row: RegExp = /^(.{11})(.{11})(.{11})(.{9})/gm;
        return this._parseDataHeadlineN(data, row, COMMAND, 1);
    }
}
