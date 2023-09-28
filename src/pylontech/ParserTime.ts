import ParserBase from './ParserBase';

//const debugApi = Debug("pylontech:api");

const COMMAND: string = 'time';

export class ParserTime extends ParserBase {
  protected _noConvertKeys: string[] = ['Code'];

  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): any {
    const row: RegExp = /(.+\S)\s+(\d{2,4}-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d)/gm;
    const result = this._parseDataNameValN(data, row, COMMAND);
    Object.keys(result.time).forEach((key: string) => {
      result.time[key].write = true;
      result.time[key].function = 'settime';
    });
    return result;
  }
}
