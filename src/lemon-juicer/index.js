import * as r from "ramda";
import got from "got";

export const createLimitOrder = r.applySpec({
    valid_until: r.prop('validUntil'),
    side: r.prop('side'),
    isin: r.prop('isin'),
    limit_price: r.prop('limitPrice'),
    quantity: r.prop('quantity')
})

const spacesUri = 'https://paper-trading.lemon.markets/rest/v1/spaces'
const url = r.join('/')([spacesUri, process.env.SPACE_ID, 'orders'])

export const submitOrder = async (order) => {
    const reqOptions = {
        headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN},
        json: order
    }
    return got.post(url, reqOptions).json()
}
