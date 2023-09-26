import { debug } from 'debug';
import { IParser } from './IParser';
import { ParserBatN } from './ParserBatN';
import { ParserInfoN } from './ParserInfoN';
import { ParserLog } from './ParserLog';
import { ParserPwr } from './ParserPwr';
import { ParserPwrN } from './ParserPwrN';
import { ParserSohN } from './ParserSohN';
import { ParserStatN } from './ParserStatN';

const debugParsers = debug('pylontech:parsers');

export class Parsers {
  protected _parser: IParser[] = [];

  constructor() {
    debugParsers('Parsers.constructor');
    this._parser.push(new ParserInfoN());
    this._parser.push(new ParserPwrN());
    this._parser.push(new ParserBatN());
    this._parser.push(new ParserSohN());
    this._parser.push(new ParserStatN());
    this._parser.push(new ParserPwr());
    this._parser.push(new ParserLog());
  }

  getParser(data: string): IParser | undefined {
    debugParsers('Parsers.getParser', 'data', data);
    let result: IParser | undefined;
    this._parser.forEach(parser => {
      if (parser.isParser(data)) {
        debugParsers('Parsers.getParser', 'parser', parser.getParserName());
        result = parser;
      }
    });
    return result;
  }
}
