import moment from 'moment'
import { it } from 'node:test'

export interface Prices {
  Date: string
  Symbol: string
  Close: number
  Change?: number
}

export const fetchPricesApi = async () => {
  const resp = await fetch('/api/crypto/prices', {
    method: 'GET',
  })
  const data = await resp.json()

  const todayPrices: Prices[] = []
  const yesterdayPrices: Prices[] = []

  data.forEach((item: Prices) => {
    if (item.Date.startsWith(moment().utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + 'Z')) {
      todayPrices.push(item)
    } else if (
      item.Date.startsWith(moment().utc().startOf('day').subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss') + 'Z')
    ) {
      yesterdayPrices.push(item)
    }
  })

  return todayPrices.map((item) => {
    const yesterdayPrice = yesterdayPrices.find((y) => y.Symbol === item.Symbol)
    const change = yesterdayPrice ? (item.Close - yesterdayPrice.Close) / yesterdayPrice.Close : undefined
    return { ...item, Change: change }
  })
}
