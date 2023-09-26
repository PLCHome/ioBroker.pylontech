import ParserBase from './ParserBase';

//const debugApi = Debug("pylontech:api");

const COMMAND: string = 'log';

export class ParserLog extends ParserBase {
  protected _noConvertKeys: string[] = ['Code'];

  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): any {
    const row: RegExp = /(.+\S)\s+:\s(.*)/gm;
    return this._parseNameValMultiData(data, row, COMMAND, 'Index');
  }
}
