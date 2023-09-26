import ParserBase from './ParserBase';

//const debugApi = Debug("pylontech:parser");

const COMMAND: string = 'bat';

export class ParserBatN extends ParserBase {
  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)\s(\d+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): object {
    const row: RegExp = /^(.{9})(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{10})(.{9,16})?(.{1,3})?/gm;
    return this._parseDataHeadlineN(data, row, COMMAND, 1);
  }
}
