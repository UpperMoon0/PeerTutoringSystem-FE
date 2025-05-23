export interface TutorAvailability {
    availabilityId: string;
    tutorId: string;
    startTime: string; 
    endTime: string;  
    isRecurring: boolean;
    recurringDay: string; 
    recurrenceEndDate?: string | null;
    isBooked: boolean;
  }
  
  export interface CreateTutorAvailability {
    startTime: string; 
    endTime: string;   
    isRecurring: boolean;
    recurringDay: string;
    recurrenceEndDate?: string | null;
  }
  