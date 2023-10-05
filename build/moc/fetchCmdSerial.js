"use strict";
var import_promises = require("fs/promises");
var import_serialport = require("serialport");
var import_ConsolenReader = require("../pylontech/ConsolenReader");
const args = process.argv.slice(2);
const path = args[0];
const baudRate = parseInt(args[1]);
const command = args[2];
console.log("arg1:", "port =>", path);
console.log("arg2:", "baudRate =>", baudRate);
console.log("arg3:", "command =>", command);
const portWork = new import_serialport.SerialPort({ path, baudRate });
const consolenReader = new import_ConsolenReader.ConsolenReader();
portWork.pipe(consolenReader);
consolenReader.on("needsenddata", (data) => {
  portWork.write(data);
});
const file = `data/${command}.txt`;
(0, import_promises.writeFile)(file, "", { flag: "w+" });
portWork.on("data", function(data) {
  (0, import_promises.writeFile)(file, data, { flag: "a+" });
  console.log("DataRecived\n" + data);
});
portWork.write("\r\n");
portWork.write(command);
portWork.write("\n");
function to(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1e3);
  });
}
to(2).then(() => {
  portWork.close();
});
//# sourceMappingURL=fetchCmdSerial.js.map
