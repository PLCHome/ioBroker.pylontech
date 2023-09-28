//import * as serialport from "serialport"
export class Value {
  value: number | string | boolean;
  type: string;
  unit: string;
  name: string;
  write: boolean;
  function: string | undefined;

  constructor(value: number | string | boolean, type: string, unit: string, name: string) {
    this.value = value;
    this.type = type;
    this.unit = unit;
    this.name = name;
    this.write = false;
  }

  set(value: number | string | boolean, type: string, unit: string, name: string): void {
    this.value = value;
    this.type = type;
    this.unit = unit;
    this.name = name;
  }
}
