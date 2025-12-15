import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, Treatment } from '../types';

class TreatmentService {
  async getAll(params?: {
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Treatment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Treatment>>>(
      '/treatments',
      { params }
    );
    return response.data.data;
  }

  async getById(id: string): Promise<Treatment> {
    const response = await apiClient.get<ApiResponse<Treatment>>(`/treatments/${id}`);
    return response.data.data;
  }

  async create(data: {
    name: string;
    description?: string;
  }): Promise<Treatment> {
    const response = await apiClient.post<ApiResponse<Treatment>>('/treatments', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Treatment>): Promise<Treatment> {
    const response = await apiClient.put<ApiResponse<Treatment>>(
      `/treatments/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/treatments/${id}`);
  }
}

export const treatmentService = new TreatmentService();
