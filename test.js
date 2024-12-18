import { durationString, Timer, valueType } from "./index.js";
const Stages = valueType()({
    baby: [0, 0],
    child: [1, 12],
    teen: [13, 19],
});
console.log(durationString(300432)); // 5.0m
const timer = new Timer();
setTimeout(() => timer.stop(), 11000);
