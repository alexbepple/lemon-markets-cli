import * as r from 'ramda'

const SIDE = { buy: 'buy', sell: 'sell' }

const isIsin = r.pipe(r.length, r.equals(12))
export const extractIsin = r.find(isIsin)
export const extractSide = r.find(r.includes(r.__, r.values(SIDE)))
export const extractLimitPrice = r.pipe(
  r.find(r.startsWith('@')),
  r.unless(r.isNil)(r.pipe(r.tail, Number.parseFloat))
)

const isQty = r.endsWith('x')
const extractQty = r.pipe(r.find(isQty), r.init, Number.parseFloat)
const isBudget = r.startsWith('=')
export const extractBudget = r.pipe(r.find(isBudget), r.tail, Number.parseFloat)
const calcQty = r.converge(r.pipe(r.divide, Math.floor), [
  extractBudget,
  extractLimitPrice,
])
export const determineQty = r.cond([
  [r.any(isQty), extractQty],
  [r.any(isBudget), calcQty],
  [
    r.T,
    () => {
      console.error('Cannot determine qty')
      process.exit(1)
    },
  ],
])
export const shallSellAll = r.allPass([
  r.pipe(extractSide, r.equals(SIDE.sell)),
  r.includes('all'),
])
