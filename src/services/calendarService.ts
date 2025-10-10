import apiClient from './api'

export interface CalendarEventDto {
  id?: string
  summary: string
  description?: string
  location?: string
  startDateTime: string
  endDateTime?: string
  recurrence?: string[]
}

class CalendarService {
  async listEvents(calendarId: string = 'primary', maxResults: number = 50): Promise<CalendarEventDto[]> {
    const response = await apiClient.get<CalendarEventDto[]>('/calendar/events', {
      params: { calendarId, maxResults }
    })
    return response.data
  }

  async createEvent(event: CalendarEventDto, calendarId: string = 'primary'): Promise<CalendarEventDto> {
    const response = await apiClient.post<CalendarEventDto>('/calendar/events', event, {
      params: { calendarId }
    })
    return response.data
  }

  async getEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarEventDto> {
    const response = await apiClient.get<CalendarEventDto>(`/calendar/events/${eventId}`, {
      params: { calendarId }
    })
    return response.data
  }

  async updateEvent(eventId: string, event: CalendarEventDto, calendarId: string = 'primary'): Promise<CalendarEventDto> {
    const response = await apiClient.put<CalendarEventDto>(`/calendar/events/${eventId}`, event, {
      params: { calendarId }
    })
    return response.data
  }

  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    await apiClient.delete(`/calendar/events/${eventId}`, {
      params: { calendarId }
    })
  }

  // Google OAuth
  async initiateGoogleOAuth(): Promise<string> {
    const response = await apiClient.get<string>('/google/oauth/initiate')
    return response.data
  }

  async disconnectGoogle(): Promise<void> {
    await apiClient.delete('/google/oauth/disconnect')
  }
}

export default new CalendarService()
