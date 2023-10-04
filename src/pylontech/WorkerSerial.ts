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

import Debug from 'debug';
import { SerialPort } from 'serialport';
import WorkerAbstract from './WorkerAbstract';

const debugApi = Debug('pylontech:api');

export = class WorkerSerial extends WorkerAbstract {
  protected _socket: SerialPort;

  constructor(path: string, baudRate: number, noPrompt?: boolean, debugData?: (data: Buffer) => void) {
    debugApi('MyWorkerNet.constructor', 'path:', path, 'baudRate:', baudRate);
    super();
    this._socket = new SerialPort({ path, baudRate });
    if (noPrompt) this._noPrompt = noPrompt;
    if (debugData) this._socket.on('data', debugData);
    this._socket.pipe(this._consolenReader);
  }

  open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._socket.open(
        ((err: any) => {
          if (err) {
            reject(err);
          }
          this._connected();
          resolve();
        }).bind(this)
      );
    });
  }

  sendDataB(data: Buffer): void {
    debugApi('MyWorkerSerial.sendData', 'data:', data.toString('hex'), 'this._activeCmd:', this._activeCmd);
    this._socket.write(data);
  }

  sendData(data: string | Buffer): void {
    debugApi('MyWorkerSerial.sendData', 'data:', data, 'this._activeCmd:', this._activeCmd);
    this._socket.write(data);
  }

  close(): Promise<boolean> {
    debugApi('MyWorkerSerial.close');
    return new Promise<boolean>(resolve => {
      this._socket.close(() => {
        resolve(true);
      });
    });
  }
};
