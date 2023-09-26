//import * as serialport from "serialport"
export interface IWorker {
    sendCommand(cmd: string): Promise<any>;
    sendData(data: string): void;
    close(): Promise<boolean>;
}
