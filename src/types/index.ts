import { Dayjs } from 'dayjs';

// Type definitions
export interface NameData {
  name: string;
  email: string;
}

export interface TimeSlot {
  start: Dayjs | null;
  end: Dayjs | null;
}

export interface Availability {
  [key: string]: TimeSlot[];
}

export interface Divisions {
  kerrytown: boolean;
  central: boolean;
  hill: boolean;
  lower_bp: boolean;
  upper_bp: boolean;
  pierpont: boolean;
}

export interface DriveDetail {
  date: Dayjs | null;
  start: Dayjs | null;
  end: Dayjs | null;
}

export interface FormattedTimeSlot {
  start: string | null;
  end: string | null;
  driver: null;
}

export interface FormattedAvailability {
  [key: string]: FormattedTimeSlot[];
}

export interface RiderData {
  name: string;
  email: string;
  availability: FormattedAvailability;
  divisions: Divisions;
}

export interface DriverData {
  name: string;
  email: string;
  address: string;
  phone: string;
  drives: Array<{
    [key: string]: Array<{
      start: string | null;
      end: string | null;
      capacity: string | null;
    }>;
  }>;
}

export interface SheetsResponse {
  data: Array<{
    "First Name": string;
    "Last Name": string;
    Uniqname?: string;
  }>;
}

export interface ApiResponse {
  message: string;
  driver_id?: string;
  rider_id?: string;
} 