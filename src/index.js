import got from 'got'
import * as r from 'ramda'
import {determineQty, extractIsin, extractLimitPrice, extractSide} from "./cli-input.js";
import {getUnixSecondsIn22Hours} from "./date.js";

const order = {
    "valid_until": getUnixSecondsIn22Hours(),
    "side": extractSide(process.argv),
    "isin": extractIsin(process.argv),
    "limit_price": extractLimitPrice(process.argv),
    "quantity": determineQty(process.argv)
}

const spacesUri = 'https://paper-trading.lemon.markets/rest/v1/spaces'
const url = r.join('/')([spacesUri, process.env.SPACE_ID, 'orders'])

console.log('Order:', order)

if (!r.includes('--force')(process.argv)) {
    console.log()
    console.log('Include --force to actually submit order')
    process.exit(0)
}

console.log('Submitting order …')
const reqOptions = {
    headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN},
    json: order
}
try {
    console.log('Response:', await got.post(url, reqOptions).json())
} catch (err) {
    console.error('❌ Request rejected: ', JSON.parse(err.response.body))
}
