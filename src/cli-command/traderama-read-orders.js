import * as r from 'ramda'
import fs from 'fs/promises'
import { extractBudget } from '../cli-input.js'

/*
 Supported order types:
 * buy limit
 * sell limit
 * sell market
 */
export const readTraderamaOrders = async () => {
  const row2TxtOrder = r.pipe(
    r.map(r.head),
    r.converge(r.unapply(r.join(' ')), [
      r.pipe(
        r.nth(1),
        r.replace('limit sell', 'sell all'),
        r.replace(/limit buy/i, 'buy =' + extractBudget(process.argv))
      ),
      r.nth(3),
      r.pipe(r.nth(4), r.concat('@'), r.replace('@0.0', '')),
    ])
  )
  await fs
    .readFile(r.find(r.endsWith('.json'))(process.argv))
    .then(
      r.pipe(
        JSON.parse,
        r.prop('dataText'),
        r.map(row2TxtOrder),
        r.forEach(console.log)
      )
    )
}
