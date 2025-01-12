import { Arr, Obj, stringWithUnit, Timer, UnitType, valueType, } from "./index.js";
const Stages = valueType()({
    baby: [0, 0],
    child: [1, 12],
    teen: [13, 19],
});
console.log(stringWithUnit(300432, UnitType.Duration)); // 5.0m
console.log(stringWithUnit(1024, UnitType.Memory, "kb")); // 1.0mb
const timer = new Timer();
timer.stop();
const o = { a: "hello", b: "hi" };
// Object.keys(o).forEach((k) => o[k]); ERROR
Obj.Sync.forEach(o, (k) => o[k]);
const of = (o) => Obj.Sync.map(o, (k, v) => k.length);
const oi = Obj.Sync.map(o, (s) => s.length);
Arr.Sync.toObject(Obj.Sync.keys(o), (k) => o[k]);
const s = { a: "hello", b: "hi" };
Obj.Sync.forEach(s, (k) => k.substring(0));
