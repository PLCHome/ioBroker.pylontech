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

import debug from 'debug';
import { Transform } from 'stream';

const debugApi = debug('pylontech:api');

export class ConsolenReader extends Transform {
  protected _buffer: Buffer;
  constructor() {
    super({});
    this._buffer = Buffer.alloc(0);
    debugApi('MyParser.constructor');
  }

  _transform(chunk: Buffer, encoding: string, cb: () => void): void {
    debugApi('MyParser._transform', 'chunk', chunk.toString('hex'), 'encoding', encoding);
    let data: Buffer = Buffer.concat([this._buffer, chunk]);
    let position: number;
    let start: number;
    if ((position = data.lastIndexOf('[Enter]')) !== -1) {
      data.write('-------', position);
      this.emit('needsenddata', '\r');
    }
    while ((position = data.lastIndexOf('$$')) !== -1) {
      if ((start = data.lastIndexOf('>', position)) !== -1) {
        this.push(data.subarray(start, position - 1));
      }
      data = data.subarray(position + 2);
    }
    this._buffer = data;
    cb();
  }

  _flush(cb: () => void): void {
    debugApi('MyParser._flush');
    this.push(this._buffer);
    this._buffer = Buffer.alloc(0);
    cb();
  }
}
