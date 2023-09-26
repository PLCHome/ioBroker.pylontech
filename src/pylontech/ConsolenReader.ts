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
