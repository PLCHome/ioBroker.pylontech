// Copyright (c) 2020-2023 Träger

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import { debug } from 'debug';
import { IParser } from './IParser';
import { ParserBatN } from './ParserBatN';
import { ParserInfoN } from './ParserInfoN';
import { ParserLog } from './ParserLog';
import { ParserPwr } from './ParserPwr';
import { ParserPwrN } from './ParserPwrN';
import { ParserSohN } from './ParserSohN';
import { ParserStatN } from './ParserStatN';
import { ParserTime } from './ParserTime';

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
    this._parser.push(new ParserTime());
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
