import {
  mapObject,
  stringWithUnit,
  Timer,
  toObject,
  typedKeys,
  UnitType,
  valueType,
} from "./index.js";

const Stages = valueType<[number, number]>()({
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
typedKeys(o).forEach((k) => o[k]);
const of = (o: { [key: string]: string }) => mapObject(o, (k, v) => k.length);
const oi = mapObject(o, (s) => s.length);
toObject(typedKeys(o), (k) => o[k]);

const s: { [k: string]: string } = { a: "hello", b: "hi" };
typedKeys(s).forEach((k) => k.substring(0));
