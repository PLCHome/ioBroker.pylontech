import debug from "debug";
import { CommandList } from "./CommandList";
import { ConsolenReader } from "./ConsolenReader";
import { IParser } from "./IParser";
import { IWorker } from "./IWorker";
import { Parsers } from "./Parsers";
import { Value } from "./Value";

const debugApi = debug("pylontech:api");

type resultForGet = { batteries: string[]; batterienames: any; allData: any };

const PWR = "pwr";
const POWER = "power";
const STAT = "stat";
const STATISTIC = "statistic";
const BAT = "bat";
const SOH = "soh";
const INFO = "info";

abstract class WorkerAbstract implements IWorker {
    protected _consolenReader: ConsolenReader = new ConsolenReader();
    protected _commands: CommandList[] = [];
    protected _activeCmd: CommandList | undefined;
    protected _timeout: number = 5000;
    protected _started: boolean = false;
    protected _parser: Parsers = new Parsers();

    constructor() {
        debugApi("MyWorkerAbstract.constructor");
        this._consolenReader.on("data", this._onData.bind(this));
        this._consolenReader.on("needsenddata", this.sendData.bind(this));
    }

    protected _onData(data: Buffer): void {
        const dataString = data.toString();
        debugApi("MyWorkerAbstract._onData", "data:", dataString, "this._activeCmd:", this._activeCmd);
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
        debugApi("MyWorkerAbstract._nextcommand", "this._activeCmd:", this._activeCmd, "this._started:", this._started);
        if (!this._activeCmd && this._started) {
            this._activeCmd = this._commands.shift();
            if (this._activeCmd) {
                this.sendData(this._activeCmd.cmd + "\r");
                this._activeCmd.timeout = setTimeout(this._ontimeout.bind(this), this._timeout);
            }
        }
    }

    protected _ontimeout(): void {
        debugApi("MyWorkerAbstract._ontimeout", "this._activeCmd:", this._activeCmd);
        if (this._activeCmd) {
            this._activeCmd.reject(new Error("timeout"));
            this._activeCmd = undefined;
            this._consolenReader._flush(() => {
                this._nextcommand();
            });
        }
    }

    protected _connected(): void {
        debugApi("MyWorkerAbstract._connected", "this._activeCmd:", this._activeCmd);
        this.sendData("\r\n");
        this._started = true;
        this._nextcommand();
    }

    public sendCommand(cmd: string): Promise<any> {
        debugApi("MyWorkerAbstract.sendCommand", "cmd:", cmd);
        return new Promise<any>((resolve, reject) => {
            this._commands.push({ cmd, resolve, reject, timeout: undefined });
            this._nextcommand();
        });
    }

    abstract sendData(data: string): void;

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
                    vals.forEach((val) => {
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
                .then((pwrs) => {
                    const batteries: string[] = [];
                    if (pwrs && pwrs.pwr) {
                        const pwr: any = pwrs.pwr;
                        Object.keys(pwr).forEach((key: string) => {
                            const pwrVal: any = pwr[key];
                            if (pwrVal.basest instanceof Value) {
                                const pwrBase: Value = pwrVal.basest;
                                if (pwrBase.value !== "Absent") {
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

    protected async _getinfo(p: { pwrs: any; batteries: string[] }): Promise<resultForGet> {
        return new Promise<resultForGet>((resolve, reject) => {
            this._getAlldata(p.batteries, INFO)
                .then((infos: any) => {
                    const allData: any = {};
                    const batterienames: any = {};
                    Object.keys(infos).forEach((key: string) => {
                        if (infos[key].info && infos[key].info.barcode && infos[key].info.barcode instanceof Value) {
                            batterienames[key] = infos[key].info.barcode.value;
                            allData[infos[key].info.barcode.value] = infos[key];
                            delete allData[infos[key].info.barcode.value].info.barcode;
                        }
                    });
                    p.batteries.forEach((bat: any) => {
                        if (batterienames[bat]) {
                            allData[batterienames[bat]].power = allData[batterienames[bat]].power
                                ? Object.assign(allData[batterienames[bat]].power, p.pwrs.pwr[bat])
                                : p.pwrs.pwr[bat];
                            allData[`info.${bat}`] = {
                                barcode: new Value(batterienames[bat], "string", "", "Barcode"),
                                connected: new Value(true, "boolean", "", "Connected"),
                            };
                        }
                    });
                    resolve({ batteries: p.batteries, batterienames, allData });
                })
                .catch(reject);
        });
    }

    protected async _getNormal(p: resultForGet, what: string, to: string): Promise<resultForGet> {
        return new Promise<resultForGet>((resolve, reject) => {
            this._getAlldata(p.batteries, what)
                .then((data: any) => {
                    Object.keys(data).forEach((key: string) => {
                        if (p.batterienames[key] && p.allData[p.batterienames[key]] && data[key][what]) {
                            p.allData[p.batterienames[key]][to] = p.allData[p.batterienames[key]][to]
                                ? Object.assign(p.allData[p.batterienames[key]].power, data[key][what])
                                : data[key][what];
                        }
                    });
                    resolve({ batteries: p.batteries, batterienames: p.batterienames, allData: p.allData });
                })
                .catch(reject);
        });
    }

    protected async _getBatterie(p: resultForGet, what: string): Promise<resultForGet> {
        return new Promise<resultForGet>((resolve, reject) => {
            this._getAlldata(p.batteries, what)
                .then((data: any) => {
                    Object.keys(data).forEach((key: string) => {
                        if (p.batterienames[key] && data[key][what]) {
                            Object.keys(data[key][what]).forEach((batnr: string) => {
                                const batkey = `battery${(parseInt(batnr, 10) + 1).toString().padStart(2, "0")}`;
                                p.allData[p.batterienames[key]][batkey] = p.allData[p.batterienames[key]][batkey]
                                    ? Object.assign(p.allData[p.batterienames[key]][batkey], data[key][what][batnr])
                                    : data[key][what][batnr];
                            });
                        }
                    });
                    resolve({ batteries: p.batteries, batterienames: p.batterienames, allData: p.allData });
                })
                .catch(reject);
        });
    }

    protected async _getLog(allData: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.sendCommand("log")
                .then((log) => {
                    if (log.log) {
                        allData.log = log.log;
                    }
                    resolve(allData);
                })
                .catch(reject);
        });
    }

    public async getData(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._getPwr()
                .then((p: { pwrs: any; batteries: string[] }) => {
                    this._getinfo(p)
                        .then((p: resultForGet) => {
                            this._getNormal(p, PWR, POWER)
                                .then((p) => {
                                    this._getNormal(p, STAT, STATISTIC)
                                        .then((p) => {
                                            this._getBatterie(p, BAT)
                                                .then((p) => {
                                                    this._getBatterie(p, SOH)
                                                        .then((p) => {
                                                            this._getLog(p.allData)
                                                                .then((allData) => {
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
        });
    }
}
export = WorkerAbstract;
