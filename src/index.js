import * as r from 'ramda'
import {
  determineQty,
  extractIsin,
  extractLimitPrice,
  extractSide,
  shallSellAll,
} from './cli-input.js'
import { getUnixSecondsIn22Hours } from './date.js'
import {
  activateOrder,
  createLimitOrder,
  deleteOrder,
  fetchInactiveOrders,
  fetchOpenOrders,
  fetchPortfolio,
  fetchPortfolioQty,
  submitOrder,
} from './lemon-juicer/index.js'
import * as fs from 'fs/promises'

if (r.includes('read-traderama-orders')(process.argv)) {
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
  process.exit(0)
}

if (r.includes('list-open')(process.argv)) {
  const propsIrrelevantForOpen = [
    'processed_at',
    'processed_quantity',
    'average_price',
  ]
  const propsNotInterestingForMe = [
    'uuid',
    'trading_venue_mic',
    'created_at',
    'stop_price',
    'type',
  ]
  await fetchOpenOrders().then(
    r.pipe(
      r.map(r.omit(r.concat(propsIrrelevantForOpen, propsNotInterestingForMe))),
      r.sort(r.ascend(r.path(['instrument', 'title']))),
      console.log
    )
  )
  process.exit(0)
}

if (r.includes('show-portfolio')(process.argv)) {
  console.log(await fetchPortfolio())
  process.exit(0)
}

if (r.includes('delete-open')(process.argv)) {
  const openOrders = await fetchOpenOrders()
  console.log(`Deleting ${r.length(openOrders)} orders …`)
  await Promise.all(r.map(deleteOrder)(openOrders))
  process.exit(0)
}

if (r.includes('activate-all')(process.argv)) {
  const inactiveOrders = await fetchInactiveOrders()
  console.log(`Activating ${r.length(inactiveOrders)} orders …`)
  await Promise.all(r.map(activateOrder)(inactiveOrders))
  process.exit(0)
}

const lmOrder = createLimitOrder({
  validUntil: getUnixSecondsIn22Hours(),
  side: extractSide(process.argv),
  isin: extractIsin(process.argv),
  limitPrice: extractLimitPrice(process.argv),
  quantity: shallSellAll(process.argv)
    ? await fetchPortfolioQty(extractIsin(process.argv))
    : determineQty(process.argv),
})

if (r.includes('--preview')(process.argv)) {
  console.log('Order that would be submitted:', lmOrder)
  process.exit(0)
}

try {
  console.log('Response:', await submitOrder(lmOrder))
} catch (err) {
  console.error('❌ Request rejected: ', JSON.parse(err.response.body))
}
