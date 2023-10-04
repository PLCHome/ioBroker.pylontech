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
import { CommandList } from './CommandList';
import { ConsolenReader } from './ConsolenReader';
import { IParser } from './IParser';
import { IWorker } from './IWorker';
import { Parsers } from './Parsers';
import { Value } from './Value';

const debugApi = debug('pylontech:api');

type resultForGet = { batteries: string[]; batterienames: any; allData: any };

const PWR = 'pwr';
const POWER = 'power';
const STAT = 'stat';
const STATISTIC = 'statistic';
const BAT = 'bat';
const SOH = 'soh';
const INFO = 'info';

abstract class WorkerAbstract implements IWorker {
  protected _consolenReader: ConsolenReader = new ConsolenReader();
  protected _commands: CommandList[] = [];
  protected _activeCmd: CommandList | undefined;
  protected _timeout: number = 5000;
  protected _started: boolean = false;
  protected _parser: Parsers = new Parsers();
  protected _noPrompt: boolean = false;

  constructor() {
    debugApi('MyWorkerAbstract.constructor');
    this._consolenReader.on('data', this._onData.bind(this));
    this._consolenReader.on('needsenddata', this.sendData.bind(this));
  }

  protected _onData(data: Buffer): void {
    const dataString = data.toString();
    debugApi('MyWorkerAbstract._onData', 'data:', dataString, 'this._activeCmd:', this._activeCmd);
    const parser: IParser | undefined = this._parser.getParser(dataString);
    let result: any = {};
    if (parser !== undefined) {
      result = parser.parseData(dataString);
    }
    if (this._activeCmd) {
      clearTimeout(this._activeCmd.timeout);
      this._activeCmd.resolve(result);
      this._activeCmd = undefined;
    }
    this._nextcommand();
  }

  protected _nextcommand(): void {
    debugApi('MyWorkerAbstract._nextcommand', 'this._activeCmd:', this._activeCmd, 'this._started:', this._started);
    if (!this._activeCmd && this._started) {
      this._activeCmd = this._commands.shift();
      if (this._activeCmd) {
        this.sendData(this._activeCmd.cmd + '\r');
        this._activeCmd.timeout = setTimeout(this._ontimeout.bind(this), this._timeout);
      }
    }
  }

  protected _ontimeout(): void {
    debugApi('MyWorkerAbstract._ontimeout', 'this._activeCmd:', this._activeCmd);
    if (this._activeCmd) {
      this._activeCmd.reject(new Error('timeout'));
      this._activeCmd = undefined;
      this._consolenReader._flush(() => {
        this._nextcommand();
      });
    }
  }

  protected _connected(): void {
    debugApi('MyWorkerAbstract._connected', 'this._activeCmd:', this._activeCmd);
    if (!this._noPrompt) {
      this.sendData('\r\n');
    }
    this._started = true;
    this._nextcommand();
  }

  public sendCommand(cmd: string): Promise<any> {
    debugApi('MyWorkerAbstract.sendCommand', 'cmd:', cmd);
    return new Promise<any>((resolve, reject) => {
      this._commands.push({ cmd, resolve, reject, timeout: undefined });
      this._nextcommand();
    });
  }

  public sendSpeedInit(): Promise<void> {
    debugApi('MyWorkerAbstract.sendSpeedInit');
    return new Promise<void>((resolve, reject) => {
      try {
        const setSpeed = Buffer.from('7E32303031343638324330303438353230464343330D', 'hex');
        this.sendDataB(setSpeed);
        setTimeout(() => {
          resolve();
        }, 1000);
      } catch (err) {
        reject(err);
      }
    });
  }

  abstract sendDataB(data: Buffer): void;

  abstract sendData(data: string): void;

  abstract open(): Promise<void>;

  abstract close(): Promise<boolean>;

