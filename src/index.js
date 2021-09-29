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
import { readTraderamaOrders } from './cli-command/index.js'
import { listOpenLemonOrders } from './cli-command/index.js'

if (r.includes('read-traderama-orders')(process.argv)) {
  await readTraderamaOrders()
  process.exit(0)
}

if (r.includes('list-open')(process.argv)) {
  await listOpenLemonOrders()
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
