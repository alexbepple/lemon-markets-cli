import * as r from "ramda";

const msToS = r.pipe(x => x / 1000, x => Math.floor(x))
const toUnixMs = r.pipe(x => new Date(x), x => x.valueOf())
const hToMs = x => x * 60 * 60 * 1000
export const getUnixSecondsIn22Hours = r.pipe(
    // so, this is quite painful :-(((
    // date-fns – does not work with Node ESM
    // @js-temporal/polyfill – was not workable
    // maybe Luxon?
    () => new Date(), toUnixMs, ms => ms + hToMs(22), toUnixMs, msToS
)
