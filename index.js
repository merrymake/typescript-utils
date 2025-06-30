export const MILLISECONDS = 1;
// Typescript doesn't do constant folding, and it's "as const" is broken. This should work, but doesn't:
// export const SECONDS = (1000 * MILLISECONDS) as const;
// export const MINUTES = (60 * SECONDS) as const;
// export const HOURS = (60 * MINUTES) as const;
// export const DAYS = (24 * HOURS) as const;
// export const WEEKS = (7 * DAYS) as const;
export const SECONDS = 1_000;
export const MINUTES = 60_000;
export const HOURS = 3_600_000;
export const DAYS = 86_400_000;
export const WEEKS = 604_800_000;
export const SECONDS_IN_SECONDS = 1;
export const MINUTES_IN_SECONDS = 60;
export const HOURS_IN_SECONDS = 3_600;
export const DAYS_IN_SECONDS = 86_400;
export const WEEKS_IN_SECONDS = 604_800;
export const BYTES = 1;
export const KILOBYTES = 1_024;
export const MEGABYTES = 1_048_576;
export const GIGABYTES = 1_073_741_824;
export const TERABYTES = 1_099_511_627_776;
export const PETABYTES = 1_125_899_906_842_624;
// export const EXABYTES = 1_152_921_504_606_846_976;
/**
 * ```Typescript
 * Promise.all(4, 3); // Should error, but doesn't
 * Promise_all(4, 3); // Should error, and does
 * ```
 *
 * If you want to use the result of the promises:
 *
 * ```Typescript
 * const [a, b] = await Promise_all(aPromise, bPromise).then();
 * ```
 *
 * @param arr
 * @returns
 */
