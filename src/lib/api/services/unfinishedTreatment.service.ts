import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface UnfinishedTreatment {
  id: string; // treatment_record id
  appointment_id: string;
  treatment_id: string;
  sub_treatment_id: string;
  tooth_number: string;
  actual_cost?: number;
  is_completed: boolean;
  completed_steps?: any[];
  performed_at: string;
  created_at: string;
  treatment?: {
    id: string;
    name: string;
  };
  sub_treatment?: {
    id: string;
    name: string;
    sub_treatment_steps?: any[];
  };
  appointment?: {
    id: string;
    scheduled_at: string;
  };
}

class UnfinishedTreatmentService {
  async getByPatient(patientId: string): Promise<UnfinishedTreatment[]> {
    const response = await apiClient.get<ApiResponse<UnfinishedTreatment[]>>(
      `/patients/${patientId}/unfinished-treatments`
    );
    return response.data.data;
  }
}

export const unfinishedTreatmentService = new UnfinishedTreatmentService();
