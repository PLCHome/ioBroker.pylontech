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

const COMMAND: string = 'pwr';

export class ParserForcePwr extends ParserBase {
  isParser(data: string): boolean {
    const prompt: RegExp = /(>)(\S+)$/gm;
    return this._isParser(data, prompt, COMMAND);
  }

  parseData(data: string): any {
    const rowVal: RegExp = /(.+\S)\s*:\s(.*)/gm;
    const val: any = this._parseDataNameValN(data, rowVal, COMMAND);
    const rowTab: RegExp =
      /^(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{7})(.{9})(.{9})(.{9})(.{9})(.{9})(.{16})(.{9})(.{14})(.{21})(.{9})?(.{9})?(.{9})?(.{9})?(.{4,8})?/gm;
    const valtab: any = this._parseDataHeadlineN(data, rowTab, COMMAND, 0);
    Object.keys(valtab[COMMAND]).forEach(key => {
      val[COMMAND][key] = valtab[COMMAND][key];
    });
    return val;
  }
}
