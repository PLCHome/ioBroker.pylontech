import Debug from 'debug';
import { SerialPort } from 'serialport';
import WorkerAbstract from './WorkerAbstract';

const debugApi = Debug('pylontech:api');

export = class WorkerSerial extends WorkerAbstract {
  protected _socket: SerialPort;

  constructor(path: string, baudRate: number, debugData?: (data: Buffer) => void) {
    debugApi('MyWorkerNet.constructor', 'path:', path, 'baudRate:', baudRate);
    super();
    this._socket = new SerialPort({ path, baudRate });
    if (debugData) this._socket.on('data', debugData);
    this._socket.pipe(this._consolenReader);
    this._socket.open(this._connected.bind(this));
  }

  sendData(data: string): void {
    debugApi('MyWorkerSerial.sendData', 'data:', data.toString(), 'this._activeCmd:', this._activeCmd);
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
