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

export class FktInOrder {
  protected _list: ((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void)[] = [];
  protected _busy: boolean = false;
  protected _timer: NodeJS.Timeout | undefined;
  protected _errLog: (msg: string) => void;

  constructor(errLog: (msg: string) => void) {
    this._errLog = errLog;
  }

  addFunc(func: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void): void {
    if (func) {
      this._list.push(func);
      this.donext();
    }
  }

  doende(): void {
    this._busy = false;
    clearTimeout(this._timer);
    this.donext();
  }
  donext(): void {
    if (!this._busy) {
      this._busy = true;
      const func: ((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) | undefined = this._list.pop();
      if (func) {
        new Promise<void>((resolve, reject) => {
          this._timer = setTimeout((): void => {
            this.doende();
            reject('order timeout!!!');
          }, 30000);

          const resolveInt = (): void => {
            this.doende();
            resolve();
          };
          const rejectInt = (err: string): void => {
            this.doende();
            reject(err);
          };
          func(resolveInt, rejectInt);
        }).catch(this._errLog);
      } else {
        this._busy = false;
      }
    }
  }
}
