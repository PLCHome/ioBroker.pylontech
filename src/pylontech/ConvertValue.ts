import debug from "debug";
import { Value } from "./Value";

const debugCVvalue = debug("pylontech:cvalue");

interface ITest {
    rex: RegExp;
    type: string;
    unit: string;
    convert: (str: string) => any;
}

export class ConvertValue {
    protected _tests: ITest[] = [
        { rex: /^(-|\+)?\d+$/gm, type: "number", unit: "", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*%$/gm, type: "number", unit: "%", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*mAH$/gm, type: "number", unit: "mAH", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*mA$/gm, type: "number", unit: "mA", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*mV$/gm, type: "number", unit: "mV", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*mC$/gm, type: "number", unit: "mC", convert: this._toNumber },
        { rex: /^(-|\+)?\d+\s*s$/gm, type: "number", unit: "s", convert: this._toNumber },
        { rex: /^0x\d+$/gm, type: "number", unit: "", convert: this._HexToNumber },
        {
            rex: /^\d{2}-[01]\d-[0-3]\d [0-2]\d:[0-6]\d:[0-6]\d$/gm,
            type: "date",
            unit: "",
            convert: this._toDateS,
        },
        {
            rex: /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-6]\d:[0-6]\d\.\d{3}Z$/gm,
            type: "date",
            unit: "",
            convert: this._toDate,
        },
        {
            rex: /^\d{4}-[01]\d-[0-3]\d [0-2]\d:[0-6]\d:[0-6]\d$/gm,
            type: "date",
            unit: "",
            convert: this._toDate,
        },
    ];

    protected _toNumber(str: string): number {
        debugCVvalue("toN_toNumberumber", "str", str);
        return parseInt(str, 10);
    }

    protected _HexToNumber(str: string): number {
        debugCVvalue("_HexToNumber", "str", str);
        return parseInt(str.substring(2), 16);
    }

    protected _toDateS(str: string): number {
        debugCVvalue("_toDateS", "str", str);
        return new Date(`20${str}`).getTime();
    }

    protected _toDate(str: string): number {
        debugCVvalue("_toDate", "str", str);
        return new Date(str).getTime();
    }

    parseValues(key: string, value: string, noConvertKeys: string[]): Value {
        const val: string = value.trim();
        const result: Value = new Value(val, "string", "", key);
        if (!noConvertKeys.includes(key)) {
            this._tests.forEach((element: ITest) => {
                const rex: RegExp = new RegExp(element.rex);
                if (rex.test(val)) {
                    result.set(element.convert(val), element.type, element.unit, key);
                }
            });
        }
        return result;
    }
}
