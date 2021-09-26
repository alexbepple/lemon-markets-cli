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
const ordersResource = r.join('/')([spacesUri, process.env.SPACE_ID, 'orders'])
const portfolioResource = r.join('/')([spacesUri, process.env.SPACE_ID, 'portfolio']) // todo: dry

const defaultOptions = {headers: {'Authorization': 'Bearer ' + process.env.LM_TOKEN}}

export const submitOrder = async (order) => {
    const reqOptions = {...defaultOptions, json: order}
    return got.post(ordersResource, reqOptions).json()
}

const fetchOrders = (status) => () => {
    const reqOptions = {...defaultOptions, searchParams: {status}}
    return got.get(ordersResource, reqOptions)
        .json()
        .then(r.prop('results'))
}

export const fetchActivatedOrders = fetchOrders('activated')
export const fetchInactiveOrders = fetchOrders('inactive')
export const fetchOpenOrders = r.pipe(
    () => Promise.all([fetchActivatedOrders(), fetchInactiveOrders()]),
    r.andThen(r.apply(r.concat))
)

export const deleteOrder = async (order) => {
    return got.delete(r.join('/')([ordersResource, order.uuid]) , defaultOptions)
}
export const activateOrder = async (order) => {
    return got.put(r.join('/')([ordersResource, order.uuid, 'activate']) , defaultOptions)
}

export const fetchPortfolio = () =>
    got.get(portfolioResource, defaultOptions)
        .json()
        .then(r.prop('results'))

export const fetchPortfolioQty = (isin) => r.pipe(
    fetchPortfolio,
    r.andThen(r.pipe(
        r.find(r.pipe(r.path(['instrument', 'isin']), r.equals(isin))),
        r.prop('quantity')
    ))
)()