export function Promise_all(...arr) {
    return Promise.all(arr);
}
export function randomElement(arr, rng = Math.random) {
    return arr.length < 1 ? arr[0] : arr[~~(arr.length * rng())];
}
export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
export var Arr;
(function (Arr) {
    function random(arr) {
        const index = ~~(Math.random() * arr.length);
        return { value: arr[index], index };
    }
    Arr.random = random;
    let Sync;
    (function (Sync) {
        function findFirst(arr, f) {
            for (let i = 0; i < arr.length; i++) {
                if (f(arr[i], i))
                    return { value: arr[i], index: i };
            }
            return undefined;
        }
        Sync.findFirst = findFirst;
        function findLast(arr, f) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (f(arr[i], i))
                    return { value: arr[i], index: i };
            }
            return undefined;
        }
        Sync.findLast = findLast;
        function forEach(arr, f) {
            findFirst(arr, (e, i) => {
                f(e, i);
                return false;
            });
        }
        Sync.forEach = forEach;
        function map(arr, f, actions) {
            const result = new Array(arr.length);
            forEach(arr, (v, i) => {
                if (actions?.first !== undefined && i === 0)
                    result[i] = actions?.first(v);
                else if (actions?.last !== undefined && i === arr.length - 1)
                    result[i] = actions?.last(v);
                else if (actions?.ends !== undefined &&
                    (i === 0 || i === arr.length - 1))
                    result[i] = actions?.ends(v);
                else
                    result[i] = f(arr[i], i);
            });
            return result;
        }
        Sync.map = map;
        function flatMap(arr, f, actions) {
            const result = [];
            forEach(arr, (v, i) => {
                if (actions?.first !== undefined && i === 0)
                    result.push(...actions?.first(v));
                else if (actions?.last !== undefined && i === arr.length - 1)
                    result.push(...actions?.last(v));
                else if (actions?.ends !== undefined &&
                    (i === 0 || i === arr.length - 1))
                    result.push(...actions?.ends(v));
                else
                    result.push(...f(arr[i], i));
            });
            return result;
        }
        Sync.flatMap = flatMap;
        function partition(arr, f, opts) {
            const yf = opts?.yesField || "yes";
            const nf = opts?.noField || "no";
            const result = (() => {
                const result = {};
                result[yf] = [];
                result[nf] = [];
                return result;
            })();
            forEach(arr, (k, i) => f(k, i) === true ? result[yf].push(k) : result[nf].push(k));
            return result;
        }
        Sync.partition = partition;
        function filter(arr, f) {
            return partition(arr, f).yes;
        }
        Sync.filter = filter;
        function zip(as, bs, f, actions) {
            const len = actions?.aRest !== undefined && actions?.bRest !== undefined
                ? Math.max(as.length, bs.length)
                : actions?.aRest !== undefined
                    ? as.length
                    : actions?.bRest !== undefined
                        ? bs.length
                        : Math.min(as.length, bs.length);
            const result = new Array(len).fill(0);
            forEach(result, (_, i) => {
                result[i] =
                    i < as.length && i < bs.length
                        ? f(as[i], bs[i], i)
                        : i < as.length
                            ? actions.aRest(as[i], i)
                            : actions.bRest(bs[i], i);
            });
            return result;
        }
        Sync.zip = zip;
        function some(arr, f) {
            return findFirst(arr, f) !== undefined;
        }
        Sync.some = some;
        function all(arr, f) {
            return !some(arr, (t, i) => !f(t, i));
        }
        Sync.all = all;
        function reduce(arr, f, base) {
            let accumulator = base;
            forEach(arr, (v, i) => {
                accumulator = f(accumulator, arr[i], i);
            });
            return accumulator;
        }
        Sync.reduce = reduce;
        function maxBy(arr, f) {
            let res = undefined;
            forEach(arr, (element, index) => {
                const value = f(element);
                if (res === undefined || res.value < value) {
                    res = { element, index, value };
                }
            });
            return res;
        }
        Sync.maxBy = maxBy;
        function minBy(arr, f) {
            let res = undefined;
            forEach(arr, (element, index) => {
                const value = f(element);
                if (res === undefined || res.value > value) {
                    res = { element, index, value };
                }
            });
            return res;
        }
        Sync.minBy = minBy;
        Sync.max = (arr) => maxBy(arr, (x) => x);
        Sync.min = (arr) => minBy(arr, (x) => x);
        function toObject(keys, val) {
            const result = {};
            forEach(keys, (k) => (result[k] = val(k)));
            return result;
        }
        Sync.toObject = toObject;
    })(Sync = Arr.Sync || (Arr.Sync = {}));
    function Async(maxConcurrent = 1) {
        return {
            findAny,
            forEach,
            map,
            flatMap,
            partition,
            filter,
            zip,
            some,
            all,
            maxBy,
            minBy,
            toObject,
        };
        async function worker(tasks) {
            let t;
            while ((t = tasks.splice(0, 1)[0]) !== undefined) {
                const done = await t().then();
                if (done === true)
                    tasks.splice(0, tasks.length);
            }
        }
        async function findAny(arr, f) {
            let result = undefined;
            const tasks = arr.map((x, i) => async () => {
                if ((await f(x, i).then()) === true) {
                    result = { value: x, index: i };
                    return true;
                }
                else {
                    return false;
                }
            });
            await Promise_all(...new Array(maxConcurrent).fill(0).map((_) => worker(tasks))).then();
            return result;
        }
        async function forEach(arr, f) {
            await findAny(arr, async (a, i) => {
                await f(a, i);
                return false;
            });
        }
        async function map(arr, f, actions) {
            const result = new Array(arr.length);
            await forEach(arr, async (v, i) => {
                if (actions?.first !== undefined && i === 0)
                    result[i] = await actions.first(v);
                else if (actions?.last !== undefined && i === arr.length - 1)
                    result[i] = await actions.last(v);
                else if (actions?.ends !== undefined &&
                    (i === 0 || i === arr.length - 1))
                    result[i] = await actions.ends(v);
                else
                    result[i] = await f(arr[i], i);
            });
            return result;
        }
        async function flatMap(arr, f, actions) {
            const result = [];
            await forEach(arr, async (v, i) => {
                if (actions?.first !== undefined && i === 0)
                    result.push(...(await actions.first(v)));
                else if (actions?.last !== undefined && i === arr.length - 1)
                    result.push(...(await actions.last(v)));
                else if (actions?.ends !== undefined &&
                    (i === 0 || i === arr.length - 1))
                    result.push(...(await actions.ends(v)));
                else
                    result.push(...(await f(arr[i], i)));
            });
            return result;
        }
        async function partition(arr, f, opts) {
            const yf = opts?.yesField || "yes";
            const nf = opts?.noField || "no";
            const result = (() => {
                const result = {};
                result[yf] = [];
                result[nf] = [];
                return result;
            })();
            await forEach(arr, async (k, i) => (await f(k, i)) === true ? result[yf].push(k) : result[nf].push(k));
            return result;
        }
        async function filter(arr, f) {
            return (await partition(arr, f)).yes;
        }
        async function zip(as, bs, f, actions) {
            const len = actions?.aRest !== undefined && actions?.bRest !== undefined
                ? Math.max(as.length, bs.length)
                : actions?.aRest !== undefined
                    ? as.length
                    : actions?.bRest !== undefined
                        ? bs.length
                        : Math.min(as.length, bs.length);
            const result = new Array(len);
            await forEach(result, async (_, i) => {
                result[i] =
                    i < as.length && i < bs.length
                        ? await f(as[i], bs[i], i)
                        : i < as.length
                            ? await actions.aRest(as[i], i)
                            : await actions.bRest(bs[i], i);
            });
            return result;
        }
        async function some(arr, f) {
            return findAny(arr, f) !== undefined;
        }
        async function all(arr, f) {
            return !some(arr, async (t, i) => !(await f(t, i)));
        }
        async function maxBy(arr, f) {
            let res = undefined;
            forEach(arr, async (element, index) => {
                const value = await f(element);
                if (res === undefined || res.value < value) {
                    res = { element, index, value };
                }
            });
            return res;
        }
        async function minBy(arr, f) {
            let res = undefined;
            forEach(arr, async (element, index) => {
                const value = await f(element);
                if (res === undefined || res.value > value) {
                    res = { element, index, value };
                }
            });
            return res;
        }
        async function toObject(keys, val) {
            const result = {};
            await forEach(keys, async (k) => (result[k] = await val(k)));
            return result;
        }
    }
    Arr.Async = Async;
})(Arr || (Arr = {}));
class Undefined {
    static instance = new Undefined();
    constructor() { }
    dot(k) {
        return this;
    }
    as(...ts) {
        return undefined;
    }
}
class Possible {
    v;
    constructor(v) {
        this.v = v;
    }
    dot(k) {
        return Obj.hasKey(k, this.v)
            ? new Possible(this.v[k])
            : Undefined.instance;
    }
    as(...ts) {
        return is(this.v, ...ts) ? this.v : undefined;
    }
}
export var Is;
(function (Is) {
    class Check {
        ch;
        constructor(ch) {
            this.ch = ch;
        }
        in(k) {
            return new Check((o) => Obj.hasKey(k, o) && this.ch(o[k]));
        }
        check(o) {
            return this.ch(o);
        }
    }
    function a(...ts) {
        return new Check((o) => is(o, ...ts));
    }
    Is.a = a;
})(Is || (Is = {}));
export var Obj;
(function (Obj) {
    function keys(o) {
        return Object.keys(o);
    }
    Obj.keys = keys;
    function hasKey(k, obj) {
        return is(obj, "object") && k in obj;
    }
    Obj.hasKey = hasKey;
    function dot(obj, k) {
        return Obj.hasKey(k, obj) ? new Possible(obj[k]) : Undefined.instance;
    }
    Obj.dot = dot;
    function access(obj, k) {
        return Obj.hasKey(k, obj) ? obj : undefined;
    }
    Obj.access = access;
    function random(o) {
        const key = Arr.random(keys(o)).value;
        return { value: o[key], key };
    }
    Obj.random = random;
    let Sync;
    (function (Sync) {
        function findFirst(o, f) {
            return Arr.Sync.findFirst(keys(o), (k) => f(k, o[k]));
        }
        Sync.findFirst = findFirst;
        function findLast(o, f) {
            return Arr.Sync.findLast(keys(o), (k) => f(k, o[k]));
        }
        Sync.findLast = findLast;
        function forEach(o, f) {
            Arr.Sync.forEach(keys(o), (k) => f(k, o[k]));
        }
        Sync.forEach = forEach;
        function map(o, f) {
            const res = {};
            forEach(o, (k) => (res[k] = f(k, o[k])));
            return res;
        }
        Sync.map = map;
        function partition(o, f, opts) {
            const yf = opts?.yesField || "yes";
            const nf = opts?.noField || "no";
            const result = {};
            result[yf] = {};
            result[nf] = {};
            forEach(o, (k) => f(k, o[k]) === true ? (result[yf][k] = o[k]) : (result[nf][k] = o[k]));
            return result;
        }
        Sync.partition = partition;
        function filter(o, f) {
            return partition(o, f).yes;
        }
        Sync.filter = filter;
        function some(o, f) {
            return findFirst(o, f) !== undefined;
        }
        Sync.some = some;
        function all(o, f) {
            return !some(o, (t, i) => !f(t, i));
        }
        Sync.all = all;
        function toArray(o, f) {
            const result = [];
            forEach(o, (k, v) => result.push(f(k, v)));
            return result;
        }
        Sync.toArray = toArray;
    })(Sync = Obj.Sync || (Obj.Sync = {}));
    function Async(maxConcurrent = 1) {
        return {
            findAny,
            forEach,
            map,
            partition,
            filter,
            some,
            all,
            toArray,
        };
        function findAny(o, f) {
            return Arr.Async(maxConcurrent).findAny(keys(o), (k) => f(k, o[k]));
        }
        function forEach(o, f) {
            return Arr.Async(maxConcurrent).forEach(keys(o), (k) => f(k, o[k]));
        }
        async function map(o, f) {
            const res = {};
            await forEach(o, async (k) => (res[k] = await f(k, o[k])));
            return res;
        }
        async function partition(o, f, opts) {
            const yf = opts?.yesField || "yes";
            const nf = opts?.noField || "no";
            const result = {};
            result[yf] = {};
            result[nf] = {};
            await forEach(o, async (k) => (await f(k, o[k])) === true
                ? (result[yf][k] = o[k])
                : (result[nf][k] = o[k]));
            return result;
        }
        async function filter(o, f) {
            return (await partition(o, f)).yes;
        }
        async function some(o, f) {
            return (await findAny(o, f)) !== undefined;
        }
        async function all(o, f) {
            return !(await some(o, async (t, i) => !(await f(t, i))));
        }
        async function toArray(o, f) {
            const result = [];
            await forEach(o, async (k, v) => result.push(await f(k, v)));
            return result;
        }
    }
    Obj.Async = Async;
})(Obj || (Obj = {}));
var TypeCheckers;
(function (TypeCheckers) {
    function NaN(v) {
        return ((typeof v === "number" && isNaN(v)) ||
            (typeof v === "string" && isNaN(parseFloat(v))));
    }
    TypeCheckers.NaN = NaN;
    function number(v) {
        return typeof v === "number" && !isNaN(v);
    }
    TypeCheckers.number = number;
    function numeric(v) {
        return ((typeof v === "number" && !isNaN(v)) ||
            (typeof v === "string" && !isNaN(parseFloat(v))));
    }
    TypeCheckers.numeric = numeric;
    function finite(v) {
        return typeof v === "number" && isFinite(v);
    }
    TypeCheckers.finite = finite;
    function infinite(v) {
        return typeof v === "number" && !isFinite(v);
    }
    TypeCheckers.infinite = infinite;
    function stringNonEmpty(v) {
        return typeof v === "string" && v.length > 0;
    }
    TypeCheckers.stringNonEmpty = stringNonEmpty;
    function arrayNonEmpty(v) {
        return Array.isArray(v) && v.length > 0;
    }
    TypeCheckers.arrayNonEmpty = arrayNonEmpty;
    function truthy(v) {
        return !!v;
    }
    TypeCheckers.truthy = truthy;
    function falsy(v) {
        return !v;
    }
    TypeCheckers.falsy = falsy;
    function object(v) {
        return v !== null && typeof v === "object";
    }
    TypeCheckers.object = object;
})(TypeCheckers || (TypeCheckers = {}));
const checkers = {
    array: (v) => Array.isArray(v),
    arrayNonEmpty: TypeCheckers.arrayNonEmpty,
    NaN: TypeCheckers.NaN,
    number: TypeCheckers.number,
    numeric: TypeCheckers.numeric,
    finite: TypeCheckers.finite,
    infinite: TypeCheckers.infinite,
    string: (v) => typeof v === "string",
    stringNonEmpty: TypeCheckers.stringNonEmpty,
    null: (v) => v === null,
    undefined: (v) => v === undefined,
    truthy: TypeCheckers.truthy,
    falsy: TypeCheckers.falsy,
    boolean: (v) => typeof v === "boolean",
    true: (v) => v === true,
    false: (v) => v === false,
    object: TypeCheckers.object,
    buffer: (v) => Buffer.isBuffer(v),
};
export function is(v, ...ts) {
    return Arr.Sync.some(ts, (k) => checkers[k](v));
}
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
export const tuple = (...x) => x;
export const UnitType = valueType()({
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
});
export var Str;
(function (Str) {
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
    function withUnit(amount, units, unit = units[0][1]) {
        let duration = amount;
        for (let i = units.findIndex((u) => u[1] === unit) + 1; duration >= units[i][0]; i++) {
            duration /= units[i][0];
            unit = units[i][1];
        }
        return unit !== units[0][1] ? duration.toFixed(1) + unit : duration + unit;
    }
    Str.withUnit = withUnit;
    /**
     * Usage:
     * ```
     * const spinner = Spinner.start();
     * // Do some slow work
     * const duration = spinner.stop();
     * ```
     */
    class Spinner {
        steps;
        /**
         * A lot of spinners (most are from https://www.npmjs.com/package/cli-spinners)
         */
        static format = {
            dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
            dots2: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
            dots3: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
            dots4: [
                "⠄",
                "⠆",
                "⠇",
                "⠋",
                "⠙",
                "⠸",
                "⠰",
                "⠠",
                "⠰",
                "⠸",
                "⠙",
                "⠋",
                "⠇",
                "⠆",
            ],
            dots5: [
                "⠋",
                "⠙",
                "⠚",
                "⠒",
                "⠂",
                "⠂",
                "⠒",
                "⠲",
                "⠴",
                "⠦",
                "⠖",
                "⠒",
                "⠐",
                "⠐",
                "⠒",
                "⠓",
                "⠋",
            ],
            dots6: [
                "⠁",
                "⠉",
                "⠙",
                "⠚",
                "⠒",
                "⠂",
                "⠂",
                "⠒",
                "⠲",
                "⠴",
                "⠤",
                "⠄",
                "⠄",
                "⠤",
                "⠴",
                "⠲",
                "⠒",
                "⠂",
                "⠂",
                "⠒",
                "⠚",
                "⠙",
                "⠉",
                "⠁",
            ],
            dots7: [
                "⠈",
                "⠉",
                "⠋",
                "⠓",
                "⠒",
                "⠐",
                "⠐",
                "⠒",
                "⠖",
                "⠦",
                "⠤",
                "⠠",
                "⠠",
                "⠤",
                "⠦",
                "⠖",
                "⠒",
                "⠐",
                "⠐",
                "⠒",
                "⠓",
                "⠋",
                "⠉",
                "⠈",
            ],
            dots8: [
                "⠁",
                "⠁",
                "⠉",
                "⠙",
                "⠚",
                "⠒",
                "⠂",
                "⠂",
                "⠒",
                "⠲",
                "⠴",
                "⠤",
                "⠄",
                "⠄",
                "⠤",
                "⠠",
                "⠠",
                "⠤",
                "⠦",
                "⠖",
                "⠒",
                "⠐",
                "⠐",
                "⠒",
                "⠓",
                "⠋",
                "⠉",
                "⠈",
                "⠈",
            ],
            dots9: ["⢹", "⢺", "⢼", "⣸", "⣇", "⡧", "⡗", "⡏"],
            dots10: ["⢄", "⢂", "⢁", "⡁", "⡈", "⡐", "⡠"],
            dots11: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
            dots12: [
                "⢀⠀",
                "⡀⠀",
                "⠄⠀",
                "⢂⠀",
                "⡂⠀",
                "⠅⠀",
                "⢃⠀",
                "⡃⠀",
                "⠍⠀",
                "⢋⠀",
                "⡋⠀",
                "⠍⠁",
                "⢋⠁",
                "⡋⠁",
                "⠍⠉",
                "⠋⠉",
                "⠋⠉",
                "⠉⠙",
                "⠉⠙",
                "⠉⠩",
                "⠈⢙",
                "⠈⡙",
                "⢈⠩",
                "⡀⢙",
                "⠄⡙",
                "⢂⠩",
                "⡂⢘",
                "⠅⡘",
                "⢃⠨",
                "⡃⢐",
                "⠍⡐",
                "⢋⠠",
                "⡋⢀",
                "⠍⡁",
                "⢋⠁",
                "⡋⠁",
                "⠍⠉",
                "⠋⠉",
                "⠋⠉",
                "⠉⠙",
                "⠉⠙",
                "⠉⠩",
                "⠈⢙",
                "⠈⡙",
                "⠈⠩",
                "⠀⢙",
                "⠀⡙",
                "⠀⠩",
                "⠀⢘",
                "⠀⡘",
                "⠀⠨",
                "⠀⢐",
                "⠀⡐",
                "⠀⠠",
                "⠀⢀",
                "⠀⡀",
            ],
            dots13: ["⣼", "⣹", "⢻", "⠿", "⡟", "⣏", "⣧", "⣶"],
            dots14: [
                "⠉⠉",
                "⠈⠙",
                "⠀⠹",
                "⠀⢸",
                "⠀⣰",
                "⢀⣠",
                "⣀⣀",
                "⣄⡀",
                "⣆⠀",
                "⡇⠀",
                "⠏⠀",
                "⠋⠁",
            ],
            dots8Bit: [
                "⠀",
                "⠁",
                "⠂",
                "⠃",
                "⠄",
                "⠅",
                "⠆",
                "⠇",
                "⡀",
                "⡁",
                "⡂",
                "⡃",
                "⡄",
                "⡅",
                "⡆",
                "⡇",
                "⠈",
                "⠉",
                "⠊",
                "⠋",
                "⠌",
                "⠍",
                "⠎",
                "⠏",
                "⡈",
                "⡉",
                "⡊",
                "⡋",
                "⡌",
                "⡍",
                "⡎",
                "⡏",
                "⠐",
                "⠑",
                "⠒",
                "⠓",
                "⠔",
                "⠕",
                "⠖",
                "⠗",
                "⡐",
                "⡑",
                "⡒",
                "⡓",
                "⡔",
                "⡕",
                "⡖",
                "⡗",
                "⠘",
                "⠙",
                "⠚",
                "⠛",
                "⠜",
                "⠝",
                "⠞",
                "⠟",
                "⡘",
                "⡙",
                "⡚",
                "⡛",
                "⡜",
                "⡝",
                "⡞",
                "⡟",
                "⠠",
                "⠡",
                "⠢",
                "⠣",
                "⠤",
                "⠥",
                "⠦",
                "⠧",
                "⡠",
                "⡡",
                "⡢",
                "⡣",
                "⡤",
                "⡥",
                "⡦",
                "⡧",
                "⠨",
                "⠩",
                "⠪",
                "⠫",
                "⠬",
                "⠭",
                "⠮",
                "⠯",
                "⡨",
                "⡩",
                "⡪",
                "⡫",
                "⡬",
                "⡭",
                "⡮",
                "⡯",
                "⠰",
                "⠱",
                "⠲",
                "⠳",
                "⠴",
                "⠵",
                "⠶",
                "⠷",
                "⡰",
                "⡱",
                "⡲",
                "⡳",
                "⡴",
                "⡵",
                "⡶",
                "⡷",
                "⠸",
                "⠹",
                "⠺",
                "⠻",
                "⠼",
                "⠽",
                "⠾",
                "⠿",
                "⡸",
                "⡹",
                "⡺",
                "⡻",
                "⡼",
                "⡽",
                "⡾",
                "⡿",
                "⢀",
                "⢁",
                "⢂",
                "⢃",
                "⢄",
                "⢅",
                "⢆",
                "⢇",
                "⣀",
                "⣁",
                "⣂",
                "⣃",
                "⣄",
                "⣅",
                "⣆",
                "⣇",
                "⢈",
                "⢉",
                "⢊",
                "⢋",
                "⢌",
                "⢍",
                "⢎",
                "⢏",
                "⣈",
                "⣉",
                "⣊",
                "⣋",
                "⣌",
                "⣍",
                "⣎",
                "⣏",
                "⢐",
                "⢑",
                "⢒",
                "⢓",
                "⢔",
                "⢕",
                "⢖",
                "⢗",
                "⣐",
                "⣑",
                "⣒",
                "⣓",
                "⣔",
                "⣕",
                "⣖",
                "⣗",
                "⢘",
                "⢙",
                "⢚",
                "⢛",
                "⢜",
                "⢝",
                "⢞",
                "⢟",
                "⣘",
                "⣙",
                "⣚",
                "⣛",
                "⣜",
                "⣝",
                "⣞",
                "⣟",
                "⢠",
                "⢡",
                "⢢",
                "⢣",
                "⢤",
                "⢥",
                "⢦",
                "⢧",
                "⣠",
                "⣡",
                "⣢",
                "⣣",
                "⣤",
                "⣥",
                "⣦",
                "⣧",
                "⢨",
                "⢩",
                "⢪",
                "⢫",
                "⢬",
                "⢭",
                "⢮",
                "⢯",
                "⣨",
                "⣩",
                "⣪",
                "⣫",
                "⣬",
                "⣭",
                "⣮",
                "⣯",
                "⢰",
                "⢱",
                "⢲",
                "⢳",
                "⢴",
                "⢵",
                "⢶",
                "⢷",
                "⣰",
                "⣱",
                "⣲",
                "⣳",
                "⣴",
                "⣵",
                "⣶",
                "⣷",
                "⢸",
                "⢹",
                "⢺",
                "⢻",
                "⢼",
                "⢽",
                "⢾",
                "⢿",
                "⣸",
                "⣹",
                "⣺",
                "⣻",
                "⣼",
                "⣽",
                "⣾",
                "⣿",
            ],
            dotsCircle: ["⢎ ", "⠎⠁", "⠊⠑", "⠈⠱", " ⡱", "⢀⡰", "⢄⡠", "⢆⡀"],
            dotsCircle2: ["⢎⡰", "⢎⡡", "⢎⡑", "⢎⠱", "⠎⡱", "⢊⡱", "⢌⡱", "⢆⡱"],
            sand: [
                "⠁",
                "⠂",
                "⠄",
                "⡀",
                "⡈",
                "⡐",
                "⡠",
                "⣀",
                "⣁",
                "⣂",
                "⣄",
                "⣌",
                "⣔",
                "⣤",
                "⣥",
                "⣦",
                "⣮",
                "⣶",
                "⣷",
                "⣿",
                "⡿",
                "⠿",
                "⢟",
                "⠟",
                "⡛",
                "⠛",
                "⠫",
                "⢋",
                "⠋",
                "⠍",
                "⡉",
                "⠉",
                "⠑",
                "⠡",
                "⢁",
            ],
            line: ["-", "\\", "|", "/"],
            line2: ["⠂", "-", "–", "—", "–", "-"],
            pipe: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"],
            simpleDots: [".  ", ".. ", "...", "   "],
            simpleDotsScrolling: [".  ", ".. ", "...", " ..", "  .", "   "],
            star: ["✶", "✸", "✹", "✺", "✹", "✷"],
            star2: ["+", "x", "*"],
            flip: ["_", "_", "_", "-", "`", "`", "'", "´", "-", "_", "_", "_"],
            hamburger: ["☱", "☲", "☴"],
            growVertical: ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"],
            growHorizontal: [
                "▏",
                "▎",
                "▍",
                "▌",
                "▋",
                "▊",
                "▉",
                "▊",
                "▋",
                "▌",
                "▍",
                "▎",
            ],
            balloon: [" ", ".", "o", "O", "@", "*", " "],
            balloon2: [".", "o", "O", "°", "O", "o", "."],
            noise: ["▓", "▒", "░"],
            bounce: ["⠁", "⠂", "⠄", "⠂"],
            bounce2: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
            boxBounce: ["▖", "▘", "▝", "▗"],
            boxBounce2: ["▌", "▀", "▐", "▄"],
            triangle: ["◢", "◣", "◤", "◥"],
            binary: [
                "010010",
                "001100",
                "100101",
                "111010",
                "111101",
                "010111",
                "101011",
                "111000",
                "110011",
                "110101",
            ],
            arc: ["◜", "◠", "◝", "◞", "◡", "◟"],
            circle: ["◡", "⊙", "◠"],
            squareCorners: ["◰", "◳", "◲", "◱"],
            circleQuarters: ["◴", "◷", "◶", "◵"],
            circleHalves: ["◐", "◓", "◑", "◒"],
            squish: ["╫", "╪"],
            toggle: ["⊶", "⊷"],
            toggle2: ["▫", "▪"],
            toggle3: ["□", "■"],
            toggle4: ["■", "□", "▪", "▫"],
            toggle5: ["▮", "▯"],
            toggle7: ["⦾", "⦿"],
            toggle8: ["◍", "◌"],
            toggle9: ["◉", "◎"],
            toggle11: ["⧇", "⧆"],
            toggle12: ["☗", "☖"],
            toggle13: ["=", "*", "-"],
            arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
            arrow2: ["⬆️ ", "↗️ ", "➡️ ", "↘️ ", "⬇️ ", "↙️ ", "⬅️ ", "↖️ "],
            arrow3: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
            bouncingBar: [
                "[    ]",
                "[=   ]",
                "[==  ]",
                "[=== ]",
                "[====]",
                "[ ===]",
                "[  ==]",
                "[   =]",
                "[    ]",
                "[   =]",
                "[  ==]",
                "[ ===]",
                "[====]",
                "[=== ]",
                "[==  ]",
                "[=   ]",
            ],
            bouncingBall: [
                "( ●    )",
                "(  ●   )",
                "(   ●  )",
                "(    ● )",
                "(     ●)",
                "(    ● )",
                "(   ●  )",
                "(  ●   )",
                "( ●    )",
                "(●     )",
            ],
            smiley: ["😄 ", "😝 "],
            monkey: ["🙈 ", "🙈 ", "🙉 ", "🙊 "],
            hearts: ["💛 ", "💙 ", "💜 ", "💚 ", "❤️ "],
            clock: [
                "🕛 ",
                "🕐 ",
                "🕑 ",
                "🕒 ",
                "🕓 ",
                "🕔 ",
                "🕕 ",
                "🕖 ",
                "🕗 ",
                "🕘 ",
                "🕙 ",
                "🕚 ",
            ],
            earth: ["🌍 ", "🌎 ", "🌏 "],
            material: [
                "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "███████▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "████████▁▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "██████████▁▁▁▁▁▁▁▁▁▁",
                "███████████▁▁▁▁▁▁▁▁▁",
                "█████████████▁▁▁▁▁▁▁",
                "██████████████▁▁▁▁▁▁",
                "██████████████▁▁▁▁▁▁",
                "▁██████████████▁▁▁▁▁",
                "▁██████████████▁▁▁▁▁",
                "▁██████████████▁▁▁▁▁",
                "▁▁██████████████▁▁▁▁",
                "▁▁▁██████████████▁▁▁",
                "▁▁▁▁█████████████▁▁▁",
                "▁▁▁▁██████████████▁▁",
                "▁▁▁▁██████████████▁▁",
                "▁▁▁▁▁██████████████▁",
                "▁▁▁▁▁██████████████▁",
                "▁▁▁▁▁██████████████▁",
                "▁▁▁▁▁▁██████████████",
                "▁▁▁▁▁▁██████████████",
                "▁▁▁▁▁▁▁█████████████",
                "▁▁▁▁▁▁▁█████████████",
                "▁▁▁▁▁▁▁▁████████████",
                "▁▁▁▁▁▁▁▁████████████",
                "▁▁▁▁▁▁▁▁▁███████████",
                "▁▁▁▁▁▁▁▁▁███████████",
                "▁▁▁▁▁▁▁▁▁▁██████████",
                "▁▁▁▁▁▁▁▁▁▁██████████",
                "▁▁▁▁▁▁▁▁▁▁▁▁████████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
                "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
                "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
                "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
                "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
                "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
                "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "██████▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "████████▁▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "█████████▁▁▁▁▁▁▁▁▁▁▁",
                "███████████▁▁▁▁▁▁▁▁▁",
                "████████████▁▁▁▁▁▁▁▁",
                "████████████▁▁▁▁▁▁▁▁",
                "██████████████▁▁▁▁▁▁",
                "██████████████▁▁▁▁▁▁",
                "▁██████████████▁▁▁▁▁",
                "▁██████████████▁▁▁▁▁",
                "▁▁▁█████████████▁▁▁▁",
                "▁▁▁▁▁████████████▁▁▁",
                "▁▁▁▁▁████████████▁▁▁",
                "▁▁▁▁▁▁███████████▁▁▁",
                "▁▁▁▁▁▁▁▁█████████▁▁▁",
                "▁▁▁▁▁▁▁▁█████████▁▁▁",
                "▁▁▁▁▁▁▁▁▁█████████▁▁",
                "▁▁▁▁▁▁▁▁▁█████████▁▁",
                "▁▁▁▁▁▁▁▁▁▁█████████▁",
                "▁▁▁▁▁▁▁▁▁▁▁████████▁",
                "▁▁▁▁▁▁▁▁▁▁▁████████▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
                "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            ],
            moon: ["🌑 ", "🌒 ", "🌓 ", "🌔 ", "🌕 ", "🌖 ", "🌗 ", "🌘 "],
            runner: ["🚶 ", "🏃 "],
            pong: [
                "▐⠂       ▌",
                "▐⠈       ▌",
                "▐ ⠂      ▌",
                "▐ ⠠      ▌",
                "▐  ⡀     ▌",
                "▐  ⠠     ▌",
                "▐   ⠂    ▌",
                "▐   ⠈    ▌",
                "▐    ⠂   ▌",
                "▐    ⠠   ▌",
                "▐     ⡀  ▌",
                "▐     ⠠  ▌",
                "▐      ⠂ ▌",
                "▐      ⠈ ▌",
                "▐       ⠂▌",
                "▐       ⠠▌",
                "▐       ⡀▌",
                "▐      ⠠ ▌",
                "▐      ⠂ ▌",
                "▐     ⠈  ▌",
                "▐     ⠂  ▌",
                "▐    ⠠   ▌",
                "▐    ⡀   ▌",
                "▐   ⠠    ▌",
                "▐   ⠂    ▌",
                "▐  ⠈     ▌",
                "▐  ⠂     ▌",
                "▐ ⠠      ▌",
                "▐ ⡀      ▌",
                "▐⠠       ▌",
            ],
            shark: [
                "▐|\\____________▌",
                "▐_|\\___________▌",
                "▐__|\\__________▌",
                "▐___|\\_________▌",
                "▐____|\\________▌",
                "▐_____|\\_______▌",
                "▐______|\\______▌",
                "▐_______|\\_____▌",
                "▐________|\\____▌",
                "▐_________|\\___▌",
                "▐__________|\\__▌",
                "▐___________|\\_▌",
                "▐____________|\\▌",
                "▐____________/|▌",
                "▐___________/|_▌",
                "▐__________/|__▌",
                "▐_________/|___▌",
                "▐________/|____▌",
                "▐_______/|_____▌",
                "▐______/|______▌",
                "▐_____/|_______▌",
                "▐____/|________▌",
                "▐___/|_________▌",
                "▐__/|__________▌",
                "▐_/|___________▌",
                "▐/|____________▌",
            ],
            dqpb: ["d", "q", "p", "b"],
            christmas: ["🌲", "🎄"],
            grenade: [
                "،  ",
                "′  ",
                " ´ ",
                " ‾ ",
                "  ⸌",
                "  ⸊",
                "  |",
                "  ⁎",
                "  ⁕",
                " ෴ ",
                "  ⁓",
                "   ",
                "   ",
                "   ",
            ],
            point: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"],
            layer: ["-", "=", "≡"],
            betaWave: [
                "ρββββββ",
                "βρβββββ",
                "ββρββββ",
                "βββρβββ",
                "ββββρββ",
                "βββββρβ",
                "ββββββρ",
            ],
            fingerDance: ["🤘 ", "🤟 ", "🖖 ", "✋ ", "🤚 ", "👆 "],
            mindblown: [
                "😐 ",
                "😐 ",
                "😮 ",
                "😮 ",
                "😦 ",
                "😦 ",
                "😧 ",
                "😧 ",
                "🤯 ",
                "💥 ",
                "✨ ",
                "\u3000 ",
                "\u3000 ",
                "\u3000 ",
            ],
            speaker: ["🔈 ", "🔉 ", "🔊 ", "🔉 "],
            orangePulse: ["🔸 ", "🔶 ", "🟠 ", "🟠 ", "🔶 "],
            bluePulse: ["🔹 ", "🔷 ", "🔵 ", "🔵 ", "🔷 "],
            orangeBluePulse: [
                "🔸 ",
                "🔶 ",
                "🟠 ",
                "🟠 ",
                "🔶 ",
                "🔹 ",
                "🔷 ",
                "🔵 ",
                "🔵 ",
                "🔷 ",
            ],
            timeTravel: [
                "🕛 ",
                "🕚 ",
                "🕙 ",
                "🕘 ",
                "🕗 ",
                "🕖 ",
                "🕕 ",
                "🕔 ",
                "🕓 ",
                "🕒 ",
                "🕑 ",
                "🕐 ",
            ],
            aesthetic: [
                "▱▱▱▱▱▱▱",
                "▰▱▱▱▱▱▱",
                "▰▰▱▱▱▱▱",
                "▰▰▰▱▱▱▱",
                "▰▰▰▰▱▱▱",
                "▰▰▰▰▰▱▱",
                "▰▰▰▰▰▰▱",
                "▰▰▰▰▰▰▰",
            ],
            dwarfFortress: [
                " ██████£££  ",
                "☺██████£££  ",
                "☺██████£££  ",
                "☺▓█████£££  ",
                "☺▓█████£££  ",
                "☺▒█████£££  ",
                "☺▒█████£££  ",
                "☺░█████£££  ",
                "☺░█████£££  ",
                "☺ █████£££  ",
                " ☺█████£££  ",
                " ☺█████£££  ",
                " ☺▓████£££  ",
                " ☺▓████£££  ",
                " ☺▒████£££  ",
                " ☺▒████£££  ",
                " ☺░████£££  ",
                " ☺░████£££  ",
                " ☺ ████£££  ",
                "  ☺████£££  ",
                "  ☺████£££  ",
                "  ☺▓███£££  ",
                "  ☺▓███£££  ",
                "  ☺▒███£££  ",
                "  ☺▒███£££  ",
                "  ☺░███£££  ",
                "  ☺░███£££  ",
                "  ☺ ███£££  ",
                "   ☺███£££  ",
                "   ☺███£££  ",
                "   ☺▓██£££  ",
                "   ☺▓██£££  ",
                "   ☺▒██£££  ",
                "   ☺▒██£££  ",
                "   ☺░██£££  ",
                "   ☺░██£££  ",
                "   ☺ ██£££  ",
                "    ☺██£££  ",
                "    ☺██£££  ",
                "    ☺▓█£££  ",
                "    ☺▓█£££  ",
                "    ☺▒█£££  ",
                "    ☺▒█£££  ",
                "    ☺░█£££  ",
                "    ☺░█£££  ",
                "    ☺ █£££  ",
                "     ☺█£££  ",
                "     ☺█£££  ",
                "     ☺▓£££  ",
                "     ☺▓£££  ",
                "     ☺▒£££  ",
                "     ☺▒£££  ",
                "     ☺░£££  ",
                "     ☺░£££  ",
                "     ☺ £££  ",
                "      ☺£££  ",
                "      ☺£££  ",
                "      ☺▓££  ",
                "      ☺▓££  ",
                "      ☺▒££  ",
                "      ☺▒££  ",
                "      ☺░££  ",
                "      ☺░££  ",
                "      ☺ ££  ",
                "       ☺££  ",
                "       ☺££  ",
                "       ☺▓£  ",
                "       ☺▓£  ",
                "       ☺▒£  ",
                "       ☺▒£  ",
                "       ☺░£  ",
                "       ☺░£  ",
                "       ☺ £  ",
                "        ☺£  ",
                "        ☺£  ",
                "        ☺▓  ",
                "        ☺▓  ",
                "        ☺▒  ",
                "        ☺▒  ",
                "        ☺░  ",
                "        ☺░  ",
                "        ☺   ",
                "        ☺  &",
                "        ☺ ☼&",
                "       ☺ ☼ &",
                "       ☺☼  &",
                "      ☺☼  & ",
                "      ‼   & ",
                "     ☺   &  ",
                "    ‼    &  ",
                "   ☺    &   ",
                "  ‼     &   ",
                " ☺     &    ",
                "‼      &    ",
                "      &     ",
                "      &     ",
                "     &   ░  ",
                "     &   ▒  ",
                "    &    ▓  ",
                "    &    £  ",
                "   &    ░£  ",
                "   &    ▒£  ",
                "  &     ▓£  ",
                "  &     ££  ",
                " &     ░££  ",
                " &     ▒££  ",
                "&      ▓££  ",
                "&      £££  ",
                "      ░£££  ",
                "      ▒£££  ",
                "      ▓£££  ",
                "      █£££  ",
                "     ░█£££  ",
                "     ▒█£££  ",
                "     ▓█£££  ",
                "     ██£££  ",
                "    ░██£££  ",
                "    ▒██£££  ",
                "    ▓██£££  ",
                "    ███£££  ",
                "   ░███£££  ",
                "   ▒███£££  ",
                "   ▓███£££  ",
                "   ████£££  ",
                "  ░████£££  ",
                "  ▒████£££  ",
                "  ▓████£££  ",
                "  █████£££  ",
                " ░█████£££  ",
                " ▒█████£££  ",
                " ▓█████£££  ",
                " ██████£££  ",
                " ██████£££  ",
            ],
        };
        static start(steps = Obj.random(Spinner.format).value) {
            if (typeof process.stdout.getWindowSize !== "function")
                throw "Not a TTY console, please use 'Timer.format.NoTTY'";
            return new Spinner(steps);
        }
        interval;
        before;
        spinnerIndex = -1;
        constructor(steps) {
            this.steps = steps;
            this.before = Date.now();
            process.stdout.write(Str.HIDE_CURSOR);
            const tick = () => {
                this.spinnerIndex = (this.spinnerIndex + 1) % this.steps.length;
                process.stdout.write(this.steps[this.spinnerIndex]);
                process.stdout.moveCursor(-this.steps[this.spinnerIndex].length, 0);
            };
            this.interval = setInterval(tick, 125);
            tick();
        }
        stop() {
            clearInterval(this.interval);
            process.stdout.write(" ".repeat(this.steps[this.spinnerIndex].length));
            process.stdout.moveCursor(-this.steps[this.spinnerIndex].length, 0);
            process.stdout.write(Str.SHOW_CURSOR);
            return Date.now() - this.before;
        }
    }
    Str.Spinner = Spinner;
    Str.HIDE_CURSOR = "\u001B[?25l";
    Str.SHOW_CURSOR = "\u001B[?25h";
    let Timer;
    (function (Timer_1) {
        /**
         * Small console timer, for when you cannot move the cursor. It prints a .
         * every second, every 5 seconds it prints a !, and every 10 it prints the next
         * digit.
         */
        class NoTTY {
            start() { }
            tickSec(secs) {
                if (secs % 10 === 0)
                    process.stdout.write(((secs / 10) % 10).toString());
                else if (secs % 5 === 0)
                    process.stdout.write("!");
                else
                    process.stdout.write(".");
            }
            end() {
                process.stdout.write("\n");
            }
            requiresTTY() {
                return false;
            }
        }
        Timer_1.NoTTY = NoTTY;
        class Seconds {
            suffix;
            lastLength = 0;
            constructor(suffix = "") {
                this.suffix = suffix;
            }
            start() {
                process.stdout.write(Str.HIDE_CURSOR);
            }
            tickSec(secs) {
                const out = secs.toString() + this.suffix;
                if (this.lastLength > 0)
                    process.stdout.moveCursor(-this.lastLength, 0);
                this.lastLength = out.length;
                process.stdout.write(out);
            }
            end() {
                if (this.lastLength > 0)
                    process.stdout.moveCursor(this.lastLength, 0);
                process.stdout.write(Str.SHOW_CURSOR);
            }
            requiresTTY() {
                return true;
            }
        }
        Timer_1.Seconds = Seconds;
        class Colon {
            suffix;
            lastLength = 0;
            constructor(suffix = "") {
                this.suffix = suffix;
            }
            start() {
                process.stdout.write(Str.HIDE_CURSOR);
            }
            tickSec(secs) {
                const out = (~~(secs / 60)).toString() +
                    ":" +
                    secs.toString().padStart(2, "0") +
                    this.suffix;
                if (this.lastLength > 0)
                    process.stdout.moveCursor(-this.lastLength, 0);
                this.lastLength = out.length;
                process.stdout.write(out);
            }
            end() {
                if (this.lastLength > 0)
                    process.stdout.moveCursor(this.lastLength, 0);
                process.stdout.write(Str.SHOW_CURSOR);
            }
            requiresTTY() {
                return true;
            }
        }
        Timer_1.Colon = Colon;
        /**
         * Usage:
         * ```
         * const timer = Timer.start();
         * // Do some slow work
         * const duration = timer.stop();
         * ```
         */
        class Timer {
            format;
            interval;
            before;
            constructor(format) {
                this.format = format;
                this.before = Date.now();
                format.start();
                format.tickSec(0);
                this.interval = setInterval(() => {
                    format.tickSec(Math.round((Date.now() - this.before) / 1000));
                }, 1000);
            }
            stop() {
                clearInterval(this.interval);
                this.format.tickSec(Math.round((Date.now() - this.before) / 1000));
                this.format.end();
                return Date.now() - this.before;
            }
        }
        function start(format = new NoTTY()) {
            if (format.requiresTTY() === true &&
                typeof process.stdout.getWindowSize !== "function")
                throw "Not a TTY console, please use 'Timer.format.NoTTY'";
            return new Timer(format);
        }
        Timer_1.start = start;
    })(Timer = Str.Timer || (Str.Timer = {}));
    class InvisibleHand {
        static lastInvisibleChars;
        static lastInvisibleHand;
        static make(invisibleChars) {
            if (InvisibleHand.lastInvisibleChars === invisibleChars)
                return InvisibleHand.lastInvisibleHand;
            InvisibleHand.lastInvisibleChars = invisibleChars;
            return (InvisibleHand.lastInvisibleHand = new InvisibleHand(invisibleChars));
        }
        regex;
        constructor(invisibleChars) {
            this.regex = new RegExp("(" +
                [...invisibleChars]
                    .map((x) => x.replace(/\[/, "\\[").replace(/\?/, "\\?"))
                    .join("|") +
                ")", "gi");
        }
        remove(str) {
            return str.replace(this.regex, "");
        }
        length(str) {
            return this.remove(str).length;
        }
        match(str) {
            return str.match(this.regex);
        }
        matchAll(str) {
            return str.matchAll(this.regex);
        }
    }
    Str.FG_BLACK = "\x1b[30m";
    Str.FG_RED = "\x1b[31m";
    Str.FG_GREEN = "\x1b[32m";
    Str.FG_YELLOW = "\x1b[33m";
    Str.FG_BLUE = "\x1b[34m";
    Str.FG_PURPLE = "\x1b[35m";
    Str.FG_CYAN = "\x1b[36m";
    Str.FG_WHITE = "\x1b[37m";
    Str.FG_GRAY = "\x1b[90m";
    Str.FG_DEFAULT = "\x1b[0m";
    Str.BG_BLACK = "\x1b[40m";
    Str.BG_RED = "\x1b[41m";
    Str.BG_GREEN = "\x1b[42m";
    Str.BG_YELLOW = "\x1b[43m";
    Str.BG_BLUE = "\x1b[44m";
    Str.BG_PURPLE = "\x1b[45m";
    Str.BG_CYAN = "\x1b[46m";
    Str.BG_WHITE = "\x1b[47m";
    Str.BG_GRAY = "\x1b[100m";
    Str.BG_DEFAULT = "\x1b[49m";
    Str.STRIKE = "\x1b[9m";
    Str.NO_STRIKE = "\x1b[29m";
    Str.UP = "\x1b[A";
    Str.DOWN = "\x1b[B";
    Str.LEFT = "\x1b[D";
    Str.RIGHT = "\x1b[C";
    const DEFAULT_INVISIBLE = new Set([
        Str.FG_DEFAULT,
        Str.FG_BLACK,
        Str.FG_RED,
        Str.FG_GREEN,
        Str.FG_YELLOW,
        Str.FG_BLUE,
        Str.FG_PURPLE,
        Str.FG_CYAN,
        Str.FG_WHITE,
        Str.FG_GRAY,
        Str.BG_BLACK,
        Str.BG_RED,
        Str.BG_GREEN,
        Str.BG_YELLOW,
        Str.BG_BLUE,
        Str.BG_PURPLE,
        Str.BG_CYAN,
        Str.BG_WHITE,
        Str.BG_GRAY,
        Str.STRIKE,
        Str.NO_STRIKE,
        Str.SHOW_CURSOR,
        Str.HIDE_CURSOR,
        Str.UP,
        Str.LEFT,
        Str.RIGHT,
        Str.DOWN,
    ]);
    function lengthWithoutInvisible(str, invisibleChars = DEFAULT_INVISIBLE) {
        return InvisibleHand.make(invisibleChars).length(str);
    }
    Str.lengthWithoutInvisible = lengthWithoutInvisible;
    function withoutInvisible(str, invisibleChars = DEFAULT_INVISIBLE) {
        return InvisibleHand.make(invisibleChars).remove(str);
    }
    Str.withoutInvisible = withoutInvisible;
    const invisible = {};
    let lastPrefix = undefined;
    Str.print = withOptions({
        prefix: "",
        prefixColor: Str.FG_GRAY,
        openEnded: false,
        invisibleChars: DEFAULT_INVISIBLE,
    }, (opts, str) => {
        const invisibleHand = InvisibleHand.make(opts.invisibleChars);
        const prefixCleanLength = invisibleHand.length(opts.prefix);
        const middleSymbol = " ".repeat(prefixCleanLength) + "│";
        const headerSymbol = opts.openEnded === true && lastPrefix === opts.prefix
            ? middleSymbol
            : opts.prefix + "┐";
        lastPrefix = opts.prefix;
        if (invisible[opts.prefix] === undefined || opts.openEnded === false)
            invisible[opts.prefix] = [];
        const [headerPrefix, middlePrefix, footerPrefix, prefixLength] = prefixCleanLength === 0
            ? [opts.prefix, opts.prefix, opts.prefix, 0]
            : opts.openEnded === true
                ? [
                    opts.prefixColor + headerSymbol + Str.FG_DEFAULT,
                    opts.prefixColor + middleSymbol + Str.FG_DEFAULT,
                    opts.prefixColor + opts.prefix + "┘" + Str.FG_DEFAULT,
                    prefixCleanLength + 1,
                ]
                : [
                    opts.prefixColor + "┌" + opts.prefix + Str.FG_DEFAULT + " ",
                    opts.prefixColor + "│" + Str.FG_DEFAULT,
                    opts.prefixColor + "└" + opts.prefix + Str.FG_DEFAULT + " ",
                    1,
                ];
        const width = process.stdout.getWindowSize()[0];
        const lines = Arr.Sync.map(str.split("\n").flatMap((l) => {
            const words = l.split(" ");
            const result = [[]];
            let widthLeft = width - prefixLength;
            for (let i = 0; i < words.length;) {
                const cleanWord = invisibleHand.remove(words[i]);
                const wLength = cleanWord.length;
                if (wLength > widthLeft) {
                    const smaller = cleanWord.split(/(.+?[\/,])/i);
                    let iChars = 0;
                    for (let j = 0; j < smaller.length; j++) {
                        if (smaller[j].length === 0)
                            continue;
                        const wLength = smaller[j].length;
                        if (wLength > widthLeft) {
                            break;
                        }
                        widthLeft -= wLength;
                        iChars += wLength;
                    }
                    const indentIndex = words.findIndex((x) => ![""].includes(x));
                    const indent = words.slice(0, indentIndex);
                    if (widthLeft > 20)
                        iChars += widthLeft;
                    if (iChars > 0) {
                        const allInv = [...(invisibleHand.matchAll(words[i]) || [])];
                        const invs = [];
                        for (let a = 0; a < allInv.length; a++) {
                            const inv = allInv[a];
                            if (inv.index < iChars) {
                                iChars += inv[0].length;
                                invs.push(inv[0]);
                            }
                            else {
                                break;
                            }
                        }
                        const insert = words[i].substring(0, iChars);
                        result[result.length - 1].push(result[result.length - 1].length === 0
                            ? invisible[opts.prefix].join("") + insert
                            : insert);
                        invisible[opts.prefix].push(...invs);
                    }
                    words.splice(i, 1, ...indent, ...(indentIndex > 0 ||
                        /^([*\-]|[0-9a-z]+[\.\)\:])$/.test(words[indentIndex])
                        ? new Array(words[indentIndex].length + 1).fill("")
                        : []), words[i].substring(iChars));
                    result.push([]);
                    widthLeft = width - prefixLength;
                }
                else {
                    const inv = invisibleHand.match(words[i]) || [];
                    widthLeft -= wLength + 1;
                    result[result.length - 1].push(result[result.length - 1].length === 0
                        ? invisible[opts.prefix].join("") + words[i++]
                        : words[i++]);
                    invisible[opts.prefix].push(...inv);
                }
            }
            return result.map((ws) => ws.join(" "));
        }), (l) => middlePrefix + l, {
            first: (l) => headerPrefix + l,
            last: opts.openEnded === true ? undefined : (l) => footerPrefix + l,
        }).join("\n");
        process.stdout.write(lines + "\n");
    });
    function aligner(align) {
        return (str, width, invisibleHand) => {
            const cleanStr = invisibleHand.remove(str);
            if (cleanStr.length <= width)
                return align(str, width - cleanStr.length);
            const allInv = [...(invisibleHand.matchAll(str) || [])];
            let take = width - 3;
            while (allInv.length > 0 && allInv[0].index < take) {
                take += allInv.shift()[0].length;
            }
            return str.substring(0, take) + "..." + allInv.map((x) => x[0]).join("");
        };
    }
    Str.padStart = (str, width, c = " ", invisibleChars = DEFAULT_INVISIBLE) => aligner((s, w) => c.repeat(w) + s)(str, width, InvisibleHand.make(invisibleChars));
    Str.padEnd = (str, width, c = " ", invisibleChars = DEFAULT_INVISIBLE) => aligner((s, w) => s + c.repeat(w))(str, width, InvisibleHand.make(invisibleChars));
    Str.padBoth = withOptions({
        c: " ",
        invisibleChars: DEFAULT_INVISIBLE,
        margin: tuple(true, true),
    }, (opt, str, width) => aligner((s, w) => {
        const l = ~~((w + (opt.margin[0] ? 1 : 0) - (opt.margin[1] ? 1 : 0)) /
            2);
        const r = w - l;
        return opt.c.repeat(l) + s + opt.c.repeat(r);
    })(str, width, InvisibleHand.make(opt.invisibleChars)));
    Str.alignRight = Str.padStart;
    Str.alignLeft = Str.padEnd;
    Str.alignCenter = Str.padBoth;
    class Table {
        config;
        rows = [];
        constructor(columns, config) {
            this.config = config;
            this.addRow(...columns);
            this.addDivider();
        }
        addDivider() {
            this.rows.push(Str.FG_GRAY +
                Arr.Sync.map(this.config, (c) => "─".repeat(c[0])).join("─┼─") +
                Str.FG_DEFAULT);
            return this;
        }
        addRow(...values) {
            this.rows.push(Arr.Sync.zip(this.config, values, (c, v) => c[1](v)).join(` ${Str.FG_GRAY}│${Str.FG_DEFAULT} `));
            return this;
        }
        toString() {
            return this.rows.join("\n");
        }
    }
    let AsciiTable;
    (function (AsciiTable) {
        /**
         * Used to draw pretty ascii tables. The header determines column count,
         * width, and alignment. Use the format:
         *
         * ```Typescript
         * asciiTable("Title     | Stat | Runtime_|_Unit");
         * ```
         *
         * Means:
         * - `Title` is _left_ aligned, 9 chars wide
         * - `Stat` is _centered_, 4 chars wide
         * - `Runtime` is _right_ aligned, 7 chars wide
         * - `Unit` is _left_ aligned, 4 chars wide
         *
         * Notice: A nice benefit is that you can select the header string and see
         * exactly how wide it will be in the console.
         *
         * Calling this function gives you a table object, which you can add rows to,
         * and eventually print.
         *
         * @param columns
         * @returns
         */
        function simple(header, invisible) {
            const invisibleChars = invisible === undefined ? DEFAULT_INVISIBLE : invisible;
            const columns = header.split("|");
            return new Table(Arr.Sync.map(columns, (s) => s.substring(1, s.length - 1).trim(), {
                first: (s) => s.substring(0, s.length - 1).trim(),
                last: (s) => s.substring(1).trim(),
            }), Arr.Sync.map(columns, (c) => [
                c.length - 2,
                (c[0] === " ") === (c[c.length - 1] === " ")
                    ? (s) => Str.alignCenter(s, c.length - 2, { invisibleChars })
                    : c[0] === " "
                        ? (s) => Str.alignRight(s, c.length - 2, " ", invisibleChars)
                        : (s) => Str.alignLeft(s, c.length - 2, " ", invisibleChars),
            ], {
                first: (c) => [
                    c.length - 1,
                    c[0] === " " && c[c.length - 1] === " "
                        ? (s) => Str.alignCenter(s, c.length - 1, { invisibleChars })
                        : c[c.length - 1] === " "
                            ? (s) => Str.alignLeft(s, c.length - 1, " ", invisibleChars)
                            : (s) => Str.alignRight(s, c.length - 1, " ", invisibleChars),
                ],
                last: (c) => [
                    c.length - 1,
                    c[0] === " " && c[c.length - 1] === " "
                        ? (s) => Str.alignCenter(s, c.length - 1, { invisibleChars })
                        : c[0] === " "
                            ? (s) => Str.alignRight(s, c.length - 1, " ", invisibleChars)
                            : (s) => Str.alignLeft(s, c.length - 1, " ", invisibleChars),
                ],
            }));
        }
        AsciiTable.simple = simple;
        function advanced(headerWidth, data, format, after, prefix = "") {
            const maxWidths = [];
            const transformed = data.map((t) => {
                const result = format(t);
                result.forEach((s, i) => (maxWidths[i] = Math.max(maxWidths[i] || 0, s.length)));
                return [result, t];
            });
            const headers = Obj.keys(headerWidth);
            const fixedWidth = headers.reduce((a, h) => a + Math.abs(headerWidth[h]), 0);
            const calculatedWindowWidth = typeof process.stdout.getWindowSize !== "function"
                ? 80
                : process.stdout.getWindowSize()[0];
            const maxWidth = calculatedWindowWidth - prefix.length;
            const freeWidth = maxWidth - (headers.length - 1) * "─┼─".length - fixedWidth;
            const printHeaders = [];
            const printers = headers.map((h, i) => {
                maxWidths[i] =
                    headerWidth[h] < 0
                        ? Math.max(-headerWidth[h], Math.min(maxWidths[i], freeWidth))
                        : headerWidth[h];
                if (h[0] === "<") {
                    printHeaders.push(Str.alignCenter(h.substring(1), maxWidths[i], {
                        margin: [i === 0, i === headers.length - 1],
                    }));
                    return (s) => Str.alignLeft(s, maxWidths[i]);
                }
                else if (h[h.length - 1] === ">") {
                    printHeaders.push(Str.alignCenter(h.substring(0, h.length - 1), maxWidths[i], {
                        margin: [i === 0, i === headers.length - 1],
                    }));
                    return (s) => Str.alignRight(s, maxWidths[i]);
                }
                else {
                    printHeaders.push(Str.alignCenter(h, maxWidths[i], {
                        margin: [i === 0, i === headers.length - 1],
                    }));
                    return (s) => Str.alignCenter(s, maxWidths[i]);
                }
            });
            transformed.forEach(([ss, t]) => {
                const str = Arr.Sync.zip(printers, ss, (p, s) => p(s)).join(` ${Str.FG_GRAY}│${Str.FG_DEFAULT} `);
                after(str, t);
            });
            return (prefix +
                printHeaders.join(` ${Str.FG_GRAY}│${Str.FG_DEFAULT} `) +
                `\n` +
                prefix +
                Str.FG_GRAY +
                maxWidths.map((w) => "─".repeat(w)).join(`─┼─`) +
                Str.FG_DEFAULT);
        }
        AsciiTable.advanced = advanced;
    })(AsciiTable = Str.AsciiTable || (Str.AsciiTable = {}));
    Str.lowercase = "abcdefghijklmnopqrstuvwxyz";
    Str.uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    Str.digits = "0123456789";
    Str.underscore = "_";
    Str.dash = "-";
    Str.filename = Str.lowercase + Str.uppercase + Str.digits + Str.underscore + Str.dash;
    Str.all = Str.lowercase + Str.uppercase + Str.digits + Str.underscore + Str.dash;
    function generateString(length, ...alphabets) {
        const alphabet = alphabets.join("");
        const result = new Array(length);
        for (let i = 0; i < length; i++) {
            result.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
        }
        return result.join("");
    }
    Str.generateString = generateString;
    /**
     * @param str
     * @param radix
     * @returns [left, right | "", radix | ""]
     */
    function partitionLeft(str, radix) {
        const index = str.indexOf(radix);
        if (index < 0)
            return [str, "", ""];
        return [
            str.substring(0, index),
            str.substring(index + radix.length),
            radix,
        ];
    }
    Str.partitionLeft = partitionLeft;
    /**
     * @param str
     * @param radix
     * @returns [left, right | "", radix | ""]
     */
    function partitionRight(str, radix) {
        const index = str.lastIndexOf(radix);
        if (index < 0)
            return [str, "", ""];
        return [
            str.substring(0, index),
            str.substring(index + radix.length),
            radix,
        ];
    }
    Str.partitionRight = partitionRight;
    function toFolderName(str) {
        return str.toLowerCase().replace(/[^a-z0-9\-_]/g, "-");
    }
    Str.toFolderName = toFolderName;
    function list(strs) {
        return strs.length <= 2
            ? strs.join(" and ")
            : Arr.Sync.map(strs, (e) => e + ", ", { last: (e) => "and " + e }).join("");
    }
    Str.list = list;
    function plural(word, n = 0) {
        return n !== 1
            ? word[word.length - 1] === "y"
                ? word.substring(0, word.length - 1) + "ies"
                : word + "s"
            : word;
    }
    Str.plural = plural;
    function order(n) {
        return n + (["st", "nd", "rd"][n - 1] || "th");
    }
    Str.order = order;
    function capitalize(str) {
        return str[0].toUpperCase() + str.substring(1);
    }
    Str.capitalize = capitalize;
    function semanticVersionLessThan(old, new_) {
        const os = old.split(".");
        const ns = new_.split(".");
        if (+os[0] < +ns[0])
            return true;
        else if (+os[0] > +ns[0])
            return false;
        else if (+os[1] < +ns[1])
            return true;
        else if (+os[1] > +ns[1])
            return false;
        else if (+os[2] < +ns[2])
            return true;
        return false;
    }
    Str.semanticVersionLessThan = semanticVersionLessThan;
    function censor(str) {
        const [sec, pub, ch] = partitionLeft(str, "@");
        return sec[0] + "*".repeat(sec.length - 2) + sec[sec.length - 1] + ch + pub;
    }
    Str.censor = censor;
    function padNumber(n) {
        const str = n.toString();
        return " ".repeat(2 - str.length) + str;
    }
    Str.padNumber = padNumber;
    Str.MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    function prettyDate(d) {
        return (Str.MONTHS[d.getMonth()].substring(0, 3) +
            " " +
            d.getDate() +
            ", " +
            d.getFullYear());
    }
    Str.prettyDate = prettyDate;
    /**
     * Parse a boolean input value.
     *
     * @param bool input to parse
     * @returns false for any casing of the string false, the value null or undefined. Otherwise returns true.
     */
    function parseBool(bool) {
        return (bool !== null &&
            bool !== undefined &&
            bool !== "" &&
            bool.toLowerCase() !== "false");
    }
    Str.parseBool = parseBool;
})(Str || (Str = {}));
export function addMinutes(minutes, date = new Date()) {
    return new Date(date.getTime() + minutes * MINUTES);
}
/**
 * Normally, you cannot have varargs at the beginning of a parameter list.
 * This function solves that.
 *
 * ### Example 1: Mixed types
 *
 * ```Typescript
 * const getEnvvarNumber = varArgsBeforeOptional(
 *   (a): a is number => typeof a === "number",
 *   (vars: string[], def: number | undefined) => {
 *     const v = vars.find((v) => process.env[v] !== undefined);
 *     return v !== undefined ? +v : def;
 *   }
 * );
 * getEnvvarNumber(); // default is undefined
 * getEnvvarNumber("ENVVAR1"); // default is undefined
 * getEnvvarNumber("ENVVAR1", 42);
 * getEnvvarNumber("ENVVAR1", "ENVVAR2"); // default is undefined
 * getEnvvarNumber("ENVVAR1", "ENVVAR2", 42);
 * getEnvvarNumber("ENVVAR1", 42, "ENVVAR2"); // compile-error
 * ```
 *
 * ### Example 2: The same type
 *
 * ```Typescript
 * const getEnvvar = varArgsBeforeOptional(
 *   (a): a is string => !/^[A-Z_]*$/.test(a),
 *   (vars: string[], def: string | undefined) => {
 *     return vars.find((v) => process.env[v] !== undefined) || def;
 *   }
 * );
 * getEnvvar(); // default is undefined
 * getEnvvar("ENVVAR1"); // default is undefined
 * getEnvvar("ENVVAR1", "default");
 * getEnvvar("ENVVAR1", "ENVVAR2"); // default is undefined
 * getEnvvar("ENVVAR1", "ENVVAR2", "default");
 * getEnvvar("ENVVAR1", "default", "ENVVAR2"); // default is undefined
 * ```
 *
 * @param isOpt how to recognize the optional argument
 * @param f your function
 * @returns your function with varargs
 */
export function varArgsBeforeOptional(isOpt, f) {
    return (...v) => {
        const last = v[v.length - 1];
        if (last !== undefined && isOpt(last)) {
            return f(v.slice(0, v.length - 1), last);
        }
        else {
            return f(v, undefined);
        }
    };
}
/**
 * You cannot have varargs at the beginning of a parameter list.
 *
 * ### Normal Typescript: Doesn't compile
 *
 * ```Typescript
 * function ThrowsNormal(...es: string[], f: () => void) { ... }
 * ThrowsNormal(() => { ... });
 * ThrowsNormal("NotFound", () => { ... });
 * ThrowsNormal("NotFound", "IOException", () => { ... });
 * ```
 *
 * You can hack this by putting your arguments at the end, but it sucks.
 * Especially, if you want any parameters after a long function.
 *
 * ### Hack: Bad
 * ```Typescript
 * function ThrowsNormalHack(f: () => void, ...es: string[]) { ... }
 * const foo2 = ThrowsNormalHack(() => {
 *   ...
 * });
 * const bar2 = ThrowsNormalHack(() => {
 *   ...
 * }, "NotFound");
 * const baz2 = ThrowsNormalHack(
 *   () => {
 *     ...
 *   },
 *   "NotFound",
 *   "IOException"
 * );
 * ```
 *
 * This function solves this.
 *
 * ### Example: Solution
 *
 * ```Typescript
 * const ThrowsNew = varArgsFirst((es: string[], f: () => void) => { ... });
 * const foo1 = ThrowsNew(() => {
 *   ...
 * });
 * const bar1 = ThrowsNew("NotFound", () => {
 *   ...
 * });
 * const baz1 = ThrowsNew("NotFound", "IOException", () => {
 *   ...
 * });
 * ```
 *
 * @param f your function
 * @returns your function with varargs
 */
export function varArgsFirst(f) {
    return (...v) => {
        const last = v[v.length - 1];
        return f(v.slice(0, v.length - 1), last);
    };
}
/**
 * When we want to initialize a variable in some complex way (like using if-
 * else or try-catch) we sometimes resolve to `let` instead of `const` (never
 * `var`), even when the value will never change.
 *
 * To get around this, we can use a lambda-binding trick:
 *
 * ```Typescript
 * const total = ((n) => {
 *   return n.a;
 * })(await slowThing());
 * ```
 *
 * However, this pushes the calculation's input to the bottom, which is hard
 * to follow. This method pulls that info to the top instead.
 *
 * ```Typescript
 * const total = constify(await slowThing(), (n) => {
 *   return n.a;
 * });
 * ```
 *
 * It can also be used to rename something, or even deconstruct it in a ternary:
 *
 * ```Typescript
 * const length = (as: unknown[]): number =>
 *   as.length === 0
 *     ? 0
 *     : constify(as, ([hd, ...tl]) => 1 + length(tl));
 * ```
 *
 * @param args clojure
 * @param f initialization function
 * @returns const value
 */
export function constify(...args) {
    return args[args.length - 1](...args.slice(0, args.length - 1));
}
class CheckedException {
    type;
    data;
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}
class InternalRaiser {
    throws;
    f;
    constructor(throws, f) {
        this.throws = throws;
        this.f = f;
    }
    Start(a) {
        return this.f(...a);
    }
}
/**
 * Define function that raises checked exceptions. To call it use `Start(foo)(arguments)`
 */
export function Raises(...e) {
    return (f) => new InternalRaiser(e[0], f((e, data) => {
        throw new CheckedException(e, data);
    }));
}
class Catcher {
    handler;
    constructor(handler) {
        this.handler = handler;
    }
    /**
     * Handle another type of checked exception
     * @param type the checked exception to catch, eg. "FileNotFound"
     * @param handler how to handle the exception
     * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
     */
    Catch(type, handler) {
        return new Catcher((next) => this.handler((e) => {
            if (typeof e === "object" && "type" in e && e.type === type)
                return handler("data" in e && e.data);
            return next(e);
        }));
    }
    /**
     * @param body code that might raise checked exceptions.
     * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
     */
    Try(body) {
        return body((func, ...a) => {
            const prom = func.Start(a);
            prom.catch((e) => {
                this.handler((e) => {
                    throw e;
                })(e);
            });
            return prom;
        }).catch((e) => { });
    }
}
/**
 * Start a Catch-Try block that can handle checked exceptions, end with `.Try()`
 * @param type the checked exception to catch, eg. "FileNotFound"
 * @param handler how to handle the exception
 * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
 */
export function Catch(type, handler) {
    return new Catcher((next) => (e) => next(e)).Catch(type, handler);
}
/**
 * Run a function inside a Catch-Try block that handles all relevant checked exceptions.
 * @param func a function defined with `Raises()`
 * @param args arguments to the function
 * @returns a Promise that wont cause "uncaught promise" from any checked exception
 */
export function Start(func, ...args) {
    return func.Start(args);
}
let counter = 0;
export function gensym() {
    return (counter++).toString();
}
export function withOptions(defaults, f) {
    return (...args) => {
        const last = args[args.length - 1];
        if (typeof last !== "object" || last === null)
            return f(defaults, ...args);
        const keys = Obj.keys(last);
        if (Arr.Sync.all(keys, (k) => k in defaults))
            return f(Obj.Sync.map(defaults, (k, v) => Obj.hasKey(k, last) ? last[k] : v), ...args.slice(0, args.length - 1));
        else
            return f(defaults, ...args);
    };
}
// export class PathTo {
//   constructor(private readonly path: string) {}
//   with(folder: string) {
//     return new PathTo(join(this.path, folder));
//   }
//   parent() {
//     return basename(this.path);
//   }
//   toString() {
//     return this.path;
//   }
// }
// export function getFiles(
//   path: PathTo,
//   options: {
//     files?: boolean;
//     folders?: boolean;
//     exclude?: RegExp;
//     recursive?: boolean;
//   }
// ): Promise<string[]> {
//   return getFiles_internal(path, "", {
//     files: options?.files !== undefined ? options.files : true,
//     folders: options?.folders !== undefined ? options.folders : true,
//     exclude: options?.exclude,
//     recursive: options?.recursive !== undefined ? options.recursive : false,
//   });
// }
// async function getFiles_internal(
//   path: PathTo,
//   prefix: string,
//   options: {
//     files: boolean;
//     folders: boolean;
//     exclude: RegExp | undefined;
//     recursive: boolean;
//   }
// ): Promise<string[]> {
//   if (!existsSync(path.toString())) return [];
//   return await Arr.Async.flatMap(
//     readdir(path.toString(), { withFileTypes: true }),
//     async (x) => {
//       const result: string[] =
//         x.isDirectory() && options.recursive
//           ? await getFiles_internal(
//               path.with(x.name),
//               prefix + x.name + "/",
//               options
//             )
//           : [];
//       if (
//         options.exclude?.test(x.name) !== true &&
//         ((x.isDirectory() &&
//           options.folders === true &&
//           !x.name.startsWith(".")) ||
//           (!x.isDirectory() && options.files === true))
//       )
//         result.push(prefix + x.name);
//       return result;
//     }
//   );
// }
