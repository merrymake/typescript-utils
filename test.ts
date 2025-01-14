import { Arr, is, Obj, sleep, Str, UnitType, valueType } from "./index.js";

const Stages = valueType<[number, number]>()({
  baby: [0, 0],
  child: [1, 12],
  teen: [13, 19],
});

console.log(Str.withUnit(300432, UnitType.Duration)); // 5.0m
console.log(Str.withUnit(1024, UnitType.Memory, "kb")); // 1.0mb

(async () => {
  {
    const timer = Str.Spinner.start();
    await sleep(5000);
    timer.stop();
  }
  {
    const timer = Str.Timer.start(Str.Timer.format.Colon);
    await sleep(12000);
    timer.stop();
  }
})();

const o = { a: "hello", b: "hi" };
// Object.keys(o).forEach((k) => o[k]); ERROR
Obj.Sync.forEach(o, (k) => o[k]);
const of = (o: { [key: string]: string }) =>
  Obj.Sync.map(o, (k, v) => k.length);
const oi = Obj.Sync.map(o, (s) => s.length);
Arr.Sync.toObject(Obj.keys(o), (k) => o[k]);

const s: { [k: string]: string } = { a: "hello", b: "hi" };
Obj.Sync.forEach(s, (k) => k.substring(0));

const v: string[] | string | { a: number } = "hi" as any;
is(v, "array") && v.join("");
is(v, "string") && v.substring(0);
is(v, "object") && v.a;
