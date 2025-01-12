import { cpus } from "os";
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
    let Sync;
    (function (Sync) {
        function forEach(arr, f) {
            arr.forEach(f);
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
            forEach(arr, (t) => (f(t) === true ? yes.push(t) : no.push(t)));
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
        function toObject(keys, val) {
            const result = {};
            forEach(keys, (k) => (result[k] = val(k)));
            return result;
        }
        Sync.toObject = toObject;
    })(Sync = Arr.Sync || (Arr.Sync = {}));
    function Async(maxConcurrent = cpus().length) {
        return {
            forEach,
            map,
            partition,
            filter,
            zip,
            toObject,
        };
        async function worker(tasks) {
            let t;
            while ((t = tasks.splice(0, 1)[0]) !== undefined) {
                await t().then();
            }
        }
        async function forEach(arr, f) {
            await Promise_all(new Array(maxConcurrent)
                .fill(0)
                .map((_) => worker(arr.map((x, i) => () => f(x, i))))).then();
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
    let Sync;
    (function (Sync) {
        function keys(o) {
            return Object.keys(o);
        }
        Sync.keys = keys;
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
    })(Sync = Obj.Sync || (Obj.Sync = {}));
    function Async(maxConcurrent = cpus().length) {
        return {
            forEach,
            map,
            partition,
            filter,
        };
        async function forEach(o, f) {
            await Arr.Async(maxConcurrent).forEach(Sync.keys(o), (k) => f(k, o[k]));
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
    }
    Obj.Async = Async;
})(Obj || (Obj = {}));
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
class InvisibleHand {
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
export const NORMAL_COLOR = "\x1b[0m";
export const BLACK = "\x1b[30m";
export const RED = "\x1b[31m";
export const GREEN = "\x1b[32m";
export const YELLOW = "\x1b[33m";
export const BLUE = "\x1b[34m";
export const PURPLE = "\x1b[35m";
export const CYAN = "\x1b[36m";
export const WHITE = "\x1b[37m";
export const GRAY = "\x1b[90m";
export const BG_BLACK = "\x1b[40m";
export const BG_RED = "\x1b[41m";
export const BG_GREEN = "\x1b[42m";
export const BG_YELLOW = "\x1b[43m";
export const BG_BLUE = "\x1b[44m";
export const BG_PURPLE = "\x1b[45m";
export const BG_CYAN = "\x1b[46m";
export const BG_WHITE = "\x1b[47m";
export const BG_GRAY = "\x1b[100m";
export const STRIKE = "\x1b[9m";
export const NO_STRIKE = "\x1b[29m";
const DEFAULT_INVISIBLE = new InvisibleHand(new Set([
    NORMAL_COLOR,
    BLACK,
    RED,
    GREEN,
    YELLOW,
    BLUE,
    PURPLE,
    CYAN,
    WHITE,
    GRAY,
    BG_BLACK,
    BG_RED,
    BG_GREEN,
    BG_YELLOW,
    BG_BLUE,
    BG_PURPLE,
    BG_CYAN,
    BG_WHITE,
    BG_GRAY,
    STRIKE,
    NO_STRIKE,
]));
const invisible = {};
let lastPrefix = undefined;
export function print(str, prefix = "", invisibleChars, prefixColor = "\x1b[90m", openEnded = false) {
    const invisibleHand = invisibleChars === undefined
        ? DEFAULT_INVISIBLE
        : new InvisibleHand(invisibleChars);
    const prefixCleanLength = invisibleHand.length(prefix);
    const middleSymbol = " ".repeat(prefixCleanLength) + "│";
    const headerSymbol = openEnded === true && lastPrefix === prefix ? middleSymbol : prefix + "┐";
    lastPrefix = prefix;
    if (invisible[prefix] === undefined || openEnded === false)
        invisible[prefix] = [];
    const [headerPrefix, middlePrefix, footerPrefix, prefixLength] = prefixCleanLength > 0
        ? [
            prefixColor + headerSymbol + NORMAL_COLOR,
            prefixColor + middleSymbol + NORMAL_COLOR,
            prefixColor + prefix + "┘" + NORMAL_COLOR,
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
const alignRight = aligner((s, w) => " ".repeat(w) + s);
const alignLeft = aligner((s, w) => s + " ".repeat(w));
const alignCenter = aligner((s, w) => {
    const l = ~~(w / 2);
    const r = w - l;
    return " ".repeat(l) + s + " ".repeat(r);
});
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
export function asciiTable(header, invisibleChars) {
    const invisibleHand = invisibleChars === undefined
        ? DEFAULT_INVISIBLE
        : new InvisibleHand(invisibleChars);
    const columns = header.split("|");
    return new Table(Arr.Sync.map(columns, (s) => s.substring(1, s.length - 1).trim(), {
        first: (s) => s.substring(0, s.length - 1).trim(),
        last: (s) => s.substring(1).trim(),
    }), Arr.Sync.map(columns, (c) => [
        c.length - 2,
        (c[0] === " ") === (c[c.length - 1] === " ")
            ? (s) => alignCenter(s, c.length - 2, invisibleHand)
            : c[0] === " "
                ? (s) => alignRight(s, c.length - 2, invisibleHand)
                : (s) => alignLeft(s, c.length - 2, invisibleHand),
    ], {
        first: (c) => [
            c.length - 1,
            c[0] === " " && c[c.length - 1] === " "
                ? (s) => alignCenter(s, c.length - 1, invisibleHand)
                : c[c.length - 1] === " "
                    ? (s) => alignLeft(s, c.length - 1, invisibleHand)
                    : (s) => alignRight(s, c.length - 1, invisibleHand),
        ],
        last: (c) => [
            c.length - 1,
            c[0] === " " && c[c.length - 1] === " "
                ? (s) => alignCenter(s, c.length - 1, invisibleHand)
                : c[0] === " "
                    ? (s) => alignRight(s, c.length - 1, invisibleHand)
                    : (s) => alignLeft(s, c.length - 1, invisibleHand),
        ],
    }));
}
