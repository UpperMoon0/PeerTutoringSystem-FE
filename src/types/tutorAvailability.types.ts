export interface TutorAvailability {
    availabilityId: string;
    tutorId: string;
    startTime: string;
    endTime: string;   
    isRecurring: boolean;
    recurringDay: string | null; 
    recurrenceEndDate: string | null;
    isBooked: boolean;
}

export interface CreateTutorAvailability {
    startTime: string; 
    endTime: string;   
    isRecurring: boolean;
    recurringDay: string;
    recurrenceEndDate?: string | null;
}

export interface TutorAvailabilitiesPayload { 
    availabilities: TutorAvailability[];
    totalCount: number;
    page: number;
    pageSize: number;
}
