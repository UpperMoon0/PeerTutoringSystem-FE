import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TutorProfileService } from '@/services/TutorProfileService';

export interface TutorBioStatus {
  hasBio: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useTutorBioStatus = (): TutorBioStatus => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<Omit<TutorBioStatus, 'refresh'>>({
    hasBio: false,
    loading: true,
    error: null
  });

  const checkBioStatus = useCallback(async () => {
    if (!currentUser?.userId) {
      setStatus({ hasBio: false, loading: false, error: null });
      return;
    }

    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await TutorProfileService.getTutorProfileByUserId(
        currentUser.userId,
        true // suppressErrors = true
      );

      const getErrorMessage = (error: string | { message: string; [key: string]: unknown } | Error | undefined): string => {
        if (!error) return 'Failed to check bio status';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && 'message' in error) return error.message;
        return 'Failed to check bio status';
      };

      setStatus({
        hasBio: result.success && !!result.data,
        loading: false,
        error: result.success ? null : getErrorMessage(result.error)
      });
    } catch (error) {
      setStatus({
        hasBio: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    checkBioStatus();
  }, [checkBioStatus]);

  return {
    ...status,
    refresh: checkBioStatus
  };
};