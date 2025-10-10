import apiClient from './api'

export interface DiseaseDto {
  diseaseId?: number
  name: string
  diagnosedDate?: string
  status?: string
}

export interface MedicationDto {
  medicationId?: number
  name: string
  dosage?: string
  intakeTime?: string
  alarmEnabled: boolean
}

class HealthService {
  // ── Disease Management ──
  async listDiseases(): Promise<DiseaseDto[]> {
    const response = await apiClient.get<DiseaseDto[]>('/health/diseases')
    return response.data
  }

  async createDisease(disease: DiseaseDto): Promise<DiseaseDto> {
    const response = await apiClient.post<DiseaseDto>('/health/diseases', disease)
    return response.data
  }

  async getDisease(id: number): Promise<DiseaseDto> {
    const response = await apiClient.get<DiseaseDto>(`/health/diseases/${id}`)
    return response.data
  }

  async updateDisease(id: number, disease: DiseaseDto): Promise<DiseaseDto> {
    const response = await apiClient.put<DiseaseDto>(`/health/diseases/${id}`, disease)
    return response.data
  }

  async deleteDisease(id: number): Promise<void> {
    await apiClient.delete(`/health/diseases/${id}`)
  }

  // ── Medication Management ──
  async listMedications(): Promise<MedicationDto[]> {
    const response = await apiClient.get<MedicationDto[]>('/health/medications')
    return response.data
  }

  async createMedication(medication: MedicationDto): Promise<MedicationDto> {
    const response = await apiClient.post<MedicationDto>('/health/medications', medication)
    return response.data
  }

  async getMedication(id: number): Promise<MedicationDto> {
    const response = await apiClient.get<MedicationDto>(`/health/medications/${id}`)
    return response.data
  }

  async updateMedication(id: number, medication: MedicationDto): Promise<MedicationDto> {
    const response = await apiClient.put<MedicationDto>(`/health/medications/${id}`, medication)
    return response.data
  }

  async deleteMedication(id: number): Promise<void> {
    await apiClient.delete(`/health/medications/${id}`)
  }

  async getDueMedications(from: string, to: string): Promise<MedicationDto[]> {
    const response = await apiClient.get<MedicationDto[]>('/health/medications/due', {
      params: { from, to }
    })
    return response.data
  }
}

export default new HealthService()
