import { AuthService } from './AuthService';
import type { ApiResult } from '@/types/api.types';
import type { CreateWithdrawRequest, WithdrawRequest } from '@/types/withdraw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const createWithdrawRequest = async (payload: CreateWithdrawRequest): Promise<ApiResult<WithdrawRequest>> => {
  const url = `${API_BASE_URL}/payment/withdraw`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to create withdraw request' };
    }

    const data: WithdrawRequest = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

const cancelWithdrawRequest = async (id: string): Promise<ApiResult<WithdrawRequest>> => {
  const url = `${API_BASE_URL}/payment/withdraw/${id}/cancel`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to cancel withdraw request' };
    }

    const data: WithdrawRequest = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

const getMyWithdrawRequests = async (): Promise<ApiResult<WithdrawRequest[]>> => {
  const url = `${API_BASE_URL}/payment/withdraw/my-requests`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to get withdraw requests' };
    }

    const data: WithdrawRequest[] = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};


const getWithdrawRequests = async (): Promise<ApiResult<WithdrawRequest[]>> => {
  const url = `${API_BASE_URL}/payment/withdraw`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to get withdraw requests' };
    }

    const data: WithdrawRequest[] = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

const approveWithdrawRequest = async (id: string): Promise<ApiResult<WithdrawRequest>> => {
  const url = `${API_BASE_URL}/payment/withdraw/${id}/approve`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to approve withdraw request' };
    }

    const data: WithdrawRequest = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

const rejectWithdrawRequest = async (id: string): Promise<ApiResult<WithdrawRequest>> => {
  const url = `${API_BASE_URL}/payment/withdraw/${id}/reject`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to reject withdraw request' };
    }

    const data: WithdrawRequest = await response.json();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

export const WithdrawService = {
  createWithdrawRequest,
  cancelWithdrawRequest,
  getMyWithdrawRequests,
  getWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
};