import { apiClient } from '../client';
import { ApiResponse } from '../types';

interface Statistics {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  appointments_today: number;
  appointments_this_week: number;
  appointments_this_month: number;
  completed_appointments: number;
  cancelled_appointments: number;
  scheduled_appointments: number;
}

class StatisticsService {
  async getOverview(): Promise<Statistics> {
    const response = await apiClient.get<ApiResponse<Statistics>>('/statistics/overview');
    return response.data.data;
  }
}

export const statisticsService = new StatisticsService();
