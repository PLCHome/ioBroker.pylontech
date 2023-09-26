import ParserBase from './ParserBase';

//const debugApi = Debug("pylontech:api");

const COMMAND: string = 'pwr';

export class ParserPwr extends ParserBase {
  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): any {
    const row: RegExp = /^(.{6})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{9})(.{9})(.{9})(.{9})(.{9})(.{21})(.{9})(.{9})?(.{8})?(.{7})?/gm;
    return this._parseDataHeadlineN(data, row, COMMAND, 1);
  }
}
