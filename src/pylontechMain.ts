import * as utils from '@iobroker/adapter-core';
import { SerialPort } from 'serialport';
import { Value } from './pylontech/Value';
import WorkerAbstract from './pylontech/WorkerAbstract';
import WorkerNet from './pylontech/WorkerNet';
import WorkerSerial from './pylontech/WorkerSerial';

class order {
  protected _list: ((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void)[] = [];
  protected _busy: boolean = false;
  protected _timer: NodeJS.Timeout | undefined;
  protected _errLog: (msg: string) => void;

  constructor(errLog: (msg: string) => void) {
    this._errLog = errLog;
  }

  addFunc(func: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void): void {
    if (func) {
      this._list.push(func);
      this.donext();
    }
  }

  doende(): void {
    this._busy = false;
    clearTimeout(this._timer);
    this.donext();
  }
  donext(): void {
    if (!this._busy) {
      this._busy = true;
      const func: ((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) | undefined = this._list.pop();
      if (func) {
        new Promise<void>((resolve, reject) => {
          this._timer = setTimeout((): void => {
            this.doende();
            reject('order timeout!!!');
          }, 30000);

          const resolveInt = (): void => {
            this.doende();
            resolve();
          };
          const rejectInt = (err: string): void => {
            this.doende();
            reject(err);
          };
          func(resolveInt, rejectInt);
        }).catch(this._errLog);
      } else {
        this._busy = false;
      }
    }
  }
}

class Pylontech extends utils.Adapter {
  private _workTimer: NodeJS.Timeout | undefined;
  private _order: order | undefined;

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({
      ...options,
      name: 'pylontech',
    });

    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('unload', this._onUnload.bind(this));
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */
  private async onReady(): Promise<void> {
    // Initialize your adapter here

    // Reset the connection indicator during startup
    this.setState('info.connection', false, true);

    // this.subscribeStates('testVariable');
    // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
    // this.subscribeStates("lights.*");
    // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
    this.subscribeStates('*');
    this._order = new order(this.log.error);

    if (typeof this.config.connection == 'undefined') this.config.connection = '1';
    if (typeof this.config.baudrate == 'undefined') this.config.baudrate = 115200;
    if (typeof this.config.rfc2217 == 'undefined') this.config.rfc2217 = false;
    if (typeof this.config.netbaudrate == 'undefined') this.config.netbaudrate = 115200;
    if (typeof this.config.info == 'undefined') this.config.info = true;
    if (typeof this.config.power == 'undefined') this.config.power = true;
    if (typeof this.config.statistic == 'undefined') this.config.statistic = true;
    if (typeof this.config.celldata == 'undefined') this.config.celldata = true;
    if (typeof this.config.cellsoh == 'undefined') this.config.cellsoh = true;
    if (typeof this.config.log == 'undefined') this.config.log = true;
    if (typeof this.config.cycle == 'undefined') this.config.cycle = 5;

    this._order.addFunc(this._onTimer.bind(this));
    this._workTimer = setInterval((): void => {
      if (this._order) this._order.addFunc(this._onTimer.bind(this));
    }, this.config.cycle * 60000);
  }

  private _onTimer(resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void): void {
    try {
      const worker: WorkerAbstract =
        this.config.connection == '1'
          ? new WorkerSerial(this.config.device, this.config.baudrate)
          : new WorkerNet(this.config.host, this.config.port, this.config.netbaudrate, this.config.rfc2217);

      worker
        .getData({
          info: this.config.info,
          power: this.config.power,
          statistic: this.config.statistic,
          celldata: this.config.celldata,
          cellsoh: this.config.cellsoh,
          log: this.config.log,
        })
        .then((allData: any) => {
          worker.close();
          this.setState('info.connection', true, true);
          resolve();
          const walk = async (path: string, val: any): Promise<void> => {
            if (val instanceof Value) {
              const objdesc: any = {
                type: 'state',
                common: {
                  name: val.name,
                  type: 'number',
                  role: 'value',
                  read: true,
                  write: val.write,
                },
                native: {},
              };
              if (val.unit) objdesc.common.unit = val.unit;
              if (val.function) objdesc.native.function = val.function;
              switch (val.type) {
                case 'date':
                  objdesc.common.role = 'value.time';
                  break;
                case 'boolean':
                case 'string':
                  objdesc.common.type = val.type;
                  break;
              }
              await this.setObjectNotExistsAsync(path, objdesc);
              this.setStateAsync(path, val.value, true);
            } else {
              let p = '';
              if (path !== '') p = '.';
              Object.keys(val).forEach(key => {
                walk(`${path}${p}${key}`, val[key]);
              });
            }
          };
          walk('', allData);
          this.getStatesAsync('info.*.connected').then(state => {
            Object.keys(state).forEach(path => {
              const info = path.split('.');
              if (!(allData.info && allData.info[info[3]] && allData.info[info[3]].connected)) {
                this.setStateAsync(path, false, true);
              }
            });
          });
        })
        .catch(err => {
          worker.close();
          reject(err);
        });
    } catch (e) {
      reject((e as Error).message);
    }
  }

  private _setTime(time: number, cb?: ((ok: boolean) => void) | undefined): void {
    const d = new Date(time);
    if (this._order) {
      this.log.info('settime ..');
      this._order.addFunc((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void): void => {
        try {
          const worker: WorkerAbstract =
            this.config.connection == '1'
              ? new WorkerSerial(this.config.device, this.config.baudrate)
              : new WorkerNet(this.config.host, this.config.port, this.config.netbaudrate, this.config.rfc2217);

          function f2(val: number): string {
            return val.toString().padStart(2, '0');
          }
          const cmd = `time ${f2(d.getFullYear() % 100)} ${f2(d.getMonth() + 1)} ${f2(d.getDate())} ${f2(d.getHours())} ${f2(d.getMinutes())} ${f2(
            d.getSeconds()
          )}`;
          this.log.info(cmd);
          worker
            .sendCommand(cmd)
            .then(() => {
              this.log.info('then');
              worker.close();
              resolve();
              if (cb) cb(true);
            })
            .catch(err => {
              worker.close();
              reject(err);
              if (cb) cb(false);
            });
        } catch (e) {
          reject((e as Error).message);
          if (cb) cb(false);
        }
      });
    }
  }

  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  private _onUnload(callback: () => void): void {
    try {
      clearInterval(this._workTimer);
      callback();
    } catch (e) {
      callback();
    }
  }

  /**
   * Is called if a subscribed state changes
   */
  private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
    if (state && state.ack == false) {
      this.getObjectAsync(id).then((obj: ioBroker.Object | null | undefined) => {
        if (obj && obj.common.write && obj.native.function) {
          this.log.debug(obj.native.function);
          switch (obj.native.function) {
            case 'settime':
              if (typeof state.val == 'number') this._setTime(state.val);
              break;
            case 'akttime':
              if (state.val)
                this._setTime(new Date().getTime(), (ok: boolean) => {
                  this.log.info('cb !!');
                  this.setStateAsync(id, ok, true);
                });
              break;
          }
        }
      });
    }
  }

  private onMessage(obj: ioBroker.Message): void {
    this.log.debug(JSON.stringify(obj));
    let wait = false;
    if (typeof obj === 'object' && obj.message) {
      switch (obj.command) {
        case 'getDevices':
          wait = false;
          SerialPort.list().then(port => {
            const ports: string[] = [];
            port.forEach(p => {
              ports.push(p.path);
            });
            //obj.message = ports;
            obj.message = JSON.stringify(ports);
          });
          break;
        default:
          obj.message = `Unknown command: ${obj.command}`;
          this.log.warn(obj.message);
          return;
      }
    }
    if (!wait && obj.callback) {
      this.sendTo(obj.from, obj.command, obj.message, obj.callback);
    }
    return;
  }
}

if (require.main !== module) {
  // Export the constructor in compact mode
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Pylontech(options);
} else {
  // otherwise start the instance directly
  (() => new Pylontech())();
}
