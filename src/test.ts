//import * as serialport from "serialport"
import { Value } from "./pylontech/Value";
import WorkerAbstract from "./pylontech/WorkerAbstract";
//import WorkerNet from "./pylontech/WorkerNet";
import WorkerSerial from "./pylontech/WorkerSerial";
//import { IValue } from './pylontech/IValue';
import fs from "fs/promises";

const worker: WorkerAbstract = new WorkerSerial("com7", 115200);

fs.writeFile("./elements", "", { flag: "w+" });

worker.getData().then((allData: any) => {
    console.log(JSON.stringify(allData, null, " "));
    function walk(path: string, val: any): void {
        if (val instanceof Value) {
            fs.writeFile("./elements", path + "\t" + val.value + "\n", { flag: "a+" });
            console.log(path + "\t" + val.value);
        } else {
            Object.keys(val).forEach((key) => {
                walk(`${path}.${key}`, val[key]);
            });
        }
    }
    walk("pylontech.0", allData);
});

function to(time: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, time * 1000);
    });
}

to(30).then((): Promise<boolean> => {
    return worker.close();
});
