import { durationString, mapObject, Timer, toObject, typedKeys, valueType, } from "./index.js";
const Stages = valueType()({
    baby: [0, 0],
    child: [1, 12],
    teen: [13, 19],
});
console.log(durationString(300432)); // 5.0m
const timer = new Timer();
timer.stop();
const o = { a: "hello", b: "hi" };
// Object.keys(o).forEach((k) => o[k]); ERROR
typedKeys(o).forEach((k) => o[k]);
const oi = mapObject(o, (s) => s.length);
toObject(typedKeys(o), (k) => o[k]);
const s = { a: "hello", b: "hi" };
typedKeys(s).forEach((k) => k.substring(0));
