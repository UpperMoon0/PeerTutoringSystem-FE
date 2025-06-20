import type { ApiResult, ServiceResult } from '@/types/api.types';
import { AuthService } from './AuthService';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface DashboardStatistics {
  totalUsers: number;
  pendingVerifications: number;
  totalSkills: number;
  activeAdmins: number;
}

export const AdminDashboardService = {
  getDashboardStatistics: async (): Promise<ServiceResult<DashboardStatistics>> => {
    try {
      const fullUrl = `${API_URL}/Users/dashboard-statistics`;
      console.log('AdminDashboardService: Calling API URL:', fullUrl);
      console.log('AdminDashboardService: API_URL base:', API_URL);
      
      const response = await AuthService.fetchWithAuth(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('AdminDashboardService: API call failed with status:', response.status);
        const errorData: ApiResult<DashboardStatistics> = await response.json();
        console.log('AdminDashboardService: Error response data:', errorData);
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }

      // If response is OK, the body is the dashboard statistics object directly
      const statistics: DashboardStatistics = await response.json();
      console.log('AdminDashboardService: API call successful, received data:', statistics);
      return { success: true, data: statistics };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      // Attempt to parse error response if it's a fetch error that might contain JSON
      if (error instanceof Response && !error.ok) {
        try {
          const errorData: ApiResult<unknown> = await error.json();
          return { success: false, error: errorData.error || 'An unexpected error occurred while parsing the error response.' };
        } catch {
          return { success: false, error: 'An unexpected error occurred and the error response could not be parsed.' };
        }
      }
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};