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
import { SerialPort } from 'serialport';

const args = process.argv.slice(2);
const path: string = args[0];
const baudRate: number = parseInt(args[1]);
const typ: string = args[2];
console.log('arg1:', 'port =>', path);
console.log('arg2:', 'baudRate =>', baudRate);
console.log('arg3:', 'typ =>', typ);

const portWork = new SerialPort({ path, baudRate });
const parser = portWork.pipe(new RegexParser({ regex: /[\r\n]+/ }));
parser.on('data', function (data) {
  readFile(`data/${typ}/${data}.txt`)
    .then(data => {
      portWork.write(data.toString());
    })
    .catch(err => {
      console.log('File fehler', err);
    });

  console.log('Pack received:\n' + data);
});
