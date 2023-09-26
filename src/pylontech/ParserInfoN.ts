import ParserBase from './ParserBase';

//const debugApi = Debug("pylontech:api");

const COMMAND: string = 'info';

export class ParserInfoN extends ParserBase {
  _number: number | undefined;

  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)\s(\d+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): any {
    const row: RegExp = /(.+\S)\s+:\s(.*)/gm;
    return this._parseDataNameValN(data, row, COMMAND);
  }
}
