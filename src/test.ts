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
import fs from 'fs/promises';
import { Value } from './pylontech/Value';
import WorkerAbstract from './pylontech/WorkerAbstract';
import WorkerSerial from './pylontech/WorkerSerial';
//import WorkerNet from './pylontech/WorkerNet';

const worker: WorkerAbstract = new WorkerSerial('com4', 115200, 'FORCE');
//const worker: WorkerAbstract = new WorkerNet('esp-link.fritz.box', 23, 'FORCE');

fs.writeFile('./elements', '', { flag: 'w+' });
worker.open().then(() => {
  return worker.getData({ info: true, power: true, statistic: true, celldata: true, cellsoh: true }).then((allData: any) => {
    //console.log(JSON.stringify(allData, null, ' '));
    function walk(path: string, val: any): void {
      if (val instanceof Value) {
        fs.writeFile('./elements', path + '\t' + val.value + '\n', { flag: 'a+' });
        console.log(path + '\t' + val.value);
      } else {
        Object.keys(val).forEach(key => {
          walk(`${path}.${key}`, val[key]);
        });
      }
    }
    walk('pylontech.0', allData);
  });
});

function to(time: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time * 1000);
  });
}

to(30).then((): Promise<boolean> => {
  return worker.close();
});
