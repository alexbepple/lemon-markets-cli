import got from 'got'
import * as r from 'ramda'

const isIsin = r.pipe(r.length, r.equals(12))
const extractIsin = r.find(isIsin)
const extractSide = r.find(r.includes(r.__, ['buy', 'sell']))
const extractLimitPrice = r.pipe(r.find(r.startsWith('@')), r.tail, Number.parseFloat)
const extractQty = r.pipe(r.find(r.endsWith('x')), r.init, Number.parseFloat)

const msToS = r.pipe(x => x / 1000, x => Math.floor(x))
const toUnixMs = r.pipe(x => new Date(x), x => x.valueOf())
const hToMs = x => x * 60 * 60 * 1000
const validUntilUnixSeconds = r.pipe(
    // so, this is quite painful :-(((
    // date-fns – does not work with Node ESM
    // @js-temporal/polyfill – was not workable
    // maybe Luxon?
    () => new Date(), toUnixMs, ms => ms + hToMs(22), toUnixMs, msToS
)()

const order = {
    "valid_until": validUntilUnixSeconds,
    "side": extractSide(process.argv),
    "isin": extractIsin(process.argv),
    "limit_price": extractLimitPrice(process.argv),
    "quantity": extractQty(process.argv)
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
