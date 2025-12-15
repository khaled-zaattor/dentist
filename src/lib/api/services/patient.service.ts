import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, Patient } from '../types';

class PatientService {
  async getAll(params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Patient>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Patient>>>(
      '/patients',
      { params }
    );
    return response.data.data;
  }

  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  }

  async create(data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(
      `/patients/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  }

  async getTreatmentRecords(id: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/patients/${id}/treatment-records`
    );
    return response.data.data;
  }

  async getPayments(id: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/patients/${id}/payments`
    );
    return response.data.data;
  }
}

export const patientService = new PatientService();
