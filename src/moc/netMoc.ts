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

import { RegexParser } from '@serialport/parser-regex';
import { readFile } from 'fs/promises';
import * as net from 'net';

const args = process.argv.slice(2);
const host: string = args[0];
const port: number = parseInt(args[1]);
const baudRate: number = parseInt(args[2]);
console.log('arg1:', 'host =>', host);
console.log('arg2:', 'port =>', port);
console.log('arg3:', 'baudRate =>', baudRate);

const portWork = new net.Socket();
portWork.connect(port, host);
const parser = portWork.pipe(new RegexParser({ regex: /[\r\n]+/ }));
parser.on('data', function (data) {
  readFile('data/' + data + '.txt')
    .then(data => {
      portWork.write(data.toString());
    })
    .catch(err => {
      console.log('File fehler', err);
    });

  console.log('Pack received:\n' + data);
});
portWork.setKeepAlive(true, 1000);
