export declare const MILLISECONDS = 1;
export declare const SECONDS = 1000;
export declare const MINUTES = 60000;
export declare const HOURS = 3600000;
export declare const DAYS = 86400000;
export declare const WEEKS = 604800000;
export declare const SECONDS_IN_SECONDS = 1;
export declare const MINUTES_IN_SECONDS = 60;
export declare const HOURS_IN_SECONDS = 3600;
export declare const DAYS_IN_SECONDS = 86400;
export declare const WEEKS_IN_SECONDS = 604800;
export declare const BYTES = 1;
export declare const KILOBYTES = 1024;
export declare const MEGABYTES = 1048576;
export declare const GIGABYTES = 1073741824;
export declare const TERABYTES = 1099511627776;
export declare const PETABYTES = 1125899906842624;
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
export declare function Promise_all<T extends readonly unknown[] | []>(...arr: T & Promise<unknown>[]): Promise<{
    -readonly [P in keyof T]: Awaited<T[P]>;
}>;
export declare function randomElement<T>(arr: readonly T[], rng?: () => number): T;
export declare function sleep(ms: number): Promise<void>;
export declare namespace Arr {
    function random<T>(arr: readonly T[]): {
        value: T;
        index: number;
    };
    namespace Sync {
        function findFirst<T>(arr: readonly T[], f: (_: T, i: number) => boolean): {
            value: T;
            index: number;
        } | undefined;
        function findLast<T>(arr: readonly T[], f: (_: T, i: number) => boolean): {
            value: T;
            index: number;
        } | undefined;
        function forEach<A>(arr: readonly A[], f: (s: A, i: number) => unknown): void;
        function map<A, B>(arr: readonly A[], f: (s: A, i: number) => B, actions?: {
            first?: (s: A) => B;
            last?: (s: A) => B;
            ends?: (s: A) => B;
        }): B[];
        function flatMap<A, B>(arr: readonly A[], f: (s: A, i: number) => B[], actions?: {
            first?: (s: A) => B[];
            last?: (s: A) => B[];
            ends?: (s: A) => B[];
        }): B[];
        function partition<T, Yes extends string = "yes", No extends string = "no">(arr: readonly T[], f: (_: T, i: number) => boolean, opts?: {
            yesField?: Yes;
            noField?: No;
        }): {
            [k in Yes]: T[];
        } & {
            [k in No]: T[];
        };
        function filter<T>(arr: readonly T[], f: (_: T, i: number) => boolean): T[];
        function zip<A, B, C>(as: readonly A[], bs: readonly B[], f: (a: A, b: B, i: number) => C, actions?: {
            aRest?: (a: A, i: number) => C;
            bRest?: (b: B, i: number) => C;
        }): any[];
        function some<T>(arr: readonly T[], f: (_: T, i: number) => boolean): boolean;
        function all<T>(arr: readonly T[], f: (_: T, i: number) => boolean): boolean;
        function reduce<A, B>(arr: readonly A[], f: (acc: B, s: A, i: number) => B, base: B): B;
        function maxBy<T>(arr: readonly T[], f: (t: T) => number): {
            element: T;
            value: number;
            index: number;
        } | undefined;
        function minBy<T>(arr: readonly T[], f: (t: T) => number): {
            element: T;
            value: number;
            index: number;
        } | undefined;
        const max: (arr: readonly number[]) => {
            element: number;
            value: number;
            index: number;
        } | undefined;
        const min: (arr: readonly number[]) => {
            element: number;
            value: number;
            index: number;
        } | undefined;
        function toObject<K extends readonly string[], T>(keys: K, val: (k: K[number]) => T): { [key in K[number]]: T; };
    }
    function Async(maxConcurrent?: number): {
        findAny: <T>(arr: readonly T[], f: (_: T, i: number) => Promise<boolean>) => Promise<undefined>;
        forEach: <A>(arr: readonly A[], f: (s: A, i: number) => Promise<unknown>) => Promise<void>;
        map: <A, B>(arr: readonly A[], f: (s: A, i: number) => Promise<B>, actions?: {
            first?: (s: A) => Promise<B>;
            last?: (s: A) => Promise<B>;
            ends?: (s: A) => Promise<B>;
        }) => Promise<B[]>;
        flatMap: <A, B>(arr: readonly A[], f: (s: A, i: number) => Promise<B[]>, actions?: {
            first?: (s: A) => Promise<B[]>;
            last?: (s: A) => Promise<B[]>;
            ends?: (s: A) => Promise<B[]>;
        }) => Promise<B[]>;
        partition: <T, Yes extends string = "yes", No extends string = "no">(arr: readonly T[], f: (_: T, i: number) => Promise<boolean>, opts?: {
            yesField?: Yes;
            noField?: No;
        }) => Promise<{ [k in Yes]: T[]; } & { [k in No]: T[]; }>;
        filter: <T>(arr: readonly T[], f: (_: T) => Promise<boolean>) => Promise<T[]>;
        zip: <A, B, C>(as: readonly A[], bs: readonly B[], f: (a: A, b: B, i: number) => Promise<C>, actions?: {
            aRest?: (a: A, i: number) => Promise<C>;
            bRest?: (b: B, i: number) => Promise<C>;
        }) => Promise<C[]>;
        some: <T>(arr: readonly T[], f: (_: T, i: number) => Promise<boolean>) => Promise<boolean>;
        all: <T>(arr: readonly T[], f: (_: T, i: number) => Promise<boolean>) => Promise<boolean>;
        maxBy: <T>(arr: readonly T[], f: (t: T) => Promise<number>) => Promise<{
            element: T;
            value: number;
            index: number;
        } | undefined>;
        minBy: <T>(arr: readonly T[], f: (t: T) => Promise<number>) => Promise<{
            element: T;
            value: number;
            index: number;
        } | undefined>;
        toObject: <K extends readonly string[], T>(keys: K, val: (k: K[number]) => Promise<T>) => Promise<{ [key in K[number]]: T; }>;
    };
}
interface DotHelper {
    dot<K extends string>(k: K): DotHelper;
    as<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(...ts: K): IsTypeHelper[K[number]] | undefined;
}
export declare namespace Is {
    class Check<T> {
        private ch;
        constructor(ch: (o: unknown) => o is T);
        in<K extends string>(k: K): Check<{ [k in K]: T; }>;
        check(o: unknown): o is T;
    }
    export function a<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(...ts: K): Check<IsTypeHelper[K[number]]>;
    export {};
}
export declare namespace Obj {
    function keys<T extends {}>(o: T): Array<keyof T & string>;
    function hasKey<K extends string, T = {
        [k in K]: unknown;
    }>(k: K, obj: T | unknown): obj is T;
    function dot<K extends string>(obj: unknown, k: K): DotHelper;
    function access<K extends string>(obj: unknown, k: K): {
        [k in K]: unknown;
    } | undefined;
    function random<T extends {
        [k: string]: unknown;
    }>(o: T): {
        value: T[keyof T];
        key: keyof T;
    };
    namespace Sync {
        function findFirst<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean): {
            value: keyof T & string;
            index: number;
        } | undefined;
        function findLast<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean): {
            value: keyof T & string;
            index: number;
        } | undefined;
        function forEach<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => unknown): void;
        function map<B, T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => B): {
            [k in keyof T]: B;
        };
        function partition<T extends {
            [k: string]: unknown;
        }, Yes extends string = "yes", No extends string = "no">(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean, opts?: {
            yesField?: Yes;
            noField?: No;
        }): {
            [k in Yes]: {
                [k in keyof T]?: T[k];
            };
        } & {
            [k in No]: {
                [k in keyof T]?: T[k];
            };
        };
        function filter<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean): { [k in keyof T]?: T[k] | undefined; };
        function some<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean): boolean;
        function all<T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => boolean): boolean;
        function toArray<T extends {
            [k: string]: unknown;
        }, B>(o: T, f: (key: keyof T & string, val: T[keyof T]) => B): B[];
    }
    function Async(maxConcurrent?: number): {
        findAny: <T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>) => Promise<undefined>;
        forEach: <T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<unknown>) => Promise<void>;
        map: <B, T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<B>) => Promise<{ [k in keyof T]: B; }>;
        partition: <T extends {
            [k: string]: unknown;
        }, Yes extends string = "yes", No extends string = "no">(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>, opts?: {
            yesField?: Yes;
            noField?: No;
        }) => Promise<{ [k in Yes]: { [k_1 in keyof T]?: T[k_1]; }; } & { [k in No]: { [k_1 in keyof T]?: T[k_1]; }; }>;
        filter: <T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>) => Promise<{ [k in keyof T]?: T[k] | undefined; }>;
        some: <T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>) => Promise<boolean>;
        all: <T extends {
            [k: string]: unknown;
        }>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>) => Promise<boolean>;
        toArray: <T extends {
            [k: string]: unknown;
        }, B>(o: T, f: (key: keyof T & string, val: T[keyof T]) => Promise<B>) => Promise<B[]>;
    };
}
interface IsTypeHelper {
    array: unknown[];
    arrayNonEmpty: unknown[];
    NaN: number;
    number: number;
    numeric: number;
    finite: number;
    infinite: number;
    string: string;
    stringNonEmpty: string;
    null: null;
    undefined: undefined;
    truthy: boolean;
    falsy: boolean;
    boolean: boolean;
    true: true;
    false: false;
    object: Record<number | string | symbol, unknown>;
    buffer: Buffer;
}
export declare function is<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(v: unknown, ...ts: K): v is IsTypeHelper[K[number]];
type ValueTypeCheck<C> = <K extends string>(x: Record<K, C>) => Record<K, C>;
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
export declare const valueType: <C>() => ValueTypeCheck<C>;
export declare const tuple: <T extends unknown[]>(...x: T) => T;
export declare const UnitType: Record<"Duration" | "Memory", readonly (readonly [number, string])[]>;
export declare namespace Str {
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
    export function withUnit<T extends readonly (readonly [number, string])[]>(amount: number, units: T, unit?: T[number][1]): string;
    /**
     * Usage:
     * ```
     * const spinner = Spinner.start();
     * // Do some slow work
     * const duration = spinner.stop();
     * ```
     */
    export class Spinner {
        private steps;
        /**
         * A lot of spinners (most are from https://www.npmjs.com/package/cli-spinners)
         */
        static readonly format: {
            readonly dots: readonly ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
            readonly dots2: readonly ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
            readonly dots3: readonly ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"];
            readonly dots4: readonly ["⠄", "⠆", "⠇", "⠋", "⠙", "⠸", "⠰", "⠠", "⠰", "⠸", "⠙", "⠋", "⠇", "⠆"];
            readonly dots5: readonly ["⠋", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋"];
            readonly dots6: readonly ["⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠴", "⠲", "⠒", "⠂", "⠂", "⠒", "⠚", "⠙", "⠉", "⠁"];
            readonly dots7: readonly ["⠈", "⠉", "⠋", "⠓", "⠒", "⠐", "⠐", "⠒", "⠖", "⠦", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈"];
            readonly dots8: readonly ["⠁", "⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈", "⠈"];
            readonly dots9: readonly ["⢹", "⢺", "⢼", "⣸", "⣇", "⡧", "⡗", "⡏"];
            readonly dots10: readonly ["⢄", "⢂", "⢁", "⡁", "⡈", "⡐", "⡠"];
            readonly dots11: readonly ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"];
            readonly dots12: readonly ["⢀⠀", "⡀⠀", "⠄⠀", "⢂⠀", "⡂⠀", "⠅⠀", "⢃⠀", "⡃⠀", "⠍⠀", "⢋⠀", "⡋⠀", "⠍⠁", "⢋⠁", "⡋⠁", "⠍⠉", "⠋⠉", "⠋⠉", "⠉⠙", "⠉⠙", "⠉⠩", "⠈⢙", "⠈⡙", "⢈⠩", "⡀⢙", "⠄⡙", "⢂⠩", "⡂⢘", "⠅⡘", "⢃⠨", "⡃⢐", "⠍⡐", "⢋⠠", "⡋⢀", "⠍⡁", "⢋⠁", "⡋⠁", "⠍⠉", "⠋⠉", "⠋⠉", "⠉⠙", "⠉⠙", "⠉⠩", "⠈⢙", "⠈⡙", "⠈⠩", "⠀⢙", "⠀⡙", "⠀⠩", "⠀⢘", "⠀⡘", "⠀⠨", "⠀⢐", "⠀⡐", "⠀⠠", "⠀⢀", "⠀⡀"];
            readonly dots13: readonly ["⣼", "⣹", "⢻", "⠿", "⡟", "⣏", "⣧", "⣶"];
            readonly dots14: readonly ["⠉⠉", "⠈⠙", "⠀⠹", "⠀⢸", "⠀⣰", "⢀⣠", "⣀⣀", "⣄⡀", "⣆⠀", "⡇⠀", "⠏⠀", "⠋⠁"];
            readonly dots8Bit: readonly ["⠀", "⠁", "⠂", "⠃", "⠄", "⠅", "⠆", "⠇", "⡀", "⡁", "⡂", "⡃", "⡄", "⡅", "⡆", "⡇", "⠈", "⠉", "⠊", "⠋", "⠌", "⠍", "⠎", "⠏", "⡈", "⡉", "⡊", "⡋", "⡌", "⡍", "⡎", "⡏", "⠐", "⠑", "⠒", "⠓", "⠔", "⠕", "⠖", "⠗", "⡐", "⡑", "⡒", "⡓", "⡔", "⡕", "⡖", "⡗", "⠘", "⠙", "⠚", "⠛", "⠜", "⠝", "⠞", "⠟", "⡘", "⡙", "⡚", "⡛", "⡜", "⡝", "⡞", "⡟", "⠠", "⠡", "⠢", "⠣", "⠤", "⠥", "⠦", "⠧", "⡠", "⡡", "⡢", "⡣", "⡤", "⡥", "⡦", "⡧", "⠨", "⠩", "⠪", "⠫", "⠬", "⠭", "⠮", "⠯", "⡨", "⡩", "⡪", "⡫", "⡬", "⡭", "⡮", "⡯", "⠰", "⠱", "⠲", "⠳", "⠴", "⠵", "⠶", "⠷", "⡰", "⡱", "⡲", "⡳", "⡴", "⡵", "⡶", "⡷", "⠸", "⠹", "⠺", "⠻", "⠼", "⠽", "⠾", "⠿", "⡸", "⡹", "⡺", "⡻", "⡼", "⡽", "⡾", "⡿", "⢀", "⢁", "⢂", "⢃", "⢄", "⢅", "⢆", "⢇", "⣀", "⣁", "⣂", "⣃", "⣄", "⣅", "⣆", "⣇", "⢈", "⢉", "⢊", "⢋", "⢌", "⢍", "⢎", "⢏", "⣈", "⣉", "⣊", "⣋", "⣌", "⣍", "⣎", "⣏", "⢐", "⢑", "⢒", "⢓", "⢔", "⢕", "⢖", "⢗", "⣐", "⣑", "⣒", "⣓", "⣔", "⣕", "⣖", "⣗", "⢘", "⢙", "⢚", "⢛", "⢜", "⢝", "⢞", "⢟", "⣘", "⣙", "⣚", "⣛", "⣜", "⣝", "⣞", "⣟", "⢠", "⢡", "⢢", "⢣", "⢤", "⢥", "⢦", "⢧", "⣠", "⣡", "⣢", "⣣", "⣤", "⣥", "⣦", "⣧", "⢨", "⢩", "⢪", "⢫", "⢬", "⢭", "⢮", "⢯", "⣨", "⣩", "⣪", "⣫", "⣬", "⣭", "⣮", "⣯", "⢰", "⢱", "⢲", "⢳", "⢴", "⢵", "⢶", "⢷", "⣰", "⣱", "⣲", "⣳", "⣴", "⣵", "⣶", "⣷", "⢸", "⢹", "⢺", "⢻", "⢼", "⢽", "⢾", "⢿", "⣸", "⣹", "⣺", "⣻", "⣼", "⣽", "⣾", "⣿"];
            readonly dotsCircle: readonly ["⢎ ", "⠎⠁", "⠊⠑", "⠈⠱", " ⡱", "⢀⡰", "⢄⡠", "⢆⡀"];
            readonly dotsCircle2: readonly ["⢎⡰", "⢎⡡", "⢎⡑", "⢎⠱", "⠎⡱", "⢊⡱", "⢌⡱", "⢆⡱"];
            readonly sand: readonly ["⠁", "⠂", "⠄", "⡀", "⡈", "⡐", "⡠", "⣀", "⣁", "⣂", "⣄", "⣌", "⣔", "⣤", "⣥", "⣦", "⣮", "⣶", "⣷", "⣿", "⡿", "⠿", "⢟", "⠟", "⡛", "⠛", "⠫", "⢋", "⠋", "⠍", "⡉", "⠉", "⠑", "⠡", "⢁"];
            readonly line: readonly ["-", "\\", "|", "/"];
            readonly line2: readonly ["⠂", "-", "–", "—", "–", "-"];
            readonly pipe: readonly ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"];
            readonly simpleDots: readonly [".  ", ".. ", "...", "   "];
            readonly simpleDotsScrolling: readonly [".  ", ".. ", "...", " ..", "  .", "   "];
            readonly star: readonly ["✶", "✸", "✹", "✺", "✹", "✷"];
            readonly star2: readonly ["+", "x", "*"];
            readonly flip: readonly ["_", "_", "_", "-", "`", "`", "'", "´", "-", "_", "_", "_"];
            readonly hamburger: readonly ["☱", "☲", "☴"];
            readonly growVertical: readonly ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"];
            readonly growHorizontal: readonly ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"];
            readonly balloon: readonly [" ", ".", "o", "O", "@", "*", " "];
            readonly balloon2: readonly [".", "o", "O", "°", "O", "o", "."];
            readonly noise: readonly ["▓", "▒", "░"];
            readonly bounce: readonly ["⠁", "⠂", "⠄", "⠂"];
            readonly bounce2: readonly ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"];
            readonly boxBounce: readonly ["▖", "▘", "▝", "▗"];
            readonly boxBounce2: readonly ["▌", "▀", "▐", "▄"];
            readonly triangle: readonly ["◢", "◣", "◤", "◥"];
            readonly binary: readonly ["010010", "001100", "100101", "111010", "111101", "010111", "101011", "111000", "110011", "110101"];
            readonly arc: readonly ["◜", "◠", "◝", "◞", "◡", "◟"];
            readonly circle: readonly ["◡", "⊙", "◠"];
            readonly squareCorners: readonly ["◰", "◳", "◲", "◱"];
            readonly circleQuarters: readonly ["◴", "◷", "◶", "◵"];
            readonly circleHalves: readonly ["◐", "◓", "◑", "◒"];
            readonly squish: readonly ["╫", "╪"];
            readonly toggle: readonly ["⊶", "⊷"];
            readonly toggle2: readonly ["▫", "▪"];
            readonly toggle3: readonly ["□", "■"];
            readonly toggle4: readonly ["■", "□", "▪", "▫"];
            readonly toggle5: readonly ["▮", "▯"];
            readonly toggle7: readonly ["⦾", "⦿"];
            readonly toggle8: readonly ["◍", "◌"];
            readonly toggle9: readonly ["◉", "◎"];
            readonly toggle11: readonly ["⧇", "⧆"];
            readonly toggle12: readonly ["☗", "☖"];
            readonly toggle13: readonly ["=", "*", "-"];
            readonly arrow: readonly ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"];
            readonly arrow2: readonly ["⬆️ ", "↗️ ", "➡️ ", "↘️ ", "⬇️ ", "↙️ ", "⬅️ ", "↖️ "];
            readonly arrow3: readonly ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"];
            readonly bouncingBar: readonly ["[    ]", "[=   ]", "[==  ]", "[=== ]", "[====]", "[ ===]", "[  ==]", "[   =]", "[    ]", "[   =]", "[  ==]", "[ ===]", "[====]", "[=== ]", "[==  ]", "[=   ]"];
            readonly bouncingBall: readonly ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)", "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )"];
            readonly smiley: readonly ["😄 ", "😝 "];
            readonly monkey: readonly ["🙈 ", "🙈 ", "🙉 ", "🙊 "];
            readonly hearts: readonly ["💛 ", "💙 ", "💜 ", "💚 ", "❤️ "];
            readonly clock: readonly ["🕛 ", "🕐 ", "🕑 ", "🕒 ", "🕓 ", "🕔 ", "🕕 ", "🕖 ", "🕗 ", "🕘 ", "🕙 ", "🕚 "];
            readonly earth: readonly ["🌍 ", "🌎 ", "🌏 "];
            readonly material: readonly ["█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "███████▁▁▁▁▁▁▁▁▁▁▁▁▁", "████████▁▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "██████████▁▁▁▁▁▁▁▁▁▁", "███████████▁▁▁▁▁▁▁▁▁", "█████████████▁▁▁▁▁▁▁", "██████████████▁▁▁▁▁▁", "██████████████▁▁▁▁▁▁", "▁██████████████▁▁▁▁▁", "▁██████████████▁▁▁▁▁", "▁██████████████▁▁▁▁▁", "▁▁██████████████▁▁▁▁", "▁▁▁██████████████▁▁▁", "▁▁▁▁█████████████▁▁▁", "▁▁▁▁██████████████▁▁", "▁▁▁▁██████████████▁▁", "▁▁▁▁▁██████████████▁", "▁▁▁▁▁██████████████▁", "▁▁▁▁▁██████████████▁", "▁▁▁▁▁▁██████████████", "▁▁▁▁▁▁██████████████", "▁▁▁▁▁▁▁█████████████", "▁▁▁▁▁▁▁█████████████", "▁▁▁▁▁▁▁▁████████████", "▁▁▁▁▁▁▁▁████████████", "▁▁▁▁▁▁▁▁▁███████████", "▁▁▁▁▁▁▁▁▁███████████", "▁▁▁▁▁▁▁▁▁▁██████████", "▁▁▁▁▁▁▁▁▁▁██████████", "▁▁▁▁▁▁▁▁▁▁▁▁████████", "▁▁▁▁▁▁▁▁▁▁▁▁▁███████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████", "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████", "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███", "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███", "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███", "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██", "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█", "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█", "██████▁▁▁▁▁▁▁▁▁▁▁▁▁█", "████████▁▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "█████████▁▁▁▁▁▁▁▁▁▁▁", "███████████▁▁▁▁▁▁▁▁▁", "████████████▁▁▁▁▁▁▁▁", "████████████▁▁▁▁▁▁▁▁", "██████████████▁▁▁▁▁▁", "██████████████▁▁▁▁▁▁", "▁██████████████▁▁▁▁▁", "▁██████████████▁▁▁▁▁", "▁▁▁█████████████▁▁▁▁", "▁▁▁▁▁████████████▁▁▁", "▁▁▁▁▁████████████▁▁▁", "▁▁▁▁▁▁███████████▁▁▁", "▁▁▁▁▁▁▁▁█████████▁▁▁", "▁▁▁▁▁▁▁▁█████████▁▁▁", "▁▁▁▁▁▁▁▁▁█████████▁▁", "▁▁▁▁▁▁▁▁▁█████████▁▁", "▁▁▁▁▁▁▁▁▁▁█████████▁", "▁▁▁▁▁▁▁▁▁▁▁████████▁", "▁▁▁▁▁▁▁▁▁▁▁████████▁", "▁▁▁▁▁▁▁▁▁▁▁▁███████▁", "▁▁▁▁▁▁▁▁▁▁▁▁███████▁", "▁▁▁▁▁▁▁▁▁▁▁▁▁███████", "▁▁▁▁▁▁▁▁▁▁▁▁▁███████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁", "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"];
            readonly moon: readonly ["🌑 ", "🌒 ", "🌓 ", "🌔 ", "🌕 ", "🌖 ", "🌗 ", "🌘 "];
            readonly runner: readonly ["🚶 ", "🏃 "];
            readonly pong: readonly ["▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌", "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌", "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌", "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌", "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌", "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌", "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌", "▐ ⡀      ▌", "▐⠠       ▌"];
            readonly shark: readonly ["▐|\\____________▌", "▐_|\\___________▌", "▐__|\\__________▌", "▐___|\\_________▌", "▐____|\\________▌", "▐_____|\\_______▌", "▐______|\\______▌", "▐_______|\\_____▌", "▐________|\\____▌", "▐_________|\\___▌", "▐__________|\\__▌", "▐___________|\\_▌", "▐____________|\\▌", "▐____________/|▌", "▐___________/|_▌", "▐__________/|__▌", "▐_________/|___▌", "▐________/|____▌", "▐_______/|_____▌", "▐______/|______▌", "▐_____/|_______▌", "▐____/|________▌", "▐___/|_________▌", "▐__/|__________▌", "▐_/|___________▌", "▐/|____________▌"];
            readonly dqpb: readonly ["d", "q", "p", "b"];
            readonly christmas: readonly ["🌲", "🎄"];
            readonly grenade: readonly ["،  ", "′  ", " ´ ", " ‾ ", "  ⸌", "  ⸊", "  |", "  ⁎", "  ⁕", " ෴ ", "  ⁓", "   ", "   ", "   "];
            readonly point: readonly ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"];
            readonly layer: readonly ["-", "=", "≡"];
            readonly betaWave: readonly ["ρββββββ", "βρβββββ", "ββρββββ", "βββρβββ", "ββββρββ", "βββββρβ", "ββββββρ"];
            readonly fingerDance: readonly ["🤘 ", "🤟 ", "🖖 ", "✋ ", "🤚 ", "👆 "];
            readonly mindblown: readonly ["😐 ", "😐 ", "😮 ", "😮 ", "😦 ", "😦 ", "😧 ", "😧 ", "🤯 ", "💥 ", "✨ ", "　 ", "　 ", "　 "];
            readonly speaker: readonly ["🔈 ", "🔉 ", "🔊 ", "🔉 "];
            readonly orangePulse: readonly ["🔸 ", "🔶 ", "🟠 ", "🟠 ", "🔶 "];
            readonly bluePulse: readonly ["🔹 ", "🔷 ", "🔵 ", "🔵 ", "🔷 "];
            readonly orangeBluePulse: readonly ["🔸 ", "🔶 ", "🟠 ", "🟠 ", "🔶 ", "🔹 ", "🔷 ", "🔵 ", "🔵 ", "🔷 "];
            readonly timeTravel: readonly ["🕛 ", "🕚 ", "🕙 ", "🕘 ", "🕗 ", "🕖 ", "🕕 ", "🕔 ", "🕓 ", "🕒 ", "🕑 ", "🕐 "];
            readonly aesthetic: readonly ["▱▱▱▱▱▱▱", "▰▱▱▱▱▱▱", "▰▰▱▱▱▱▱", "▰▰▰▱▱▱▱", "▰▰▰▰▱▱▱", "▰▰▰▰▰▱▱", "▰▰▰▰▰▰▱", "▰▰▰▰▰▰▰"];
            readonly dwarfFortress: readonly [" ██████£££  ", "☺██████£££  ", "☺██████£££  ", "☺▓█████£££  ", "☺▓█████£££  ", "☺▒█████£££  ", "☺▒█████£££  ", "☺░█████£££  ", "☺░█████£££  ", "☺ █████£££  ", " ☺█████£££  ", " ☺█████£££  ", " ☺▓████£££  ", " ☺▓████£££  ", " ☺▒████£££  ", " ☺▒████£££  ", " ☺░████£££  ", " ☺░████£££  ", " ☺ ████£££  ", "  ☺████£££  ", "  ☺████£££  ", "  ☺▓███£££  ", "  ☺▓███£££  ", "  ☺▒███£££  ", "  ☺▒███£££  ", "  ☺░███£££  ", "  ☺░███£££  ", "  ☺ ███£££  ", "   ☺███£££  ", "   ☺███£££  ", "   ☺▓██£££  ", "   ☺▓██£££  ", "   ☺▒██£££  ", "   ☺▒██£££  ", "   ☺░██£££  ", "   ☺░██£££  ", "   ☺ ██£££  ", "    ☺██£££  ", "    ☺██£££  ", "    ☺▓█£££  ", "    ☺▓█£££  ", "    ☺▒█£££  ", "    ☺▒█£££  ", "    ☺░█£££  ", "    ☺░█£££  ", "    ☺ █£££  ", "     ☺█£££  ", "     ☺█£££  ", "     ☺▓£££  ", "     ☺▓£££  ", "     ☺▒£££  ", "     ☺▒£££  ", "     ☺░£££  ", "     ☺░£££  ", "     ☺ £££  ", "      ☺£££  ", "      ☺£££  ", "      ☺▓££  ", "      ☺▓££  ", "      ☺▒££  ", "      ☺▒££  ", "      ☺░££  ", "      ☺░££  ", "      ☺ ££  ", "       ☺££  ", "       ☺££  ", "       ☺▓£  ", "       ☺▓£  ", "       ☺▒£  ", "       ☺▒£  ", "       ☺░£  ", "       ☺░£  ", "       ☺ £  ", "        ☺£  ", "        ☺£  ", "        ☺▓  ", "        ☺▓  ", "        ☺▒  ", "        ☺▒  ", "        ☺░  ", "        ☺░  ", "        ☺   ", "        ☺  &", "        ☺ ☼&", "       ☺ ☼ &", "       ☺☼  &", "      ☺☼  & ", "      ‼   & ", "     ☺   &  ", "    ‼    &  ", "   ☺    &   ", "  ‼     &   ", " ☺     &    ", "‼      &    ", "      &     ", "      &     ", "     &   ░  ", "     &   ▒  ", "    &    ▓  ", "    &    £  ", "   &    ░£  ", "   &    ▒£  ", "  &     ▓£  ", "  &     ££  ", " &     ░££  ", " &     ▒££  ", "&      ▓££  ", "&      £££  ", "      ░£££  ", "      ▒£££  ", "      ▓£££  ", "      █£££  ", "     ░█£££  ", "     ▒█£££  ", "     ▓█£££  ", "     ██£££  ", "    ░██£££  ", "    ▒██£££  ", "    ▓██£££  ", "    ███£££  ", "   ░███£££  ", "   ▒███£££  ", "   ▓███£££  ", "   ████£££  ", "  ░████£££  ", "  ▒████£££  ", "  ▓████£££  ", "  █████£££  ", " ░█████£££  ", " ▒█████£££  ", " ▓█████£££  ", " ██████£££  ", " ██████£££  "];
        };
        static start(steps?: readonly string[]): Spinner;
        private interval;
        private before;
        private spinnerIndex;
        private constructor();
        stop(): number;
    }
    export const HIDE_CURSOR = "\u001B[?25l";
    export const SHOW_CURSOR = "\u001B[?25h";
    export namespace Timer {
        export interface Format {
            start(): void;
            tickSec(secs: number): void;
            end(): void;
            requiresTTY(): boolean;
        }
        /**
         * Small console timer, for when you cannot move the cursor. It prints a .
         * every second, every 5 seconds it prints a !, and every 10 it prints the next
         * digit.
         */
        export class NoTTY implements Format {
            start(): void;
            tickSec(secs: number): void;
            end(): void;
            requiresTTY(): boolean;
        }
        export class Seconds implements Format {
            private suffix;
            private lastLength;
            constructor(suffix?: string);
            start(): void;
            tickSec(secs: number): void;
            end(): void;
            requiresTTY(): boolean;
        }
        export class Colon implements Format {
            private suffix;
            private lastLength;
            constructor(suffix?: string);
            start(): void;
            tickSec(secs: number): void;
            end(): void;
            requiresTTY(): boolean;
        }
        /**
         * Usage:
         * ```
         * const timer = Timer.start();
         * // Do some slow work
         * const duration = timer.stop();
         * ```
         */
        class Timer {
            private format;
            private interval;
            private before;
            constructor(format: Format);
            stop(): number;
        }
        export function start(format?: NoTTY): Timer;
        export {};
    }
    export const FG_BLACK = "\u001B[30m";
    export const FG_RED = "\u001B[31m";
    export const FG_GREEN = "\u001B[32m";
    export const FG_YELLOW = "\u001B[33m";
    export const FG_BLUE = "\u001B[34m";
    export const FG_PURPLE = "\u001B[35m";
    export const FG_CYAN = "\u001B[36m";
    export const FG_WHITE = "\u001B[37m";
    export const FG_GRAY = "\u001B[90m";
    export const FG_DEFAULT = "\u001B[0m";
    export const BG_BLACK = "\u001B[40m";
    export const BG_RED = "\u001B[41m";
    export const BG_GREEN = "\u001B[42m";
    export const BG_YELLOW = "\u001B[43m";
    export const BG_BLUE = "\u001B[44m";
    export const BG_PURPLE = "\u001B[45m";
    export const BG_CYAN = "\u001B[46m";
    export const BG_WHITE = "\u001B[47m";
    export const BG_GRAY = "\u001B[100m";
    export const BG_DEFAULT = "\u001B[49m";
    export const STRIKE = "\u001B[9m";
    export const NO_STRIKE = "\u001B[29m";
    export const UP = "\u001B[A";
    export const DOWN = "\u001B[B";
    export const LEFT = "\u001B[D";
    export const RIGHT = "\u001B[C";
    export function lengthWithoutInvisible(str: string, invisibleChars?: Set<string>): number;
    export function withoutInvisible(str: string, invisibleChars?: Set<string>): string;
    export const print: (...args: [str: string] | [str: string, {
        prefix?: string | undefined;
        prefixColor?: string | undefined;
        openEnded?: boolean | undefined;
        invisibleChars?: Set<string> | undefined;
    }]) => void;
    export const padStart: (str: string, width: number, c?: string, invisibleChars?: Set<string>) => string;
    export const padEnd: (str: string, width: number, c?: string, invisibleChars?: Set<string>) => string;
    export const padBoth: (...args: [str: string, width: number] | [str: string, width: number, {
        c?: string | undefined;
        invisibleChars?: Set<string> | undefined;
        margin?: [boolean, boolean] | undefined;
    }]) => string;
    export const alignRight: (str: string, width: number, c?: string, invisibleChars?: Set<string>) => string;
    export const alignLeft: (str: string, width: number, c?: string, invisibleChars?: Set<string>) => string;
    export const alignCenter: (...args: [str: string, width: number] | [str: string, width: number, {
        c?: string | undefined;
        invisibleChars?: Set<string> | undefined;
        margin?: [boolean, boolean] | undefined;
    }]) => string;
    class Table {
        private config;
        private rows;
        constructor(columns: readonly string[], config: [number, (s: string) => string][]);
        addDivider(): this;
        addRow(...values: readonly string[]): this;
        toString(): string;
    }
    export namespace AsciiTable {
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
        function simple(header: string, invisible?: Set<string>): Table;
        function advanced<T>(headerWidth: {
            [header: string]: number;
        }, data: T[], format: (t: T) => string[], after: (row: string, t: T) => void, prefix?: string): string;
    }
    export const lowercase = "abcdefghijklmnopqrstuvwxyz";
    export const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    export const digits = "0123456789";
    export const underscore = "_";
    export const dash = "-";
    export const filename: string;
    export const all: string;
    export function generateString(length: number, ...alphabets: [string, ...string[]]): string;
    /**
     * @param str
     * @param radix
     * @returns [left, right | "", radix | ""]
     */
    export function partitionLeft(str: string, radix: string): [string, string, string];
    /**
     * @param str
     * @param radix
     * @returns [left, right | "", radix | ""]
     */
    export function partitionRight(str: string, radix: string): [string, string, string];
    export function toFolderName(str: string): string;
    export function list(strs: readonly string[]): string;
    export function plural(word: string, n?: number): string;
    export function order(n: number): string;
    export function capitalize(str: string): string;
    export function semanticVersionLessThan(old: string, new_: string): boolean;
    export function censor(str: string): string;
    export function padNumber(n: number): string;
    export const MONTHS: string[];
    export function prettyDate(d: Date): string;
    /**
     * Parse a boolean input value.
     *
     * @param bool input to parse
     * @returns false for any casing of the string false, the value null or undefined. Otherwise returns true.
     */
    export function parseBool(bool: string | null | undefined): boolean;
    export {};
}
export declare function addMinutes(minutes: number, date?: Date): Date;
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
export declare function varArgsBeforeOptional<T, L, R>(isOpt: (a: T | L) => a is L, f: (ts: T[], l: L | undefined) => R): <R_1 extends [] | [L], V extends [...T[], ...R_1]>(...v: V) => R;
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
export declare function varArgsFirst<T, L, R>(f: (ts: T[], l: L) => R): <V extends [...T[], L]>(...v: V) => R;
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
export declare function constify<T, R extends unknown[]>(...args: [...R, (...r: R) => T]): T;
type ExceptionHandler = (e: any) => unknown;
type TryBody<E> = (Start: <A extends unknown[], T>(func: Raiser<E, A, T>, ...a: A) => Promise<T>) => Promise<void>;
type FuncBody<A extends unknown[], T> = (...a: A) => Promise<T>;
type HellRaiser<E extends string, A extends unknown[], T> = (Raise: (type: E, data?: any) => never) => FuncBody<A, T>;
/**
 * Function that raises checked exceptions. To call it use `Start(foo)`
 */
interface Raiser<E, A extends unknown[], T> {
}
/**
 * Define function that raises checked exceptions. To call it use `Start(foo)(arguments)`
 */
export declare function Raises<E extends string[]>(...e: E): <A extends unknown[], T>(f: HellRaiser<E[number], A, T>) => Raiser<E[number], A, T>;
declare class Catcher<M> {
    private handler;
    constructor(handler: (next: ExceptionHandler) => ExceptionHandler);
    /**
     * Handle another type of checked exception
     * @param type the checked exception to catch, eg. "FileNotFound"
     * @param handler how to handle the exception
     * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
     */
    Catch<S extends string>(type: S, handler: ExceptionHandler): Catcher<M | S>;
    /**
     * @param body code that might raise checked exceptions.
     * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
     */
    Try(body: TryBody<M>): Promise<void>;
}
/**
 * Start a Catch-Try block that can handle checked exceptions, end with `.Try()`
 * @param type the checked exception to catch, eg. "FileNotFound"
 * @param handler how to handle the exception
 * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
 */
export declare function Catch<S extends string>(type: S, handler: ExceptionHandler): Catcher<S>;
/**
 * Run a function inside a Catch-Try block that handles all relevant checked exceptions.
 * @param func a function defined with `Raises()`
 * @param args arguments to the function
 * @returns a Promise that wont cause "uncaught promise" from any checked exception
 */
export declare function Start<A extends unknown[], T>(func: Raiser<never, A, T>, ...args: A): Promise<T>;
export declare function gensym(): string;
export declare function withOptions<T extends unknown[], R, O extends {
    [key: string]: unknown;
}>(defaults: O, f: (opts: O, ...args: T) => R): (...args: T | [...T, { [k in keyof O]?: O[k]; }]) => R;
export {};
