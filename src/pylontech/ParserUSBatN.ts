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

const COMMAND: string = 'bat';

export class ParserUSBatN extends ParserBase {
  isParser(cmd: string): boolean {
    const prompt: RegExp = /(\S+)\s(\d+)$/gm;
    return this._isParser(cmd, prompt, COMMAND);
  }

  parseData(data: string): object {
    const rowHeadA: RegExp = /^(B.{8})(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    const rowA: RegExp = /^(.{9})(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    //const rowHeadB: RegExp = /^(XB.{8})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    const rowB = /^(.{9})(.{9})(.{9})(.{13})(.{13})(.{13})(.{13})(.{9})(.{10,17})?(.{1,3})?/gm;
    if (rowHeadA.exec(data) != null) {
      return this._parseDataHeadlineN(data, rowA, COMMAND, 1);
    } else {
      return this._parseDataHeadlineN(data, rowB, COMMAND, 1);
    }
  }
}
