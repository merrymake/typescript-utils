/**
 * Specify type of elements without loosing field names.
 *
 * **DEFAULT TYPESCRIPT BEHAVIOR:**
 * ```
 * const Stages = {
 *   baby: [0, 0],
 *   child: [1, 12],
 *   teen: [13, 19],
 * };
 * ```
 * Is inferred to `{ baby: number[], child: number[], teen: number[] }`.
 *
 * Having the fields (GOOD), thinking they are arrays (BAD).
 *
 * **NAIVE SOLUTION**
 * ```
 * const Stages: { [group: string]: [number, number] } = {
 *   baby: [0, 0],
 *   child: [1, 12],
 *   teen: [13, 19],
 * };
 * ```
 * We no longer have the fields (BAD), but they are pairs (GOOD)
 *
 * **BETTER SOLUTION**
 * ```
 * const Stages = valueType<[number, number]>()({
 *   baby: [0, 0],
 *   child: [1, 12],
 *   teen: [13, 19],
 * });
 * ```
 * Which has the fields (GOOD), and they are pairs (GOOD)
 */
export const valueType = () => ((x) => x);
export const UnitType = {
    Duration: [
        [1, "ms"],
        [1000, "s"],
        [60, "m"],
        [60, "h"],
        [24, "d"],
    ],
    Memory: [
        [1, "bytes"],
        [1024, "kb"],
        [1024, "mb"],
        [1024, "gb"],
        [1024, "tb"],
    ],
};
/**
 * Humans have an easier time parsing fewer digits. This function converts a
 * quantity to the biggest unit smaller than the amount. It always displays
 * one digit, except for the base unit. You can specify which unit type to
 * use, and which unit the input amount is.
 *
 * Usage:
 * ```
 * stringWithUnit(1500, UnitType.Duration) // 1.5s
 * stringWithUnit(1024, UnitType.Memory, "kb") // 1.0mb
 * ```
 *
 * @param amount
 * @param unitType a list of (scale, unit) pairs
 * @param inputUnit (optional) the unit the amount is in
 * @returns "X.XU"
 */
export function stringWithUnit(amount, units, unit = units[0][1]) {
    let duration = amount;
    for (let i = units.findIndex((u) => u[1] === unit) + 1; duration >= units[i][0]; i++) {
        duration /= units[i][0];
        unit = units[i][1];
    }
    return unit !== units[0][1] ? duration.toFixed(1) + unit : duration + unit;
}
/**
 * Small console timer, for when you cannot move the cursor. It prints a .
 * every second, every 5 seconds it prints a !, and every 10 it prints the next
 * digit.
 *
 * Usage:
 * ```
 * const timer = new Timer();
 * // Do some slow work
 * timer.stop();
 * ```
 */
export class Timer {
    dots;
    constructor() {
        let seconds = 0;
        let deciseconds = 0;
        this.dots = setInterval(() => {
            seconds++;
            if (seconds % 10 === 0)
                process.stdout.write((deciseconds = (deciseconds + 1) % 10).toString());
            else if (seconds % 5 === 0)
                process.stdout.write("!");
            else
                process.stdout.write(".");
        }, 1000);
    }
    stop() {
        clearInterval(this.dots);
        process.stdout.write("\n");
    }
}
export function Promise_all(arr) {
    return Promise.all(arr);
}
export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
export function print(str, prefix = "", prefixLength = prefix.length) {
    process.stdout.write(prefix +
        str
            .trimEnd()
            .split("\n")
            .flatMap((x) => (x.match(new RegExp(`.{1,${process.stdout.getWindowSize()[0] - prefixLength}}( |$)|.{1,${process.stdout.getWindowSize()[0] - prefixLength}}`, "g")) || []).map((x) => x.trimEnd()))
            .join(`\n${prefix}`) +
        "\n");
}
export function typedKeys(o) {
    return Object.keys(o);
}
export function mapObject(o, f) {
    const res = {};
    typedKeys(o).forEach((k) => (res[k] = f(o[k])));
    return res;
}
export function partition(arr, f) {
    const yes = [];
    const no = [];
    arr.forEach((t) => (f(t) ? yes.push(t) : no.push(t)));
    return { yes, no };
}
export function toObject(keys, val) {
    const result = {};
    keys.forEach((k) => (result[k] = val(k)));
    return result;
}
