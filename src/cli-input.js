import * as r from "ramda";

const isIsin = r.pipe(r.length, r.equals(12))
export const extractIsin = r.find(isIsin)
export const extractSide = r.find(r.includes(r.__, ['buy', 'sell']))
export const extractLimitPrice = r.pipe(r.find(r.startsWith('@')), r.tail, Number.parseFloat)

const isQty = r.endsWith('x');
const extractQty = r.pipe(r.find(isQty), r.init, Number.parseFloat)
const isBudget = r.startsWith('=');
const extractBudget = r.pipe(r.find(isBudget), r.tail, Number.parseFloat)
const calcQty = r.converge(r.pipe(r.divide, Math.floor), [extractBudget, extractLimitPrice])
export const determineQty = r.cond([
    [r.any(isQty), extractQty],
    [r.any(isBudget), calcQty],
    [r.T, () => {
        console.error('Cannot determine qty')
        process.exit(1)
    }]
])
