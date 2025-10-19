import apiClient from './api'

export interface FinanceItemDto {
  id?: number
  category: string  // 자산 타입: ETF, 주식, 코인, 예금, 채권, 펀드 등
  name: string      // 자산 이름 (예: "삼성전자", "비트코인" 등)
  amount: number    // 금액
  content?: string  // 추가 설명 (선택)
  createdAt?: string
  updatedAt?: string
}

// 자산 타입별 위험도 분류
export const ASSET_RISK_TYPES = {
  // 안전자산
  SAFE: ['예금', '적금', '채권', '국채'],
  // 위험자산
  RISKY: ['주식', 'ETF', '코인', '펀드', '선물', '옵션']
}

class FinanceService {
  async listItems(category?: string): Promise<FinanceItemDto[]> {
    const params = category ? { category } : {}
    const response = await apiClient.get<FinanceItemDto[]>('/finance/items', { params })
    return response.data
  }

  async createItem(item: FinanceItemDto): Promise<FinanceItemDto> {
    const response = await apiClient.post<FinanceItemDto>('/finance/items', item)
    return response.data
  }

  async getItem(id: number): Promise<FinanceItemDto> {
    const response = await apiClient.get<FinanceItemDto>(`/finance/items/${id}`)
    return response.data
  }

  async updateItem(id: number, item: FinanceItemDto): Promise<FinanceItemDto> {
    const response = await apiClient.put<FinanceItemDto>(`/finance/items/${id}`, item)
    return response.data
  }

  async deleteItem(id: number): Promise<void> {
    await apiClient.delete(`/finance/items/${id}`)
  }
}

export default new FinanceService()
