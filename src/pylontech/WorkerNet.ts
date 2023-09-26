import Debug from 'debug';
import * as net from 'net';
import WorkerAbstract from './WorkerAbstract';

const debugApi = Debug('pylontech:api');

export = class WorkerNet extends WorkerAbstract {
  protected _socket: net.Socket = new net.Socket();

  constructor(host: string, port: number, baudRate: number, debugData?: (data: Buffer) => void) {
    debugApi('MyWorkerNet.constructor', 'host:', host, 'port:', port);
    super();
    if (debugData) this._socket.on('data', debugData);
    this._socket.pipe(this._consolenReader);
    this._socket.connect(port, host, this._connected.bind(this));
  }

  protected _will(): void {
    const data = Buffer.from('FFFB2C', 'hex');
    this._sendDataB(data);
  }

  protected _setBaudRate(baudRate: number): void {
    this._will();
    const data = Buffer.from('fffa2c0100000000fff0', 'hex');
    data.writeUInt32BE(baudRate, 4);
    this._sendDataB(data);
  }

  protected _setDatasize(datasize: number): void {
    this._will();
    const data = Buffer.from('fffa2c0200fff0', 'hex');
    data.writeUInt8(datasize, 4);
    this._sendDataB(data);
  }

  protected _setParity(parity: number): void {
    this._will();
    const data = Buffer.from('fffa2c0300fff0', 'hex');
    data.writeUInt8(parity, 4);
    this._sendDataB(data);
  }

  protected _setStopsize(stopsize: number): void {
    this._will();
    const data = Buffer.from('fffa2c0400fff0', 'hex');
    data.writeUInt8(stopsize, 4);
    this._sendDataB(data);
  }

  protected _setControl(control: number): void {
    this._will();
    const data = Buffer.from('fffa2c0500fff0', 'hex');
    data.writeUInt8(control, 4);
    this._sendDataB(data);
  }

  _sendDataB(data: Buffer): void {
    debugApi('MyWorkerNet.sendData', 'data:', data.toString('hex'), 'this._activeCmd:', this._activeCmd);
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
