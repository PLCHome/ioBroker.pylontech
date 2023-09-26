"use strict";
var import_parser_regex = require("@serialport/parser-regex");
var import_promises = require("fs/promises");
var import_serialport = require("serialport");
const args = process.argv.slice(2);
const path = args[0];
const baudRate = parseInt(args[1]);
console.log("arg1:", "port =>", path);
console.log("arg2:", "baudRate =>", baudRate);
const portWork = new import_serialport.SerialPort({ path, baudRate });
const parser = portWork.pipe(new import_parser_regex.RegexParser({ regex: /[\r\n]+/ }));
parser.on("data", function(data) {
  (0, import_promises.readFile)("data/" + data + ".txt").then((data2) => {
    portWork.write(data2.toString());
  }).catch((err) => {
    console.log("File fehler", err);
  });
  console.log("Pack received:\n" + data);
});
//# sourceMappingURL=serialMoc.js.map
