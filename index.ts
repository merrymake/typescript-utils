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
export function Promise_all<T extends readonly unknown[] | []>(
  ...arr: T & Promise<unknown>[]
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return Promise.all(arr);
}

export function randomElement<T>(arr: readonly T[], rng = Math.random) {
  return arr.length < 1 ? arr[0] : arr[~~(arr.length * rng())];
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export namespace Arr {
  export function random<T>(arr: readonly T[]): { value: T; index: number } {
    const index = ~~(Math.random() * arr.length);
    return { value: arr[index], index };
  }
  export namespace Sync {
    export function findFirst<T>(
      arr: readonly T[],
      f: (_: T, i: number) => boolean
    ) {
      for (let i = 0; i < arr.length; i++) {
        if (f(arr[i], i)) return { value: arr[i], index: i };
      }
      return undefined;
    }
    export function findLast<T>(
      arr: readonly T[],
      f: (_: T, i: number) => boolean
    ) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (f(arr[i], i)) return { value: arr[i], index: i };
      }
      return undefined;
    }
    export function forEach<A>(
      arr: readonly A[],
      f: (s: A, i: number) => unknown
    ) {
      findFirst(arr, (e, i) => {
        f(e, i);
        return false;
      });
    }
    export function map<A, B>(
      arr: readonly A[],
      f: (s: A, i: number) => B,
      actions?: { first?: (s: A) => B; last?: (s: A) => B; ends?: (s: A) => B }
    ) {
      const result = new Array<B>(arr.length);
      forEach(arr, (v, i) => {
        if (actions?.first !== undefined && i === 0)
          result[i] = actions?.first(v);
        else if (actions?.last !== undefined && i === arr.length - 1)
          result[i] = actions?.last(v);
        else if (
          actions?.ends !== undefined &&
          (i === 0 || i === arr.length - 1)
        )
          result[i] = actions?.ends(v);
        else result[i] = f(arr[i], i);
      });
      return result;
    }
    export function flatMap<A, B>(
      arr: readonly A[],
      f: (s: A, i: number) => B[],
      actions?: {
        first?: (s: A) => B[];
        last?: (s: A) => B[];
        ends?: (s: A) => B[];
      }
    ) {
      const result: B[] = [];
      forEach(arr, (v, i) => {
        if (actions?.first !== undefined && i === 0)
          result.push(...actions?.first(v));
        else if (actions?.last !== undefined && i === arr.length - 1)
          result.push(...actions?.last(v));
        else if (
          actions?.ends !== undefined &&
          (i === 0 || i === arr.length - 1)
        )
          result.push(...actions?.ends(v));
        else result.push(...f(arr[i], i));
      });
      return result;
    }
    export function partition<
      T,
      Yes extends string = "yes",
      No extends string = "no"
    >(
      arr: readonly T[],
      f: (_: T, i: number) => boolean,
      opts?: {
        yesField?: Yes;
        noField?: No;
      }
    ): { [k in Yes]: T[] } & {
      [k in No]: T[];
    } {
      const yf: Yes = opts?.yesField || ("yes" as Yes);
      const nf: No = opts?.noField || ("no" as No);
      const result: { [k in Yes]: T[] } & {
        [k in No]: T[];
      } = (() => {
        const result: any = {};
        result[yf] = [];
        result[nf] = [];
        return result;
      })();
      forEach(arr, (k, i) =>
        f(k, i) === true ? result[yf].push(k) : result[nf].push(k)
      );
      return result;
    }
    export function filter<T>(
      arr: readonly T[],
      f: (_: T, i: number) => boolean
    ) {
      return partition(arr, f).yes;
    }
    export function zip<A, B, C>(
      as: readonly A[],
      bs: readonly B[],
      f: (a: A, b: B, i: number) => C,
      actions?: {
        aRest?: (a: A, i: number) => C;
        bRest?: (b: B, i: number) => C;
      }
    ) {
      const len =
        actions?.aRest !== undefined && actions?.bRest !== undefined
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
            ? actions!.aRest!(as[i], i)
            : actions!.bRest!(bs[i], i);
      });
      return result;
    }
    export function some<T>(
      arr: readonly T[],
      f: (_: T, i: number) => boolean
    ) {
      return findFirst(arr, f) !== undefined;
    }
    export function all<T>(arr: readonly T[], f: (_: T, i: number) => boolean) {
      return !some(arr, (t, i) => !f(t, i));
    }
    export function reduce<A, B>(
      arr: readonly A[],
      f: (acc: B, s: A, i: number) => B,
      base: B
    ) {
      let accumulator: B = base;
      forEach(arr, (v, i) => {
        accumulator = f(accumulator, arr[i], i);
      });
      return accumulator;
    }
    export function maxBy<T>(
      arr: readonly T[],
      f: (t: T) => number
    ): { element: T; value: number; index: number } | undefined {
      let res: { element: T; index: number; value: number } | undefined =
        undefined;
      forEach(arr, (element, index) => {
        const value = f(element);
        if (res === undefined || res.value < value) {
          res = { element, index, value };
        }
      });
      return res;
    }
    export function minBy<T>(
      arr: readonly T[],
      f: (t: T) => number
    ): { element: T; value: number; index: number } | undefined {
      let res: { element: T; index: number; value: number } | undefined =
        undefined;
      forEach(arr, (element, index) => {
        const value = f(element);
        if (res === undefined || res.value > value) {
          res = { element, index, value };
        }
      });
      return res;
    }
    export const max = (arr: readonly number[]) => maxBy(arr, (x) => x);
    export const min = (arr: readonly number[]) => minBy(arr, (x) => x);
    export function toObject<K extends readonly string[], T>(
      keys: K,
      val: (k: K[number]) => T
    ) {
      const result: { [key: string]: T } = {};
      forEach(keys, (k) => (result[k] = val(k)));
      return result as { [key in K[number]]: T };
    }
  }
  export function Async(maxConcurrent = 1) {
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
    async function worker(tasks: (() => Promise<boolean>)[]) {
      let t: (() => Promise<boolean>) | undefined;
      while ((t = tasks.splice(0, 1)[0]) !== undefined) {
        const done = await t().then();
        if (done === true) tasks.splice(0, tasks.length);
      }
    }
    async function findAny<T>(
      arr: readonly T[],
      f: (_: T, i: number) => Promise<boolean>
    ) {
      let result: { value: T; index: number } | undefined = undefined;
      const tasks = arr.map((x, i) => async () => {
        if ((await f(x, i).then()) === true) {
          result = { value: x, index: i };
          return true;
        } else {
          return false;
        }
      });
      await Promise_all(
        ...new Array(maxConcurrent).fill(0).map((_) => worker(tasks))
      ).then();
      return result;
    }
    async function forEach<A>(
      arr: readonly A[],
      f: (s: A, i: number) => Promise<unknown>
    ) {
      await findAny(arr, async (a, i) => {
        await f(a, i);
        return false;
      });
    }
    async function map<A, B>(
      arr: readonly A[],
      f: (s: A, i: number) => Promise<B>,
      actions?: {
        first?: (s: A) => Promise<B>;
        last?: (s: A) => Promise<B>;
        ends?: (s: A) => Promise<B>;
      }
    ) {
      const result = new Array<B>(arr.length);
      await forEach(arr, async (v, i) => {
        if (actions?.first !== undefined && i === 0)
          result[i] = await actions.first(v);
        else if (actions?.last !== undefined && i === arr.length - 1)
          result[i] = await actions.last(v);
        else if (
          actions?.ends !== undefined &&
          (i === 0 || i === arr.length - 1)
        )
          result[i] = await actions.ends(v);
        else result[i] = await f(arr[i], i);
      });
      return result;
    }
    async function flatMap<A, B>(
      arr: readonly A[],
      f: (s: A, i: number) => Promise<B[]>,
      actions?: {
        first?: (s: A) => Promise<B[]>;
        last?: (s: A) => Promise<B[]>;
        ends?: (s: A) => Promise<B[]>;
      }
    ) {
      const result: B[] = [];
      await forEach(arr, async (v, i) => {
        if (actions?.first !== undefined && i === 0)
          result.push(...(await actions.first(v)));
        else if (actions?.last !== undefined && i === arr.length - 1)
          result.push(...(await actions.last(v)));
        else if (
          actions?.ends !== undefined &&
          (i === 0 || i === arr.length - 1)
        )
          result.push(...(await actions.ends(v)));
        else result.push(...(await f(arr[i], i)));
      });
      return result;
    }
    async function partition<
      T,
      Yes extends string = "yes",
      No extends string = "no"
    >(
      arr: readonly T[],
      f: (_: T, i: number) => Promise<boolean>,
      opts?: {
        yesField?: Yes;
        noField?: No;
      }
    ): Promise<
      { [k in Yes]: T[] } & {
        [k in No]: T[];
      }
    > {
      const yf: Yes = opts?.yesField || ("yes" as Yes);
      const nf: No = opts?.noField || ("no" as No);
      const result: { [k in Yes]: T[] } & {
        [k in No]: T[];
      } = (() => {
        const result: any = {};
        result[yf] = [];
        result[nf] = [];
        return result;
      })();
      await forEach(arr, async (k, i) =>
        (await f(k, i)) === true ? result[yf].push(k) : result[nf].push(k)
      );
      return result;
    }
    async function filter<T>(arr: readonly T[], f: (_: T) => Promise<boolean>) {
      return (await partition(arr, f)).yes;
    }
    async function zip<A, B, C>(
      as: readonly A[],
      bs: readonly B[],
      f: (a: A, b: B, i: number) => Promise<C>,
      actions?: {
        aRest?: (a: A, i: number) => Promise<C>;
        bRest?: (b: B, i: number) => Promise<C>;
      }
    ) {
      const len =
        actions?.aRest !== undefined && actions?.bRest !== undefined
          ? Math.max(as.length, bs.length)
          : actions?.aRest !== undefined
          ? as.length
          : actions?.bRest !== undefined
          ? bs.length
          : Math.min(as.length, bs.length);
      const result = new Array<C>(len);
      await forEach(result, async (_, i) => {
        result[i] =
          i < as.length && i < bs.length
            ? await f(as[i], bs[i], i)
            : i < as.length
            ? await actions!.aRest!(as[i], i)
            : await actions!.bRest!(bs[i], i);
      });
      return result;
    }
    async function some<T>(
      arr: readonly T[],
      f: (_: T, i: number) => Promise<boolean>
    ) {
      return findAny(arr, f) !== undefined;
    }
    async function all<T>(
      arr: readonly T[],
      f: (_: T, i: number) => Promise<boolean>
    ) {
      return !some(arr, async (t, i) => !(await f(t, i)));
    }
    async function maxBy<T>(
      arr: readonly T[],
      f: (t: T) => Promise<number>
    ): Promise<{ element: T; value: number; index: number } | undefined> {
      let res: { element: T; index: number; value: number } | undefined =
        undefined;
      forEach(arr, async (element, index) => {
        const value = await f(element);
        if (res === undefined || res.value < value) {
          res = { element, index, value };
        }
      });
      return res;
    }
    async function minBy<T>(
      arr: readonly T[],
      f: (t: T) => Promise<number>
    ): Promise<{ element: T; value: number; index: number } | undefined> {
      let res: { element: T; index: number; value: number } | undefined =
        undefined;
      forEach(arr, async (element, index) => {
        const value = await f(element);
        if (res === undefined || res.value > value) {
          res = { element, index, value };
        }
      });
      return res;
    }
    async function toObject<K extends readonly string[], T>(
      keys: K,
      val: (k: K[number]) => Promise<T>
    ) {
      const result: { [key: string]: T } = {};
      await forEach(keys, async (k) => (result[k] = await val(k)));
      return result as { [key in K[number]]: T };
    }
  }
}

