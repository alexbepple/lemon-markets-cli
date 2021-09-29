import * as r from 'ramda'
import fs from 'fs/promises'

export const readTraderamaOrders = async () => {
  const row2TxtOrder = r.pipe(
    r.map(r.head),
    r.converge(r.unapply(r.join(' ')), [
      r.pipe(r.nth(1), r.replace('limit sell', 'sell all')),
      r.nth(3),
      r.pipe(r.nth(4), r.concat('@')),
    ])
  )
  await fs
    .readFile(r.last(process.argv))
    .then(
      r.pipe(
        JSON.parse,
        r.prop('dataText'),
        r.map(row2TxtOrder),
        r.forEach(console.log)
      )
    )
}
