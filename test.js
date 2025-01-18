import { Arr, is, Obj, sleep, Str, UnitType, valueType } from "./index.js";
console.log(Str.list(["red"])); // red
console.log(Str.list(["red", "green"])); // red and green
console.log(Str.list(["red", "green", "yellow"])); // red, green, and yellow
const Stages = valueType()({
    baby: [0, 0],
    child: [1, 12],
    teen: [13, 19],
});
console.log(Str.withUnit(300432, UnitType.Duration)); // 5.0m
console.log(Str.withUnit(1024, UnitType.Memory, "kb")); // 1.0mb
(async () => {
    {
        const format = Obj.random(Str.Spinner.format);
        console.log(format.key);
        const timer = Str.Spinner.start(format.value);
        await sleep(5000);
        timer.stop();
    }
    {
        const timer = Str.Timer.start(new Str.Timer.Seconds("s elapsed"));
        await sleep(12000);
        timer.stop();
    }
})();
const o = { a: "hello", b: "hi" };
// Object.keys(o).forEach((k) => o[k]); ERROR
Obj.Sync.forEach(o, (k) => o[k]);
const of = (o) => Obj.Sync.map(o, (k, v) => k.length);
const oi = Obj.Sync.map(o, (s) => s.length);
Arr.Sync.toObject(Obj.keys(o), (k) => o[k]);
const s = { a: "hello", b: "hi" };
Obj.Sync.forEach(s, (k) => k.substring(0));
const v = "hi";
is(v, "array") && v.join("");
is(v, "string") && v.substring(0);
is(v, "object") && v.a;