interface DotHelper {
  dot<K extends string>(k: K): DotHelper;
  as<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(
    ...ts: K
  ): IsTypeHelper[K[number]] | undefined;
}
class Undefined implements DotHelper {
  static readonly instance = new Undefined();
  private constructor() {}
  dot<K extends string>(k: K) {
    return this;
  }
  as<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(...ts: K) {
    return undefined;
  }
}
class Possible implements DotHelper {
  constructor(private v: unknown) {}
  dot<K extends string>(k: K): DotHelper {
    return Obj.hasKey<K>(k, this.v)
      ? new Possible(this.v[k])
      : Undefined.instance;
  }
  as<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(...ts: K) {
    return is(this.v, ...ts) ? this.v : undefined;
  }
}

export namespace Is {
  class Check<T> {
    constructor(private ch: (o: unknown) => o is T) {}
    in<K extends string>(k: K) {
      return new Check<{ [k in K]: T }>(
        (o): o is { [k in K]: T } => Obj.hasKey(k, o) && this.ch(o[k])
      );
    }
    check(o: unknown) {
      return this.ch(o);
    }
  }
  export function a<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(
    ...ts: K
  ) {
    return new Check<IsTypeHelper[K[number]]>((o) => is(o, ...ts));
  }
}

export namespace Obj {
  export function keys<T extends {}>(o: T): Array<keyof T & string> {
    return Object.keys(o) as any;
  }
  export function hasKey<K extends string, T = { [k in K]: unknown }>(
    k: K,
    obj: T | unknown
  ): obj is T {
    return is(obj, "object") && k in obj;
  }
  export function dot<K extends string>(obj: unknown, k: K): DotHelper {
    return Obj.hasKey<K>(k, obj) ? new Possible(obj[k]) : Undefined.instance;
  }
  export function access<K extends string>(
    obj: unknown,
    k: K
  ): { [k in K]: unknown } | undefined {
    return Obj.hasKey(k, obj) ? obj : undefined;
  }
  export function random<T extends { [k: string]: unknown }>(
    o: T
  ): { value: T[keyof T]; key: keyof T } {
    const key = Arr.random(keys(o)).value;
    return { value: o[key], key };
  }
  export namespace Sync {
    export function findFirst<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean
    ) {
      return Arr.Sync.findFirst(keys(o), (k) => f(k, o[k]));
    }
    export function findLast<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean
    ) {
      return Arr.Sync.findLast(keys(o), (k) => f(k, o[k]));
    }
    export function forEach<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => unknown
    ) {
      Arr.Sync.forEach(keys(o), (k) => f(k, o[k]));
    }
    export function map<B, T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => B
    ): { [k in keyof T]: B } {
      const res: { [k in keyof T]?: B } = {};
      forEach(o, (k) => (res[k] = f(k, o[k])));
      return res as any;
    }
    export function partition<
      T extends { [k: string]: unknown },
      Yes extends string = "yes",
      No extends string = "no"
    >(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean,
      opts?: {
        yesField?: Yes;
        noField?: No;
      }
    ): { [k in Yes]: { [k in keyof T]?: T[k] } } & {
      [k in No]: { [k in keyof T]?: T[k] };
    } {
      const yf = opts?.yesField || "yes";
      const nf = opts?.noField || "no";
      const result: any = {};
      result[yf] = {};
      result[nf] = {};
      forEach(o, (k) =>
        f(k, o[k]) === true ? (result[yf][k] = o[k]) : (result[nf][k] = o[k])
      );
      return result;
    }
    export function filter<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean
    ) {
      return partition(o, f).yes;
    }
    export function some<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean
    ) {
      return findFirst(o, f) !== undefined;
    }
    export function all<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => boolean
    ) {
      return !some(o, (t, i) => !f(t, i));
    }
    export function toArray<T extends { [k: string]: unknown }, B>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => B
    ) {
      const result: B[] = [];
      forEach(o, (k, v) => result.push(f(k, v)));
      return result;
    }
  }
  export function Async(maxConcurrent = 1) {
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
    function findAny<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>
    ) {
      return Arr.Async(maxConcurrent).findAny(keys(o), (k) => f(k, o[k]));
    }
    function forEach<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<unknown>
    ) {
      return Arr.Async(maxConcurrent).forEach(keys(o), (k) => f(k, o[k]));
    }
    async function map<B, T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<B>
    ): Promise<{ [k in keyof T]: B }> {
      const res: { [k in keyof T]?: B } = {};
      await forEach(o, async (k) => (res[k] = await f(k, o[k])));
      return res as any;
    }
    async function partition<
      T extends { [k: string]: unknown },
      Yes extends string = "yes",
      No extends string = "no"
    >(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>,
      opts?: {
        yesField?: Yes;
        noField?: No;
      }
    ): Promise<
      { [k in Yes]: { [k in keyof T]?: T[k] } } & {
        [k in No]: { [k in keyof T]?: T[k] };
      }
    > {
      const yf = opts?.yesField || "yes";
      const nf = opts?.noField || "no";
      const result: any = {};
      result[yf] = {};
      result[nf] = {};
      await forEach(o, async (k) =>
        (await f(k, o[k])) === true
          ? (result[yf][k] = o[k])
          : (result[nf][k] = o[k])
      );
      return result;
    }
    async function filter<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>
    ) {
      return (await partition(o, f)).yes;
    }
    async function some<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>
    ) {
      return (await findAny(o, f)) !== undefined;
    }
    async function all<T extends { [k: string]: unknown }>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<boolean>
    ) {
      return !(await some(o, async (t, i) => !(await f(t, i))));
    }
    async function toArray<T extends { [k: string]: unknown }, B>(
      o: T,
      f: (key: keyof T & string, val: T[keyof T]) => Promise<B>
    ) {
      const result: B[] = [];
      await forEach(o, async (k, v) => result.push(await f(k, v)));
      return result;
    }
  }
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

