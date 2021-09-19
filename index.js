import got from 'got'
import * as r from 'ramda'

const isIsin = r.pipe(r.length, r.equals(12))
const findSide = r.find(r.includes(r.__, ['buy', 'sell']))

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
    "side": findSide(process.argv),
    "isin": r.find(isIsin)(process.argv),
    "limit_price": 40.7,
    "quantity": 122
}

const spacesUri = 'https://paper-trading.lemon.markets/rest/v1/spaces'
const url = r.join('/')([spacesUri, process.env.SPACE_ID, 'orders'])

console.log('Order:', order)

if (!r.includes('--force')(process.argv)) {
    console.log()
    console.log('Include --force to actually submit order')
    process.exit(0)
}

try {
    await got.post(url, {
        headers: {'Authorization' : 'Bearer ' + process.env.LM_TOKEN},
        json: order
    }).json()
} catch (err) {
    console.log(err)
}
