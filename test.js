import { Arr, Catch, is, Obj, Promise_all, Raises, sleep, Start, Str, UnitType, valueType, } from "./index.js";
console.log(Obj.Sync.map({ a: 5, b: 10 }, (k, v) => "a"));
console.log(Obj.Sync.partition({ a: 5, b: 10 }, (k, v) => v > 6)); // {yes: {b:10}, no: {a:5}}
const alfa = Obj.Sync.partition({ a: 5, b: 10 }, (k, v) => v > 6, {
    yesField: "big",
    noField: "small",
});
console.log(alfa); // {big: {b:10}, small: {a:5}}
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
is(v, "string", "array") && v.includes("a");
const [c, n] = await Promise_all(Promise.resolve("Christian"), Promise.resolve("Nico")).then();
// Promise.all(4, 3); // Should error, but doesn't
// Promise_all(4, 3); // Should error
const failThrows = Raises("Fail")((raise) => async () => {
    raise("Fail");
    console.log("Unreachable");
    return 67;
});
const sleepThrows = Raises()((raise) => (n) => {
    return new Promise((resolve) => setTimeout(() => resolve(), n));
});
(async () => {
    await Start(sleepThrows, 1000);
    await Catch("Fail", () => {
        console.log("Caught fail 1");
    }).Try(async (start) => {
        await start(failThrows);
    });
    await Catch("Fail", () => {
        console.log("Caught fail 2");
    }).Try(async (start) => {
        /* no await */ start(failThrows); // This fails in normal Typescript
    });
})();
