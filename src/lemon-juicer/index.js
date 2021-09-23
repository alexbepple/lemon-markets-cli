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

const fetchOrders = (status) => () => {
    const reqOptions = {
        headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN},
        searchParams: {status}
    }
    return got.get(url, reqOptions).json()
        .then(r.prop('results'))
}

export const fetchActivatedOrders = fetchOrders('activated')
export const fetchInactiveOrders = fetchOrders('inactive')
export const fetchOpenOrders = r.pipe(
    () => Promise.all([fetchActivatedOrders(), fetchInactiveOrders()]),
    r.andThen(r.apply(r.concat))
)

export const deleteOrder = async (order) => {
    const reqOptions = {
        headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN}
    }
    return got.delete(r.join('/')([url, order.uuid]) , reqOptions)
}

export const activateOrder = async (order) => {
    const reqOptions = {
        headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN}
    }
    return got.put(r.join('/')([url, order.uuid, 'activate']) , reqOptions)
}
