import { apiClient } from '../client';
import { ApiResponse, WaitingListEntry, WaitingListStatus } from '../types';

class WaitingListService {
  async getAll(): Promise<WaitingListEntry[]> {
    const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>('/waiting-list');
    return response.data.data;
  }

  async create(data: {
    patient_id: string;
    appointment_id?: string;
  }): Promise<WaitingListEntry> {
    const response = await apiClient.post<ApiResponse<WaitingListEntry>>('/waiting-list', data);
    return response.data.data;
  }

  async updateStatus(id: string, status: WaitingListStatus): Promise<WaitingListEntry> {
    const response = await apiClient.put<ApiResponse<WaitingListEntry>>(
      `/waiting-list/${id}`,
      { status }
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/waiting-list/${id}`);
  }

  async getPublicDisplay(): Promise<WaitingListEntry[]> {
    const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>('/waiting-list/display');
    return response.data.data;
  }
}

export const waitingListService = new WaitingListService();
