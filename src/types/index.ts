export interface Patient {
    id: number;
    code: string;
    fullName: string;
    birthYear?: number;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
    createdAt?: string;
}

export interface Doctor {
    id: number;
    fullName: string;
    specialty?: string;
}

export interface Room {
    id: number;
    name: string;
    description?: string;
}

export interface Diagnosis {
    id: number;
    code: string;
    name: string;
    description?: string;
}

export interface MedService {
    id: number;
    code: string;
    name: string;
    price: number;
}

export interface VisitServiceItem {
    id: number;
    serviceId: number;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Visit {
    id: number;
    patientId: number;
    patient?: Patient;
    doctorId?: number;
    doctor?: Doctor;
    roomId?: number;
    room?: Room;
    diagnosisId?: number;
    diagnosis?: Diagnosis;
    visitDate: string;
    examinationFee: number;
    notes?: string;
    visitServices?: VisitServiceItem[];
}

export interface Bill {
    visitId: number;
    patientName: string;
    visitDate: string;
    examinationFee: number;
    services: VisitServiceItem[];
    totalAmount: number;
}

export interface Statistics {
    totalPatients: number;
    totalVisitsToday: number;
    totalRevenueMonth: number;
    totalDoctors: number;
}

export interface RevenueReport {
    date: string;
    revenue: number;
    visitCount: number;
}

export interface PatientCreateRequest {
    code?: string;
    fullName: string;
    birthYear?: number;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
}

export interface PatientUpdateRequest {
    fullName: string;
    birthYear?: number;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
}

export interface VisitCreateRequest {
    patientId: number;
    doctorId?: number;
    roomId?: number;
    diagnosisId?: number;
    examinationFee?: number;
    notes?: string;
}

export interface VisitUpdateRequest {
    doctorId?: number;
    roomId?: number;
    diagnosisId?: number;
    examinationFee?: number;
    notes?: string;
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
    code: string;
    name: string;
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
