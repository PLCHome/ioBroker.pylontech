import { RegexParser } from "@serialport/parser-regex";
import { readFile } from "fs/promises";
import * as net from "net";

const args = process.argv.slice(2);
const host: string = args[0];
const port: number = parseInt(args[1]);
const baudRate: number = parseInt(args[2]);
console.log("arg1:", "host =>", host);
console.log("arg2:", "port =>", port);
console.log("arg3:", "baudRate =>", baudRate);

const portWork = new net.Socket();
portWork.connect(port, host);
const parser = portWork.pipe(new RegexParser({ regex: /[\r\n]+/ }));
parser.on("data", function (data) {
    readFile("data/" + data + ".txt")
        .then((data) => {
            portWork.write(data.toString());
        })
        .catch((err) => {
            console.log("File fehler", err);
        });

    console.log("Pack received:\n" + data);
});
portWork.setKeepAlive(true, 1000);
