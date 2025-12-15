import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, ActivityLog } from '../types';

class ActivityLogService {
  async getAll(params?: {
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ActivityLog>>>(
      '/activity-logs',
      { params }
    );
    return response.data.data;
  }
}

export const activityLogService = new ActivityLogService();
