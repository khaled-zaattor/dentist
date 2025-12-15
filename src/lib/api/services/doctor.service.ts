import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, Doctor } from '../types';

class DoctorService {
  async getAll(params?: {
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Doctor>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>(
      '/doctors',
      { params }
    );
    return response.data.data;
  }

  async getById(id: string): Promise<Doctor> {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data.data;
  }

  async create(data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const response = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(
      `/doctors/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/doctors/${id}`);
  }
}

export const doctorService = new DoctorService();
