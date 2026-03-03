// ───────── Core entities (API Response shape) ─────────

export interface Patient {
    id: number;
    code: string;
    fullName: string;
    dateOfBirth?: string;           // "YYYY-MM-DD"
    gender?: 'Male' | 'Female' | 'Other';
    phone?: string;
    address?: string;
    note?: string;
    doctor?: DoctorRef | null;
    room?: RoomRef | null;
    diagnoses?: DiagnosisRef[] | null;
}

/** Lightweight ref embedded inside Visit / Patient response */
export interface DoctorRef {
    id: number;
    name: string;
}

/** Lightweight ref embedded inside Visit / Patient response */
export interface RoomRef {
    id: number;
    name: string;
}

/** Lightweight diagnosis ref embedded in Visit / Patient */
export interface DiagnosisRef {
    id: number;
    icdCode: string;
    name: string;
    category?: string;
    description?: string | null;
}

export interface Doctor {
    id: number;
    code?: string;
    fullName: string;
    specialty?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
}

export interface Room {
    id: number;
    code?: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface Diagnosis {
    id: number;
    icdCode: string;
    name: string;
    category?: string;
    description?: string;
}

export interface MedService {
    id: number;
    code: string;
    name: string;
    unit?: string;
    price: number;
    category?: string;
    isActive?: boolean;
}

export interface VisitServiceItem {
    id: number;
    serviceId: number;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    createdAt?: string;
}

export type VisitStatus = 'received' | 'examining' | 'done' | string;

export interface Visit {
    id: number;
    code?: string;
    patient?: Patient | null;
    doctor?: DoctorRef | null;
    room?: RoomRef | null;
    visitDate: string;
    reason?: string;
    conclusion?: string | null;
    status?: VisitStatus;
    diagnoses?: DiagnosisRef[];
    // kept for backward compat inside VisitFormPage (edit load)
    patientId?: number;
    doctorId?: number;
    roomId?: number;
    examinationFee?: number;
    notes?: string;
}

// ───────── Bill / Payment ─────────

export interface BillServiceItem {
    id: number;
    serviceId: number;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    createdAt?: string;
}

export interface Bill {
    visitId: number;
    visitDate?: string;
    clinicName?: string;
    patientCode?: string;
    patientName?: string;
    patientBirthYear?: number;
    patientGender?: string;
    patientAddress?: string;
    doctorName?: string;
    roomName?: string;
    diagnosisName?: string;
    examinationFee?: number;
    notes?: string;
    services: BillServiceItem[];
    serviceTotal?: number;
    grandTotal: number;
}

// ───────── Statistics & Reports ─────────

export interface Statistics {
    totalPatients: number;
    visitsToday: number;
    visitsThisMonth: number;
    revenueToday: number;
    revenueMonth: number;
    revenueTotal: number;
}

export interface DailyRevenue {
    date: string;
    visitCount: number;
    examinationRevenue?: number;
    serviceRevenue?: number;
    total: number;
}

export interface RevenueReportResponse {
    from: string;
    to: string;
    totalVisits: number;
    examinationTotal?: number;
    serviceTotal?: number;
    grandTotal: number;
    daily: DailyRevenue[];
}

// ───────── Request bodies ─────────

export interface PatientCreateRequest {
    fullName: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    phone?: string;
    address?: string;
    note?: string;
}

export interface PatientUpdateRequest {
    fullName: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    phone?: string;
    address?: string;
    note?: string;
}

export interface VisitCreateRequest {
    patientId: number;
    doctorId?: number;
    roomId?: number;
    reason?: string;
}

export interface VisitUpdateRequest {
    doctorId?: number;
    roomId?: number;
    reason?: string;
    conclusion?: string;
    examinationFee?: number;
    notes?: string;
}

export interface VisitStatusUpdateRequest {
    status: VisitStatus;
}

export interface DoctorRequest {
    fullName: string;
    specialty?: string;
}

export interface RoomRequest {
    name: string;
    description?: string;
}

export interface DiagnosisRequest {
    icdCode: string;
    name: string;
    category?: string;
    description?: string;
}

export interface MedServiceRequest {
    code: string;
    name: string;
    price: number;
}

export interface AddVisitServiceRequest {
    serviceId: number;
    quantity: number;
}

export interface ApiError {
    status: number;
    message: string;
    timestamp: string;
}
