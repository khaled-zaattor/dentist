import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, SubTreatment } from '../types';

export const subTreatmentService = {
  getAll: async (treatmentId: string, params?: { per_page?: number }): Promise<ApiResponse<PaginatedResponse<SubTreatment>>> => {
    const response = await apiClient.get(`/treatments/${treatmentId}/sub-treatments`, { params });
    return response.data;
  },

  getById: async (treatmentId: string, id: string): Promise<ApiResponse<SubTreatment>> => {
    const response = await apiClient.get(`/treatments/${treatmentId}/sub-treatments/${id}`);
    return response.data;
  },

  create: async (treatmentId: string, data: Partial<SubTreatment>): Promise<ApiResponse<SubTreatment>> => {
    const response = await apiClient.post(`/treatments/${treatmentId}/sub-treatments`, data);
    return response.data;
  },

  update: async (treatmentId: string, id: string, data: Partial<SubTreatment>): Promise<ApiResponse<SubTreatment>> => {
    const response = await apiClient.put(`/treatments/${treatmentId}/sub-treatments/${id}`, data);
    return response.data;
  },

  delete: async (treatmentId: string, id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/treatments/${treatmentId}/sub-treatments/${id}`);
    return response.data;
  },
};
