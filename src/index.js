import * as r from 'ramda'
import {determineQty, extractIsin, extractLimitPrice, extractSide} from "./cli-input.js";
import {getUnixSecondsIn22Hours} from "./date.js";
import {createLimitOrder, deleteOrder, fetchOpenOrders, submitOrder} from "./lemon-juicer/index.js";

if (r.includes('list-open')(process.argv)) {
    console.log(await fetchOpenOrders())
    process.exit(0)
}

if (r.includes('delete-open')(process.argv)) {
    const openOrders = await fetchOpenOrders()
    console.log(`Deleting ${r.length(openOrders)} orders …`)
    await Promise.all(r.map(deleteOrder)(openOrders))
    process.exit(0)
}

const lmOrder = createLimitOrder({
    validUntil: getUnixSecondsIn22Hours(),
    side: extractSide(process.argv),
    isin: extractIsin(process.argv),
    limitPrice: extractLimitPrice(process.argv),
    quantity: determineQty(process.argv)
})

console.log('Order:', lmOrder)

if (!r.includes('--force')(process.argv)) {
    console.log()
    console.log('Include --force to actually submit order')
    process.exit(0)
}

console.log('Submitting order …')
try {
    console.log('Response:', await submitOrder(lmOrder))
} catch (err) {
    console.error('❌ Request rejected: ', JSON.parse(err.response.body))
}
