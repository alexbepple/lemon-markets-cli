import { fetchOpenOrders } from '../lemon-juicer/index.js'
import * as r from 'ramda'

export const listOpenLemonOrders = async () => {
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
}
