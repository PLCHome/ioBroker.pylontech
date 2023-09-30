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
import * as net from 'net';
import WorkerAbstract from './WorkerAbstract';

const debugApi = Debug('pylontech:api');

export = class WorkerNet extends WorkerAbstract {
  protected _socket: net.Socket = new net.Socket();
  protected _baudRate: number;
  protected _rfc2217: boolean;

  constructor(host: string, port: number, baudRate: number, rfc2217: boolean, noPrompt?: boolean, debugData?: (data: Buffer) => void) {
    debugApi('MyWorkerNet.constructor', 'host:', host, 'port:', port);
    super();
    if (debugData) this._socket.on('data', debugData);
    this._baudRate = baudRate;
    this._rfc2217 = rfc2217;
    if (noPrompt) this._noPrompt = noPrompt;
    this._socket.pipe(this._consolenReader);
    this._socket.connect(port, host, this._netConnected.bind(this));
  }

  protected _netConnected(): void {
    if (this._rfc2217) {
      this._will();
      this._setBaudRate(this._baudRate);
    }
    this._connected();
  }

  protected _will(): void {
    const data = Buffer.from('FFFB2C', 'hex');
    this.sendDataB(data);
  }

  protected _setBaudRate(baudRate: number): void {
    this._will();
    const data = Buffer.from('fffa2c0100000000fff0', 'hex');
    data.writeUInt32BE(baudRate, 4);
    this.sendDataB(data);
  }

  protected _setDatasize(datasize: number): void {
    this._will();
    const data = Buffer.from('fffa2c0200fff0', 'hex');
    data.writeUInt8(datasize, 4);
    this.sendDataB(data);
  }

  protected _setParity(parity: number): void {
    this._will();
    const data = Buffer.from('fffa2c0300fff0', 'hex');
    data.writeUInt8(parity, 4);
    this.sendDataB(data);
  }

  protected _setStopsize(stopsize: number): void {
    this._will();
    const data = Buffer.from('fffa2c0400fff0', 'hex');
    data.writeUInt8(stopsize, 4);
    this.sendDataB(data);
  }

  protected _setControl(control: number): void {
    this._will();
    const data = Buffer.from('fffa2c0500fff0', 'hex');
    data.writeUInt8(control, 4);
    this.sendDataB(data);
  }

  sendDataB(data: Buffer): void {
    debugApi('MyWorkerNet.sendDataB', 'data:', data.toString('hex'), 'this._activeCmd:', this._activeCmd);
    this._socket.write(data);
  }

  sendData(data: string): void {
    debugApi('MyWorkerNet.sendData', 'data:', data, 'this._activeCmd:', this._activeCmd);
    this._socket.write(data);
  }

  close(): Promise<boolean> {
    debugApi('MyWorkerNet.close');
    return new Promise<boolean>(resolve => {
      this._socket.end(() => {
        resolve(true);
      });
    });
  }
};
