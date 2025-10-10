import apiClient from './api'

export interface FinanceItemDto {
  id?: number
  category: string
  content: string
  createdAt?: string
  updatedAt?: string
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
