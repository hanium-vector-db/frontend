import axios from 'axios'

export interface KospiData {
  time: string
  price: number
}

export interface KospiQuote {
  symbol: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketPreviousClose: number
  regularMarketOpen: number
  regularMarketDayHigh: number
  regularMarketDayLow: number
}

class YahooFinanceService {
  private readonly KOSPI_SYMBOL = '%5EKS11' // ^KS11 URL encoded
  private readonly BASE_URL = '/api/yahoo' // Vite proxy를 통해 호출

  // 코스피 현재 시세 가져오기
  async getKospiQuote(): Promise<KospiQuote | null> {
    try {
      const url = `${this.BASE_URL}/v8/finance/chart/${this.KOSPI_SYMBOL}?interval=1d&range=1d`
      const response = await axios.get(url)

      if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
        console.error('Failed to fetch KOSPI quote')
        return null
      }

      const result = response.data.chart.result[0]
      const meta = result.meta
      const quote = result.indicators.quote[0]

      return {
        symbol: meta.symbol,
        regularMarketPrice: meta.regularMarketPrice || 0,
        regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose || 0,
        regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) || 0,
        regularMarketPreviousClose: meta.chartPreviousClose || 0,
        regularMarketOpen: quote.open[quote.open.length - 1] || 0,
        regularMarketDayHigh: meta.regularMarketDayHigh || 0,
        regularMarketDayLow: meta.regularMarketDayLow || 0,
      }
    } catch (error) {
      console.error('Error fetching KOSPI quote:', error)
      return null
    }
  }

  // 코스피 히스토리컬 데이터 가져오기
  async getKospiHistory(period: string = '1d'): Promise<KospiData[]> {
    try {
      let range = '1d'
      let interval = '5m'

      switch (period) {
        case '5m':
          range = '1d'
          interval = '5m'
          break
        case '30m':
          range = '5d'
          interval = '30m'
          break
        case '1d':
          range = '1mo'
          interval = '1d'
          break
        case '1w':
          range = '1y'
          interval = '1wk'
          break
        case '1mo':
          range = '5y'
          interval = '1mo'
          break
      }

      const url = `${this.BASE_URL}/v8/finance/chart/${this.KOSPI_SYMBOL}?interval=${interval}&range=${range}`
      const response = await axios.get(url)

      if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
        console.warn('No historical data available')
        return []
      }

      const result = response.data.chart.result[0]
      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]

      if (!timestamps || !quotes || !quotes.close) {
        return []
      }

      const data: KospiData[] = []
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.close[i] != null) {
          data.push({
            time: new Date(timestamps[i] * 1000).toISOString(),
            price: quotes.close[i]
          })
        }
      }

      return data
    } catch (error) {
      console.error('Error fetching KOSPI history:', error)
      return []
    }
  }
}

export default new YahooFinanceService()
