// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Patient Types
export interface Patient {
  id: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  address?: string | null;
  contact?: string | null;
  job?: string | null;
  medical_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  accessed_by_user_id?: string | null;
  last_accessed_at?: string | null;
}

// Doctor Types
export interface Doctor {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  specialty: string;
  created_at?: string;
  updated_at?: string;
}

// Appointment Types
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
}

// Treatment Types
export interface Treatment {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  sub_treatments?: SubTreatment[];
}

export type ToothAssociationType = 'not_related' | 'related' | 'required';

export interface SubTreatmentStepData {
  step_name: string;
  step_description?: string;
  step_order: number;
  completion_percentage?: number;
}

export interface SubTreatment {
  id: string;
  treatment_id: string;
  name: string;
  estimated_cost?: number | null;
  tooth_association: ToothAssociationType;
  sub_treatment_steps?: SubTreatmentStepData[] | SubTreatmentStep[];
  created_at?: string;
  updated_at?: string;
}

export interface SubTreatmentStep {
  id: string;
  sub_treatment_id: string;
  step_name: string;
  step_description?: string | null;
  step_order: number;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Treatment Plan Types
export interface TreatmentPlan {
  id: string;
  patient_id: string;
  treatment_id: string;
  sub_treatment_id: string;
  tooth_number: string;
  is_executed: boolean;
  appointment_id?: string | null;
  executed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  treatment?: Treatment;
  sub_treatment?: SubTreatment;
}

// Treatment Record Types
export interface TreatmentRecord {
  id: string;
  appointment_id: string;
  treatment_id: string;
  sub_treatment_id: string;
  tooth_number: string;
  actual_cost?: number | null;
  is_completed: boolean;
  performed_at: string;
  created_at?: string;
  updated_at?: string;
}

// Payment Types
export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  paid_at: string;
  created_at?: string;
  updated_at?: string;
}

// Waiting List Types
export type WaitingListStatus = 'waiting' | 'in_examination' | 'completed';

export interface WaitingListEntry {
  id: string;
  patient_id: string;
  appointment_id?: string | null;
  status: WaitingListStatus;
  clinic_arrival_time: string;
  examination_room_entry_time?: string | null;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  appointment?: Appointment;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: any;
  created_at: string;
}

// Unfinished Sub Treatment Types
export interface UnfinishedSubTreatment {
  id: string;
  patient_id: string;
  treatment_id: string;
  sub_treatment_id: string;
  tooth_number: string;
  is_marked_complete: boolean;
  last_appointment_id?: string | null;
  notes?: string | null;
  started_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Appointment Treatment Step Types
export interface AppointmentTreatmentStep {
  id: string;
  appointment_id: string;
  sub_treatment_step_id: string;
  is_completed: boolean;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}
