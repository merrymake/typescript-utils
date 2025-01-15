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
/**
 * Promise.all([4, 3]); // BROKEN
 * Promise_all([4, 3]); // Much nicer
 *
 * @param arr
 * @returns
 */
export function Promise_all(arr) {
    return Promise.all(arr);
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
        function partition(arr, f) {
            const yes = [];
            const no = [];
            forEach(arr, (t, i) => (f(t, i) === true ? yes.push(t) : no.push(t)));
            return { yes, no };
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
            partition,
            filter,
            zip,
            some,
            all,
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
            await Promise_all(new Array(maxConcurrent).fill(0).map((_) => worker(tasks))).then();
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
        async function partition(arr, f) {
            const yes = [];
            const no = [];
            await forEach(arr, async (t) => (await f(t)) === true ? yes.push(t) : no.push(t));
            return { yes, no };
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
        async function toObject(keys, val) {
            const result = {};
            await forEach(keys, async (k) => (result[k] = await val(k)));
            return result;
        }
    }
    Arr.Async = Async;
})(Arr || (Arr = {}));
export var Obj;
(function (Obj) {
    function keys(o) {
        return Object.keys(o);
    }
    Obj.keys = keys;
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
        function partition(o, f) {
            const yes = {};
            const no = {};
            forEach(o, (k) => f(k, o[k]) === true ? (yes[k] = o[k]) : (no[k] = o[k]));
            return { yes, no };
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
        async function partition(o, f) {
            const yes = {};
            const no = {};
            await forEach(o, async (k) => (await f(k, o[k])) === true ? (yes[k] = o[k]) : (no[k] = o[k]));
            return { yes, no };
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
    }
    Obj.Async = Async;
})(Obj || (Obj = {}));
const checkers = {
    array: (v) => Array.isArray(v),
    NaN: (v) => (typeof v === "number" && isNaN(v)) ||
        (typeof v === "string" && isNaN(parseFloat(v))),
    number: (v) => (typeof v === "number" && !isNaN(v)) ||
        (typeof v === "string" && !isNaN(parseFloat(v))),
    finite: (v) => typeof v === "number" && isFinite(v),
    infinite: (v) => typeof v === "number" && !isFinite(v),
    string: (v) => typeof v === "string",
    null: (v) => v === null,
    undefined: (v) => v === undefined,
    truthy: (v) => !!v,
    falsy: (v) => !v,
    boolean: (v) => typeof v === "boolean",
    true: (v) => v === true,
    false: (v) => v === false,
    object: (v) => v !== null && typeof v === "object",
};
export function is(v, ...ts) {
    return Arr.Sync.all(ts, (k) => checkers[k](v));
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
            if (process.stdout.isTTY === false)
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
            this.interval = setInterval(() => {
                this.spinnerIndex = (this.spinnerIndex + 1) % this.steps.length;
                process.stdout.write(this.steps[this.spinnerIndex]);
                process.stdout.moveCursor(-this.steps[this.spinnerIndex].length, 0);
            }, 125);
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
            if (format.requiresTTY() === true && process.stdout.isTTY === false)
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
    Str.NORMAL_COLOR = "\x1b[0m";
    Str.BLACK = "\x1b[30m";
    Str.RED = "\x1b[31m";
    Str.GREEN = "\x1b[32m";
    Str.YELLOW = "\x1b[33m";
    Str.BLUE = "\x1b[34m";
    Str.PURPLE = "\x1b[35m";
    Str.CYAN = "\x1b[36m";
    Str.WHITE = "\x1b[37m";
    Str.GRAY = "\x1b[90m";
    Str.BG_BLACK = "\x1b[40m";
    Str.BG_RED = "\x1b[41m";
    Str.BG_GREEN = "\x1b[42m";
    Str.BG_YELLOW = "\x1b[43m";
    Str.BG_BLUE = "\x1b[44m";
    Str.BG_PURPLE = "\x1b[45m";
    Str.BG_CYAN = "\x1b[46m";
    Str.BG_WHITE = "\x1b[47m";
    Str.BG_GRAY = "\x1b[100m";
    Str.STRIKE = "\x1b[9m";
    Str.NO_STRIKE = "\x1b[29m";
    const DEFAULT_INVISIBLE = new Set([
        Str.NORMAL_COLOR,
        Str.BLACK,
        Str.RED,
        Str.GREEN,
        Str.YELLOW,
        Str.BLUE,
        Str.PURPLE,
        Str.CYAN,
        Str.WHITE,
        Str.GRAY,
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
    ]);
    const invisible = {};
    let lastPrefix = undefined;
    function print(str, prefix = "", invisibleChars, prefixColor = "\x1b[90m", openEnded = false) {
        const invisibleHand = InvisibleHand.make(invisibleChars === undefined ? DEFAULT_INVISIBLE : invisibleChars);
        const prefixCleanLength = invisibleHand.length(prefix);
        const middleSymbol = " ".repeat(prefixCleanLength) + "│";
        const headerSymbol = openEnded === true && lastPrefix === prefix ? middleSymbol : prefix + "┐";
        lastPrefix = prefix;
        if (invisible[prefix] === undefined || openEnded === false)
            invisible[prefix] = [];
        const [headerPrefix, middlePrefix, footerPrefix, prefixLength] = prefixCleanLength > 0
            ? [
                prefixColor + headerSymbol + Str.NORMAL_COLOR,
                prefixColor + middleSymbol + Str.NORMAL_COLOR,
                prefixColor + prefix + "┘" + Str.NORMAL_COLOR,
                prefixCleanLength + 1,
            ]
            : [prefix, prefix, prefix, 0];
        const width = process.stdout.getWindowSize()[0];
        const lines = Arr.Sync.map(str
            .trimEnd()
            .split("\n")
            .flatMap((l) => {
            const words = l.split(" ");
            const result = [[]];
            let widthLeft = width - prefixLength;
            for (let i = 0; i < words.length;) {
                const cleanWord = invisibleHand.remove(words[i]);
                const wLength = cleanWord.length;
                if (wLength > widthLeft) {
                    const smaller = cleanWord.split(/([\/])/i);
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
                            ? invisible[prefix].join("") + insert
                            : insert);
                        invisible[prefix].push(...invs);
                    }
                    words.splice(i, 1, ...indent, ...(indentIndex > 0 || ["*", "-"].includes(words[0])
                        ? ["", ""]
                        : []), words[i].substring(iChars));
                    result.push([]);
                    widthLeft = width - prefixLength;
                }
                else {
                    const inv = invisibleHand.match(words[i]) || [];
                    widthLeft -= wLength + 1;
                    result[result.length - 1].push(result[result.length - 1].length === 0
                        ? invisible[prefix].join("") + words[i++]
                        : words[i++]);
                    invisible[prefix].push(...inv);
                }
            }
            return result.map((ws) => ws.join(" "));
        }), (l) => middlePrefix + l, {
            first: (l) => headerPrefix + l,
            last: openEnded === true ? undefined : (l) => footerPrefix + l,
        }).join("\n");
        process.stdout.write(lines + "\n");
    }
    Str.print = print;
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
    Str.padBoth = (str, width, c = " ", invisibleChars = DEFAULT_INVISIBLE) => aligner((s, w) => {
        const l = ~~(w / 2);
        const r = w - l;
        return " ".repeat(l) + s + " ".repeat(r);
    })(str, width, InvisibleHand.make(invisibleChars));
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
            this.rows.push(Arr.Sync.map(this.config, (c) => "─".repeat(c[0])).join("─┼─"));
            return this;
        }
        addRow(...values) {
            this.rows.push(Arr.Sync.zip(this.config, values, (c, v) => c[1](v)).join(" │ "));
            return this;
        }
        toString() {
            return this.rows.join("\n");
        }
    }
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
    function asciiTable(header, invisibleChars) {
        const invisibleHand = invisibleChars === undefined ? DEFAULT_INVISIBLE : invisibleChars;
        const columns = header.split("|");
        return new Table(Arr.Sync.map(columns, (s) => s.substring(1, s.length - 1).trim(), {
            first: (s) => s.substring(0, s.length - 1).trim(),
            last: (s) => s.substring(1).trim(),
        }), Arr.Sync.map(columns, (c) => [
            c.length - 2,
            (c[0] === " ") === (c[c.length - 1] === " ")
                ? (s) => Str.alignCenter(s, c.length - 2, " ", invisibleHand)
                : c[0] === " "
                    ? (s) => Str.alignRight(s, c.length - 2, " ", invisibleHand)
                    : (s) => Str.alignLeft(s, c.length - 2, " ", invisibleHand),
        ], {
            first: (c) => [
                c.length - 1,
                c[0] === " " && c[c.length - 1] === " "
                    ? (s) => Str.alignCenter(s, c.length - 1, " ", invisibleHand)
                    : c[c.length - 1] === " "
                        ? (s) => Str.alignLeft(s, c.length - 1, " ", invisibleHand)
                        : (s) => Str.alignRight(s, c.length - 1, " ", invisibleHand),
            ],
            last: (c) => [
                c.length - 1,
                c[0] === " " && c[c.length - 1] === " "
                    ? (s) => Str.alignCenter(s, c.length - 1, " ", invisibleHand)
                    : c[0] === " "
                        ? (s) => Str.alignRight(s, c.length - 1, " ", invisibleHand)
                        : (s) => Str.alignLeft(s, c.length - 1, " ", invisibleHand),
            ],
        }));
    }
    Str.asciiTable = asciiTable;
})(Str || (Str = {}));
