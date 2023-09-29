import * as utils from '@iobroker/adapter-core';
import { SerialPort } from 'serialport';
import { Value } from './pylontech/Value';
import WorkerAbstract from './pylontech/WorkerAbstract';
import WorkerNet from './pylontech/WorkerNet';
import WorkerSerial from './pylontech/WorkerSerial';

class Pylontech extends utils.Adapter {
  workTimer: NodeJS.Timeout | undefined;

  public constructor(options: Partial<utils.AdapterOptions> = {}) {
    super({
      ...options,
      name: 'pylontech',
    });
    this.on('ready', this.onReady.bind(this));
    //this.on("stateChange", this.onStateChange.bind(this));
    // this.on("objectChange", this.onObjectChange.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('unload', this.onUnload.bind(this));
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
    // this.subscribeStates("*");

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

    this.onTimer();
    this.workTimer = setInterval(this.onTimer.bind(this), this.config.cycle * 60000);
  }

  onMessage(obj: any): void {
    let wait = false;
    this.log.debug(JSON.stringify(obj));
    if (obj) {
      switch (obj.command) {
        case 'getDevices':
          wait = true;
          SerialPort.list().then(port => {
            const ports: string[] = [];
            port.forEach(p => {
              ports.push(p.path);
            });
            this.sendTo(obj.from, obj.command, JSON.stringify(ports), obj.callback);
          });
          break;
        default:
          this.log.warn(`Unknown command: ${obj.command}`);
          return;
      }
    }
    if (!wait && obj.callback) {
      this.sendTo(obj.from, obj.command, obj.message, obj.callback);
    }
    return;
  }

  private onTimer(): void {
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
              this.log.info(info[3]);
              this.log.info(
                `${allData.info && allData.info[info[3]] && allData.info[info[3]].connected} ${allData.info && allData.info[info[3]]} ${allData.info}`
              );
              if (!(allData.info && allData.info[info[3]] && allData.info[info[3]].connected)) {
                this.setStateAsync(path, false, true);
              }
            });
          });
        })
        .catch(this.log.error);
    } catch (e) {
      this.log.error((e as Error).message);
    }
  }

  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  private onUnload(callback: () => void): void {
    try {
      clearInterval(this.workTimer);
      // Here you must clear all timeouts or intervals that may still be active
      // clearTimeout(timeout1);
      // clearTimeout(timeout2);
      // ...
      // clearInterval(interval1);

      callback();
    } catch (e) {
      callback();
    }
  }

  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
  //     if (obj) {
  //         // The object was changed
  //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  //     } else {
  //         // The object was deleted
  //         this.log.info(`object ${id} deleted`);
  //     }
  // }

  /**
   * Is called if a subscribed state changes
   */
  /*
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    */

  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  */
  // private onMessage(obj: ioBroker.Message): void {
  //     if (typeof obj === "object" && obj.message) {
  //         if (obj.command === "send") {
  //             // e.g. send email or pushover or whatever
  //             this.log.info("send command");

  //             // Send response in callback if required
  //             if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
  //         }
  //     }
  // }
}

if (require.main !== module) {
  // Export the constructor in compact mode
  module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Pylontech(options);
} else {
  // otherwise start the instance directly
  (() => new Pylontech())();
}
