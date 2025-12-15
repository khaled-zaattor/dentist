import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, Appointment, AppointmentStatus } from '../types';

class AppointmentService {
  async getAll(params?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: string;
    patient_id?: string;
    status?: AppointmentStatus;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>(
      '/appointments',
      { params }
    );
    return response.data.data;
  }

  async getById(id: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  }

  async create(data: {
    patient_id: string;
    doctor_id: string;
    scheduled_at: string;
    notes?: string;
  }): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      `/appointments/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }

  async recordTreatment(id: string, data: {
    treatment_id: string;
    sub_treatment_id: string;
    tooth_numbers: string[];
    actual_cost?: number;
    payment_amount?: number;
    notes?: string;
    completed_steps?: string[];
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/appointments/${id}/record-treatment`,
      data
    );
    return response.data.data;
  }

  async resumeTreatment(id: string, data: {
    treatment_record_id: string;
    completed_steps?: string[];
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/appointments/${id}/resume-treatment`,
      data
    );
    return response.data.data;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data.data;
  }
}

export const appointmentService = new AppointmentService();
