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

import { writeFile } from 'fs/promises';
import * as net from 'net';
import { ConsolenReader } from '../pylontech/ConsolenReader';

const args = process.argv.slice(2);
const host: string = args[0];
const port: number = parseInt(args[1]);
const command: string = args[2];
console.log('arg1:', 'host =>', host);
console.log('arg2:', 'port =>', port);
console.log('arg3:', 'command =>', command);

const portWork = new net.Socket();
portWork.connect(port, host);
const consolenReader: ConsolenReader = new ConsolenReader();
portWork.pipe(consolenReader);
consolenReader.on('needsenddata', (data: string): void => {
  portWork.write(data);
});
const file = `${command}.txt`;
writeFile(file, '', { flag: 'w+' });
portWork.on('data', function (data) {
  writeFile(file, data, { flag: 'a+' });
  console.log('DataRecived\n' + data);
});
portWork.write('\r\n');
portWork.write(command);
portWork.write('\n');

function to(time: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time * 1000);
  });
}

to(2).then(() => {
  portWork.end();
});