namespace TypeCheckers {
  export function NaN(v: unknown): v is IsTypeHelper["NaN"] {
    return (
      (typeof v === "number" && isNaN(v)) ||
      (typeof v === "string" && isNaN(parseFloat(v)))
    );
  }
  export function number(v: unknown): v is IsTypeHelper["number"] {
    return typeof v === "number" && !isNaN(v);
  }
  export function numeric(v: unknown): v is IsTypeHelper["numeric"] {
    return (
      (typeof v === "number" && !isNaN(v)) ||
      (typeof v === "string" && !isNaN(parseFloat(v)))
    );
  }
  export function finite(v: unknown): v is IsTypeHelper["finite"] {
    return typeof v === "number" && isFinite(v);
  }
  export function infinite(v: unknown): v is IsTypeHelper["infinite"] {
    return typeof v === "number" && !isFinite(v);
  }
  export function stringNonEmpty(
    v: unknown
  ): v is IsTypeHelper["stringNonEmpty"] {
    return typeof v === "string" && v.length > 0;
  }
  export function arrayNonEmpty(
    v: unknown
  ): v is IsTypeHelper["arrayNonEmpty"] {
    return Array.isArray(v) && v.length > 0;
  }
  export function truthy(v: unknown): v is IsTypeHelper["truthy"] {
    return !!v;
  }
  export function falsy(v: unknown): v is IsTypeHelper["falsy"] {
    return !v;
  }
  export function object(
    v: unknown
  ): v is Record<number | string | symbol, unknown> {
    return v !== null && typeof v === "object";
  }
}
const checkers: {
  [k in keyof IsTypeHelper]: (v: unknown) => v is IsTypeHelper[k];
} = {
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
export function is<K extends [keyof IsTypeHelper, ...(keyof IsTypeHelper)[]]>(
  v: unknown,
  ...ts: K
): v is IsTypeHelper[K[number]] {
  return Arr.Sync.some(ts, (k) => checkers[k](v));
}

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
export const valueType = <C>() => ((x) => x) as ValueTypeCheck<C>;

export const tuple = <T extends unknown[]>(...x: T) => x;

export const UnitType = valueType<readonly (readonly [number, string])[]>()({
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

export namespace Str {
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
  export function withUnit<T extends readonly (readonly [number, string])[]>(
    amount: number,
    units: T,
    unit: T[number][1] = units[0][1]
  ) {
    let duration = amount;
    for (
      let i = units.findIndex((u) => u[1] === unit) + 1;
      duration >= units[i][0];
      i++
    ) {
      duration /= units[i][0];
      unit = units[i][1];
    }
    return unit !== units[0][1] ? duration.toFixed(1) + unit : duration + unit;
  }

  /**
   * Usage:
   * ```
   * const spinner = Spinner.start();
   * // Do some slow work
   * const duration = spinner.stop();
   * ```
   */
  export class Spinner {
    /**
     * A lot of spinners (most are from https://www.npmjs.com/package/cli-spinners)
     */
    static readonly format = {
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
    } as const;
    static start(steps: readonly string[] = Obj.random(Spinner.format).value) {
      if (typeof process.stdout.getWindowSize !== "function")
        throw "Not a TTY console, please use 'Timer.format.NoTTY'";
      return new Spinner(steps);
    }
    private interval: NodeJS.Timeout;
    private before: number;
    private spinnerIndex = -1;
    private constructor(private steps: readonly string[]) {
      this.before = Date.now();
      process.stdout.write(HIDE_CURSOR);
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
      process.stdout.write(SHOW_CURSOR);
      return Date.now() - this.before;
    }
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
      start() {}
      tickSec(secs: number) {
        if (secs % 10 === 0)
          process.stdout.write(((secs / 10) % 10).toString());
        else if (secs % 5 === 0) process.stdout.write("!");
        else process.stdout.write(".");
      }
      end() {
        process.stdout.write("\n");
      }
      requiresTTY() {
        return false;
      }
    }
    export class Seconds implements Format {
      private lastLength = 0;
      constructor(private suffix: string = "") {}
      start() {
        process.stdout.write(HIDE_CURSOR);
      }
      tickSec(secs: number) {
        const out = secs.toString() + this.suffix;
        if (this.lastLength > 0) process.stdout.moveCursor(-this.lastLength, 0);
        this.lastLength = out.length;
        process.stdout.write(out);
      }
      end() {
        if (this.lastLength > 0) process.stdout.moveCursor(this.lastLength, 0);
        process.stdout.write(SHOW_CURSOR);
      }
      requiresTTY() {
        return true;
      }
    }
    export class Colon implements Format {
      private lastLength = 0;
      constructor(private suffix: string = "") {}
      start() {
        process.stdout.write(HIDE_CURSOR);
      }
      tickSec(secs: number) {
        const out =
          (~~(secs / 60)).toString() +
          ":" +
          secs.toString().padStart(2, "0") +
          this.suffix;
        if (this.lastLength > 0) process.stdout.moveCursor(-this.lastLength, 0);
        this.lastLength = out.length;
        process.stdout.write(out);
      }
      end() {
        if (this.lastLength > 0) process.stdout.moveCursor(this.lastLength, 0);
        process.stdout.write(SHOW_CURSOR);
      }
      requiresTTY() {
        return true;
      }
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
      private interval: NodeJS.Timeout;
      private before: number;
      constructor(private format: Format) {
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
    export function start(format = new NoTTY()) {
      if (
        format.requiresTTY() === true &&
        typeof process.stdout.getWindowSize !== "function"
      )
        throw "Not a TTY console, please use 'Timer.format.NoTTY'";
      return new Timer(format);
    }
  }

  class InvisibleHand {
    private static lastInvisibleChars: Set<string> | undefined;
    private static lastInvisibleHand: InvisibleHand | undefined;
    static make(invisibleChars: Set<string>) {
      if (InvisibleHand.lastInvisibleChars === invisibleChars)
        return InvisibleHand.lastInvisibleHand!;
      InvisibleHand.lastInvisibleChars = invisibleChars;
      return (InvisibleHand.lastInvisibleHand = new InvisibleHand(
        invisibleChars
      ));
    }
    private regex: RegExp;
    private constructor(invisibleChars: Set<string>) {
      this.regex = new RegExp(
        "(" +
          [...invisibleChars]
            .map((x) => x.replace(/\[/, "\\[").replace(/\?/, "\\?"))
            .join("|") +
          ")",
        "gi"
      );
    }
    remove(str: string) {
      return str.replace(this.regex, "");
    }
    length(str: string) {
      return this.remove(str).length;
    }
    match(str: string) {
      return str.match(this.regex);
    }
    matchAll(str: string) {
      return str.matchAll(this.regex);
    }
  }
  export const FG_BLACK = "\x1b[30m";
  export const FG_RED = "\x1b[31m";
  export const FG_GREEN = "\x1b[32m";
  export const FG_YELLOW = "\x1b[33m";
  export const FG_BLUE = "\x1b[34m";
  export const FG_PURPLE = "\x1b[35m";
  export const FG_CYAN = "\x1b[36m";
  export const FG_WHITE = "\x1b[37m";
  export const FG_GRAY = "\x1b[90m";
  export const FG_DEFAULT = "\x1b[0m";

  export const BG_BLACK = "\x1b[40m";
  export const BG_RED = "\x1b[41m";
  export const BG_GREEN = "\x1b[42m";
  export const BG_YELLOW = "\x1b[43m";
  export const BG_BLUE = "\x1b[44m";
  export const BG_PURPLE = "\x1b[45m";
  export const BG_CYAN = "\x1b[46m";
  export const BG_WHITE = "\x1b[47m";
  export const BG_GRAY = "\x1b[100m";
  export const BG_DEFAULT = "\x1b[49m";

  export const STRIKE = "\x1b[9m";
  export const NO_STRIKE = "\x1b[29m";

  export const UP = "\x1b[A";
  export const DOWN = "\x1b[B";
  export const LEFT = "\x1b[D";
  export const RIGHT = "\x1b[C";

  const DEFAULT_INVISIBLE = new Set([
    FG_DEFAULT,
    FG_BLACK,
    FG_RED,
    FG_GREEN,
    FG_YELLOW,
    FG_BLUE,
    FG_PURPLE,
    FG_CYAN,
    FG_WHITE,
    FG_GRAY,
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
    SHOW_CURSOR,
    HIDE_CURSOR,
    UP,
    LEFT,
    RIGHT,
    DOWN,
  ]);

  export function lengthWithoutInvisible(
    str: string,
    invisibleChars = DEFAULT_INVISIBLE
  ) {
    return InvisibleHand.make(invisibleChars).length(str);
  }
  export function withoutInvisible(
    str: string,
    invisibleChars = DEFAULT_INVISIBLE
  ) {
    return InvisibleHand.make(invisibleChars).remove(str);
  }

  const invisible: { [prefix: string]: string[] } = {};
  let lastPrefix: string | undefined = undefined;
  export const print = withOptions(
    {
      prefix: "",
      prefixColor: FG_GRAY,
      openEnded: false,
      invisibleChars: DEFAULT_INVISIBLE,
    },
    (opts, str: string) => {
      const invisibleHand = InvisibleHand.make(opts.invisibleChars);
      const prefixCleanLength = invisibleHand.length(opts.prefix);
      const middleSymbol = " ".repeat(prefixCleanLength) + "│";
      const headerSymbol =
        opts.openEnded === true && lastPrefix === opts.prefix
          ? middleSymbol
          : opts.prefix + "┐";
      lastPrefix = opts.prefix;
      if (invisible[opts.prefix] === undefined || opts.openEnded === false)
        invisible[opts.prefix] = [];
      const [headerPrefix, middlePrefix, footerPrefix, prefixLength] =
        prefixCleanLength === 0
          ? [opts.prefix, opts.prefix, opts.prefix, 0]
          : opts.openEnded === true
          ? [
              opts.prefixColor + headerSymbol + FG_DEFAULT,
              opts.prefixColor + middleSymbol + FG_DEFAULT,
              opts.prefixColor + opts.prefix + "┘" + FG_DEFAULT,
              prefixCleanLength + 1,
            ]
          : [
              opts.prefixColor + "┌" + opts.prefix + FG_DEFAULT + " ",
              opts.prefixColor + "│" + FG_DEFAULT,
              opts.prefixColor + "└" + opts.prefix + FG_DEFAULT + " ",
              1,
            ];
      const width = process.stdout.getWindowSize()[0];
      const lines = Arr.Sync.map(
        str.split("\n").flatMap((l) => {
          const words = l.split(" ");
          const result: string[][] = [[]];
          let widthLeft = width - prefixLength;
          for (let i = 0; i < words.length; ) {
            const cleanWord = invisibleHand.remove(words[i]);
            const wLength = cleanWord.length;
            if (wLength > widthLeft) {
              const smaller = cleanWord.split(/(.+?[\/,])/i);
              let iChars = 0;
              for (let j = 0; j < smaller.length; j++) {
                if (smaller[j].length === 0) continue;
                const wLength = smaller[j].length;
                if (wLength > widthLeft) {
                  break;
                }
                widthLeft -= wLength;
                iChars += wLength;
              }
              const indentIndex = words.findIndex((x) => ![""].includes(x));
              const indent = words.slice(0, indentIndex);
              if (widthLeft > 20) iChars += widthLeft;
              if (iChars > 0) {
                const allInv = [...(invisibleHand.matchAll(words[i]) || [])];
                const invs: string[] = [];
                for (let a = 0; a < allInv.length; a++) {
                  const inv = allInv[a];
                  if (inv.index < iChars) {
                    iChars += inv[0].length;
                    invs.push(inv[0]);
                  } else {
                    break;
                  }
                }
                const insert = words[i].substring(0, iChars);
                result[result.length - 1].push(
                  result[result.length - 1].length === 0
                    ? invisible[opts.prefix].join("") + insert
                    : insert
                );
                invisible[opts.prefix].push(...invs);
              }
              words.splice(
                i,
                1,
                ...indent,
                ...(indentIndex > 0 ||
                /^([*\-]|[0-9a-z]+[\.\)\:])$/.test(words[indentIndex])
                  ? new Array(words[indentIndex].length + 1).fill("")
                  : []),
                words[i].substring(iChars)
              );
              result.push([]);
              widthLeft = width - prefixLength;
            } else {
              const inv = invisibleHand.match(words[i]) || [];
              widthLeft -= wLength + 1;
              result[result.length - 1].push(
                result[result.length - 1].length === 0
                  ? invisible[opts.prefix].join("") + words[i++]
                  : words[i++]
              );
              invisible[opts.prefix].push(...inv);
            }
          }
          return result.map((ws) => ws.join(" "));
        }),
        (l) => middlePrefix + l,
        {
          first: (l) => headerPrefix + l,
          last: opts.openEnded === true ? undefined : (l) => footerPrefix + l,
        }
      ).join("\n");
      process.stdout.write(lines + "\n");
    }
  );

  function aligner(align: (s: string, w: number) => string) {
    return (str: string, width: number, invisibleHand: InvisibleHand) => {
      const cleanStr = invisibleHand.remove(str);
      if (cleanStr.length <= width) return align(str, width - cleanStr.length);
      const allInv = [...(invisibleHand.matchAll(str) || [])];
      let take = width - 3;
      while (allInv.length > 0 && allInv[0].index < take) {
        take += allInv.shift()![0].length;
      }
      return str.substring(0, take) + "..." + allInv.map((x) => x[0]).join("");
    };
  }
  export const padStart = (
    str: string,
    width: number,
    c: string = " ",
    invisibleChars: Set<string> = DEFAULT_INVISIBLE
  ) =>
    aligner((s, w) => c.repeat(w) + s)(
      str,
      width,
      InvisibleHand.make(invisibleChars)
    );
  export const padEnd = (
    str: string,
    width: number,
    c: string = " ",
    invisibleChars: Set<string> = DEFAULT_INVISIBLE
  ) =>
    aligner((s, w) => s + c.repeat(w))(
      str,
      width,
      InvisibleHand.make(invisibleChars)
    );
  export const padBoth = withOptions(
    {
      c: " ",
      invisibleChars: DEFAULT_INVISIBLE,
      margin: tuple(true, true),
    },
    (opt, str: string, width: number) =>
      aligner((s, w) => {
        const l = ~~(
          (w + (opt.margin[0] ? 1 : 0) - (opt.margin[1] ? 1 : 0)) /
          2
        );
        const r = w - l;
        return opt.c.repeat(l) + s + opt.c.repeat(r);
      })(str, width, InvisibleHand.make(opt.invisibleChars))
  );
  export const alignRight = padStart;
  export const alignLeft = padEnd;
  export const alignCenter = padBoth;
  class Table {
    private rows: string[] = [];
    constructor(
      columns: readonly string[],
      private config: [number, (s: string) => string][]
    ) {
      this.addRow(...columns);
      this.addDivider();
    }
    addDivider() {
      this.rows.push(
        FG_GRAY +
          Arr.Sync.map(this.config, (c) => "─".repeat(c[0])).join("─┼─") +
          FG_DEFAULT
      );
      return this;
    }
    addRow(...values: readonly string[]) {
      this.rows.push(
        Arr.Sync.zip(this.config, values, (c, v) => c[1](v)).join(
          ` ${FG_GRAY}│${FG_DEFAULT} `
        )
      );
      return this;
    }
    toString() {
      return this.rows.join("\n");
    }
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
    export function simple(header: string, invisible?: Set<string>) {
      const invisibleChars =
        invisible === undefined ? DEFAULT_INVISIBLE : invisible;
      const columns = header.split("|");
      return new Table(
        Arr.Sync.map(columns, (s) => s.substring(1, s.length - 1).trim(), {
          first: (s) => s.substring(0, s.length - 1).trim(),
          last: (s) => s.substring(1).trim(),
        }),
        Arr.Sync.map(
          columns,
          (c) => [
            c.length - 2,
            (c[0] === " ") === (c[c.length - 1] === " ")
              ? (s) => alignCenter(s, c.length - 2, { invisibleChars })
              : c[0] === " "
              ? (s) => alignRight(s, c.length - 2, " ", invisibleChars)
              : (s) => alignLeft(s, c.length - 2, " ", invisibleChars),
          ],
          {
            first: (c) => [
              c.length - 1,
              c[0] === " " && c[c.length - 1] === " "
                ? (s) => alignCenter(s, c.length - 1, { invisibleChars })
                : c[c.length - 1] === " "
                ? (s) => alignLeft(s, c.length - 1, " ", invisibleChars)
                : (s) => alignRight(s, c.length - 1, " ", invisibleChars),
            ],
            last: (c) => [
              c.length - 1,
              c[0] === " " && c[c.length - 1] === " "
                ? (s) => alignCenter(s, c.length - 1, { invisibleChars })
                : c[0] === " "
                ? (s) => alignRight(s, c.length - 1, " ", invisibleChars)
                : (s) => alignLeft(s, c.length - 1, " ", invisibleChars),
            ],
          }
        )
      );
    }

    export function advanced<T>(
      headerWidth: { [header: string]: number },
      data: T[],
      format: (t: T) => string[],
      after: (row: string, t: T) => void,
      prefix = ""
    ) {
      const maxWidths: number[] = [];
      const transformed = data.map((t): [string[], T] => {
        const result = format(t);
        result.forEach(
          (s, i) => (maxWidths[i] = Math.max(maxWidths[i] || 0, s.length))
        );
        return [result, t];
      });
      const headers = Obj.keys(headerWidth);
      const fixedWidth = headers.reduce(
        (a, h) => a + Math.abs(headerWidth[h]),
        0
      );
      const calculatedWindowWidth =
        typeof process.stdout.getWindowSize !== "function"
          ? 80
          : process.stdout.getWindowSize()[0];
      const maxWidth = calculatedWindowWidth - prefix.length;
      const freeWidth =
        maxWidth - (headers.length - 1) * "─┼─".length - fixedWidth;
      const printHeaders: string[] = [];
      const printers = headers.map((h, i) => {
        maxWidths[i] =
          headerWidth[h] < 0
            ? Math.max(-headerWidth[h], Math.min(maxWidths[i], freeWidth))
            : headerWidth[h];
        if (h[0] === "<") {
          printHeaders.push(
            Str.alignCenter(h.substring(1), maxWidths[i], {
              margin: [i === 0, i === headers.length - 1],
            })
          );
          return (s: string) => Str.alignLeft(s, maxWidths[i]);
        } else if (h[h.length - 1] === ">") {
          printHeaders.push(
            Str.alignCenter(h.substring(0, h.length - 1), maxWidths[i], {
              margin: [i === 0, i === headers.length - 1],
            })
          );
          return (s: string) => Str.alignRight(s, maxWidths[i]);
        } else {
          printHeaders.push(
            Str.alignCenter(h, maxWidths[i], {
              margin: [i === 0, i === headers.length - 1],
            })
          );
          return (s: string) => Str.alignCenter(s, maxWidths[i]);
        }
      });
      transformed.forEach(([ss, t]) => {
        const str = Arr.Sync.zip(printers, ss, (p, s) => p(s)).join(
          ` ${Str.FG_GRAY}│${Str.FG_DEFAULT} `
        );
        after(str, t);
      });
      return (
        prefix +
        printHeaders.join(` ${Str.FG_GRAY}│${Str.FG_DEFAULT} `) +
        `\n` +
        prefix +
        Str.FG_GRAY +
        maxWidths.map((w) => "─".repeat(w)).join(`─┼─`) +
        Str.FG_DEFAULT
      );
    }
  }

  export const lowercase = "abcdefghijklmnopqrstuvwxyz";
  export const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  export const digits = "0123456789";
  export const underscore = "_";
  export const dash = "-";
  export const filename = lowercase + uppercase + digits + underscore + dash;
  export const all = lowercase + uppercase + digits + underscore + dash;
  export function generateString(
    length: number,
    ...alphabets: [string, ...string[]]
  ) {
    const alphabet = alphabets.join("");
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
      result.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    return result.join("");
  }

  /**
   * @param str
   * @param radix
   * @returns [left, right | "", radix | ""]
   */
  export function partitionLeft(
    str: string,
    radix: string
  ): [string, string, string] {
    const index = str.indexOf(radix);
    if (index < 0) return [str, "", ""];
    return [
      str.substring(0, index),
      str.substring(index + radix.length),
      radix,
    ];
  }

  /**
   * @param str
   * @param radix
   * @returns [left, right | "", radix | ""]
   */
  export function partitionRight(
    str: string,
    radix: string
  ): [string, string, string] {
    const index = str.lastIndexOf(radix);
    if (index < 0) return [str, "", ""];
    return [
      str.substring(0, index),
      str.substring(index + radix.length),
      radix,
    ];
  }

  export function toFolderName(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9\-_]/g, "-");
  }

  export function list(strs: readonly string[]) {
    return strs.length <= 2
      ? strs.join(" and ")
      : Arr.Sync.map(strs, (e) => e + ", ", { last: (e) => "and " + e }).join(
          ""
        );
  }

  export function plural(word: string, n: number = 0) {
    return n !== 1
      ? word[word.length - 1] === "y"
        ? word.substring(0, word.length - 1) + "ies"
        : word + "s"
      : word;
  }

  export function order(n: number) {
    return n + (["st", "nd", "rd"][n - 1] || "th");
  }

  export function capitalize(str: string) {
    return str[0].toUpperCase() + str.substring(1);
  }

  export function semanticVersionLessThan(old: string, new_: string) {
    const os = old.split(".");
    const ns = new_.split(".");
    if (+os[0] < +ns[0]) return true;
    else if (+os[0] > +ns[0]) return false;
    else if (+os[1] < +ns[1]) return true;
    else if (+os[1] > +ns[1]) return false;
    else if (+os[2] < +ns[2]) return true;
    return false;
  }

  export function censor(str: string) {
    const [sec, pub, ch] = partitionLeft(str, "@");
    return sec[0] + "*".repeat(sec.length - 2) + sec[sec.length - 1] + ch + pub;
  }

  export function padNumber(n: number) {
    const str = n.toString();
    return " ".repeat(2 - str.length) + str;
  }

  export const MONTHS = [
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
  export function prettyDate(d: Date) {
    return (
      MONTHS[d.getMonth()].substring(0, 3) +
      " " +
      d.getDate() +
      ", " +
      d.getFullYear()
    );
  }

  /**
   * Parse a boolean input value.
   *
   * @param bool input to parse
   * @returns false for any casing of the string false, the value null or undefined. Otherwise returns true.
   */
  export function parseBool(bool: string | null | undefined) {
    return (
      bool !== null &&
      bool !== undefined &&
      bool !== "" &&
      bool.toLowerCase() !== "false"
    );
  }
}

export function addMinutes(minutes: number, date = new Date()) {
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
export function varArgsBeforeOptional<T, L, R>(
  isOpt: (a: T | L) => a is L,
  f: (ts: T[], l: L | undefined) => R
) {
  return <R extends [] | [L], V extends [...T[], ...R]>(...v: V) => {
    const last = v[v.length - 1];
    if (last !== undefined && isOpt(last)) {
      return f(v.slice(0, v.length - 1) as T[], last);
    } else {
      return f(v as T[], undefined);
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
export function varArgsFirst<T, L, R>(f: (ts: T[], l: L) => R) {
  return <V extends [...T[], L]>(...v: V) => {
    const last = v[v.length - 1];
    return f(v.slice(0, v.length - 1) as T[], last as L);
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
export function constify<T, R extends unknown[]>(
  ...args: [...R, (...r: R) => T]
): T {
  return (args[args.length - 1] as any)(...args.slice(0, args.length - 1));
}

class CheckedException<S extends string> {
  constructor(public readonly type: S, public readonly data?: any) {}
}
type ExceptionHandler = (e: any) => unknown;
type TryBody<E> = (
  Start: <A extends unknown[], T>(func: Raiser<E, A, T>, ...a: A) => Promise<T>
) => Promise<void>;
type FuncBody<A extends unknown[], T> = (...a: A) => Promise<T>;
type HellRaiser<E extends string, A extends unknown[], T> = (
  Raise: (type: E, data?: any) => never
) => FuncBody<A, T>;
/**
 * Function that raises checked exceptions. To call it use `Start(foo)`
 */
interface Raiser<E, A extends unknown[], T> {}
class InternalRaiser<E, A extends unknown[], T> implements Raiser<E, A, T> {
  constructor(private throws: E, protected f: FuncBody<A, T>) {}
  Start(a: A) {
    return this.f(...a);
  }
}

/**
 * Define function that raises checked exceptions. To call it use `Start(foo)(arguments)`
 */
export function Raises<E extends string[]>(...e: E) {
  return <A extends unknown[], T>(
    f: HellRaiser<E[number], A, T>
  ): Raiser<E[number], A, T> =>
    new InternalRaiser<E[number], A, T>(
      e[0],
      f((e: E[number], data?: any) => {
        throw new CheckedException(e, data);
      })
    );
}

class Catcher<M> {
  constructor(private handler: (next: ExceptionHandler) => ExceptionHandler) {}
  /**
   * Handle another type of checked exception
   * @param type the checked exception to catch, eg. "FileNotFound"
   * @param handler how to handle the exception
   * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
   */
  Catch<S extends string>(type: S, handler: ExceptionHandler) {
    return new Catcher<S | M>((next) =>
      this.handler((e: any) => {
        if (typeof e === "object" && "type" in e && e.type === type)
          return handler("data" in e && e.data);
        return next(e);
      })
    );
  }
  /**
   * @param body code that might raise checked exceptions.
   * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
   */
  Try(body: TryBody<M>) {
    return body(<A extends unknown[], T>(func: Raiser<M, A, T>, ...a: A) => {
      const prom = (func as InternalRaiser<M, A, T>).Start(a);
      prom.catch((e) => {
        this.handler((e: any) => {
          throw e;
        })(e);
      });
      return prom;
    }).catch((e) => {});
  }
}

/**
 * Start a Catch-Try block that can handle checked exceptions, end with `.Try()`
 * @param type the checked exception to catch, eg. "FileNotFound"
 * @param handler how to handle the exception
 * @returns a Promise that wont cause "uncaught promise rejection" from any checked exception
 */
export function Catch<S extends string>(type: S, handler: ExceptionHandler) {
  return new Catcher<never>(
    (next: ExceptionHandler) => (e: any) => next(e)
  ).Catch(type, handler);
}

/**
 * Run a function inside a Catch-Try block that handles all relevant checked exceptions.
 * @param func a function defined with `Raises()`
 * @param args arguments to the function
 * @returns a Promise that wont cause "uncaught promise" from any checked exception
 */
export function Start<A extends unknown[], T>(
  func: Raiser<never, A, T>,
  ...args: A
) {
  return (func as InternalRaiser<never, A, T>).Start(args);
}

let counter = 0;
export function gensym() {
  return (counter++).toString();
}

export function withOptions<
  T extends unknown[],
  R,
  O extends { [key: string]: unknown }
>(defaults: O, f: (opts: O, ...args: T) => R) {
  return (...args: T | [...T, { [k in keyof O]?: O[k] }]) => {
    const last = args[args.length - 1];
    if (typeof last !== "object" || last === null)
      return f(defaults, ...(args as T));
    const keys = Obj.keys(last);
    if (Arr.Sync.all(keys, (k) => k in defaults))
      return f(
        Obj.Sync.map(defaults, (k, v) =>
          Obj.hasKey(k, last) ? last[k] : v
        ) as O,
        ...(args.slice(0, args.length - 1) as T)
      );
    else return f(defaults, ...(args as T));
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
