import { RegexParser } from "@serialport/parser-regex";
import { readFile } from "fs/promises";
import { SerialPort } from "serialport";

const args = process.argv.slice(2);
const path: string = args[0];
const baudRate: number = parseInt(args[1]);
console.log("arg1:", "port =>", path);
console.log("arg2:", "baudRate =>", baudRate);

const portWork = new SerialPort({ path, baudRate });
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
