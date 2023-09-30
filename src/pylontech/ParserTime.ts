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

import ParserBase from './ParserBase';

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