  protected async _getAlldata(batteries: string[], cmd: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const promises: Promise<any>[] = [];
      batteries.forEach((bat: string) => {
        promises.push(this.sendCommand(`${cmd} ${bat}`));
      });
      Promise.all(promises)
        .then((vals: any[]) => {
          let all: any = {};
          vals.forEach(val => {
            all = Object.assign(all, val);
          });
          resolve(all);
        })
        .catch(reject);
    });
  }

  protected async _getPwr(): Promise<{ pwrs: any; batteries: string[] }> {
    return new Promise<{ pwrs: any; batteries: string[] }>((resolve, reject) => {
      this.sendCommand(PWR)
        .then(pwrs => {
          const batteries: string[] = [];
          if (pwrs && pwrs.pwr) {
            const pwr: any = pwrs.pwr;
            Object.keys(pwr).forEach((key: string) => {
              const pwrVal: any = pwr[key];
              if (pwrVal.basest instanceof Value) {
                const pwrBase: Value = pwrVal.basest;
                if (pwrBase.value !== 'Absent') {
                  batteries.push(key);
                }
              }
            });
          }
          resolve({ pwrs, batteries });
        })
        .catch(reject);
    });
  }

  protected async _getinfo(p: { pwrs: any; batteries: string[] }, info: boolean, power: boolean): Promise<resultForGet> {
    return new Promise<resultForGet>((resolve, reject) => {
      this._getAlldata(p.batteries, INFO)
        .then((infos: any) => {
          const allData: any = {};
          const batterienames: any = {};
          Object.keys(infos).forEach((key: string) => {
            if (infos[key].info && infos[key].info.barcode && infos[key].info.barcode instanceof Value) {
              batterienames[key] = infos[key].info.barcode.value;
              if (info) {
                allData[infos[key].info.barcode.value] = infos[key];
                delete allData[infos[key].info.barcode.value].info.barcode;
              }
            }
          });
          p.batteries.forEach((bat: any) => {
            if (batterienames[bat]) {
              if (power) {
                allData[batterienames[bat]].power = allData[batterienames[bat]].power
                  ? Object.assign(allData[batterienames[bat]].power, p.pwrs.pwr[bat])
                  : p.pwrs.pwr[bat];
              }
              if (!allData.info) allData.info = {};
              allData.info[`${bat}`] = {
                barcode: new Value(batterienames[bat], 'string', '', 'Barcode'),
                connected: new Value(true, 'boolean', '', 'Connected'),
              };
            }
          });
          resolve({ batteries: p.batteries, batterienames, allData });
        })
        .catch(reject);
    });
  }

  protected async _getNormal(p: resultForGet, what: string, to: string, process: boolean): Promise<resultForGet> {
    return new Promise<resultForGet>((resolve, reject) => {
      if (process) {
        this._getAlldata(p.batteries, what)
          .then((data: any) => {
            Object.keys(data).forEach((key: string) => {
              if (p.batterienames[key] && p.allData[p.batterienames[key]] && data[key][what]) {
                p.allData[p.batterienames[key]][to] = p.allData[p.batterienames[key]][to]
                  ? Object.assign(p.allData[p.batterienames[key]].power, data[key][what])
                  : data[key][what];
              }
            });
            resolve(p);
          })
          .catch(reject);
      } else {
        resolve(p);
      }
    });
  }

  protected async _getBatterie(p: resultForGet, what: string, process: boolean): Promise<resultForGet> {
    return new Promise<resultForGet>((resolve, reject) => {
      if (process) {
        this._getAlldata(p.batteries, what)
          .then((data: any) => {
            Object.keys(data).forEach((key: string) => {
              if (p.batterienames[key] && data[key][what]) {
                Object.keys(data[key][what]).forEach((batnr: string) => {
                  const batkey = `battery${(parseInt(batnr, 10) + 1).toString().padStart(2, '0')}`;
                  p.allData[p.batterienames[key]][batkey] = p.allData[p.batterienames[key]][batkey]
                    ? Object.assign(p.allData[p.batterienames[key]][batkey], data[key][what][batnr])
                    : data[key][what][batnr];
                });
              }
            });
            resolve(p);
          })
          .catch(reject);
      } else {
        resolve(p);
      }
    });
  }

  protected async _getOne(allData: any, what: string, process: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (process) {
        this.sendCommand(what)
          .then(data => {
            if (data[what]) {
              allData[what] = data[what];
            }
            resolve(allData);
          })
          .catch(reject);
      } else {
        resolve(allData);
      }
    });
  }

  public async getData(option: any): Promise<any> {
    if (typeof option.info == 'undefined') option.info = true;
    if (typeof option.power == 'undefined') option.power = true;
    if (typeof option.statistic == 'undefined') option.statistic = true;
    if (typeof option.celldata == 'undefined') option.celldata = true;
    if (typeof option.cellsoh == 'undefined') option.cellsoh = true;
    if (typeof option.log == 'undefined') option.log = true;
    return new Promise<any>((resolve, reject) => {
      this._getPwr()
        .then((p: { pwrs: any; batteries: string[] }) => {
          this._getinfo(p, option.info, option.power)
            .then((p: resultForGet) => {
              this._getNormal(p, PWR, POWER, option.power)
                .then(p => {
                  this._getNormal(p, STAT, STATISTIC, option.statistic)
                    .then(p => {
                      this._getBatterie(p, BAT, option.celldata)
                        .then(p => {
                          this._getBatterie(p, SOH, option.cellsoh)
                            .then(p => {
                              this._getOne(p.allData, 'log', option.log)
                                .then(allData => {
                                  this._getOne(allData, 'time', option.log)
                                    .then(allData => {
                                      resolve(allData);
                                    })
                                    .catch(reject);
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}
export = WorkerAbstract;
