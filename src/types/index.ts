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

export type AcademicTitle = 'None' | 'Master_CKI' | 'PhD_CKII' | 'AssociateProfessor' | 'Professor';

/** Shape returned by GET /api/doctors and GET /api/doctors/{id} */
export interface Doctor {
    id: number;
    code: string;            // auto-generated, e.g. BS001
    fullName: string;
    specialty?: string | null;
    academicTitle?: AcademicTitle | null;
    phone?: string | null;
    email?: string | null;
    isActive: boolean;
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

// Status values as returned by the API (PascalCase)
export type VisitStatus = 'Received' | 'Examining' | 'WaitingResult' | 'Completed' | 'Paid' | string;

export interface Visit {
    id: number;
    code?: string;
    // Flat fields returned by GET /visits list endpoint
    patientName?: string;
    doctorName?: string;
    roomName?: string;
    // Nested objects returned by GET /visits/:id detail endpoint
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

// Response shape of GET /visits/:id/detail
export interface VisitDetailResponse {
    visit: Visit;
    services: VisitServiceItem[];
    serviceTotal: number;
    examinationFee: number;
    grandTotal: number;
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
    specialty?: string | null;
    academicTitle?: AcademicTitle | null;
    phone?: string | null;
    email?: string | null;
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

// ───────── Visit Diagnoses ─────────

export interface VisitDiagnosis {
    id: number;
    visitId: number;
    diagnosisId: number;
    icdCode: string;
    name: string;
    category?: string;
    isPrimary?: boolean;
    note?: string;
}

export interface AddVisitDiagnosisRequest {
    diagnosisId: number;
    isPrimary?: boolean; // true = chính, false = phụ
    note?: string;
}

// ───────── Payment ─────────

/** Backend enum — PascalCase string as returned by API */
export type PaymentMethod = 'Cash' | 'Card' | 'Transfer';

export interface PaymentCreateRequest {
    examinationFee?: number | null;  // null → backend uses SystemConfig default
    discount?: number;
    paymentMethod?: PaymentMethod;   // default: "Cash"
    cashierNote?: string | null;
}

export interface PaymentResponse {
    id: number;
    visitId: number;
    examinationFee: number;
    serviceTotal: number;
    grandTotal: number;       // = finalAmount + discount
    discount: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    paidAt: string | null;    // ISO datetime UTC
    cashierNote: string | null;
    createdAt: string;        // ISO datetime UTC
}

// ───────── System Configs ─────────

export interface SystemConfig {
    configKey: string;
    configValue: string;
    description?: string;
}

// ───────── Medicine (Danh mục thuốc) ─────────

export interface Medicine {
    id: number;
    code: string;
    name: string;
    ingredient?: string | null;
    dosageForm?: string | null;
    unit: string;
    manufacturer?: string | null;
    countryOfOrigin?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface MedicineRequest {
    code?: string;           // required for POST only
    name: string;
    unit: string;
    ingredient?: string | null;
    dosageForm?: string | null;
    manufacturer?: string | null;
    countryOfOrigin?: string | null;
}

// ───────── Prescription (Đơn thuốc) ─────────

export interface PrescriptionItem {
    id: number;
    medicineId: number;
    medicineCode?: string;
    medicineName: string;
    dosageForm?: string | null;
    unit?: string | null;
    quantity: number;
    dosageInstruction?: string | null;
    note?: string | null;
}

export interface Prescription {
    id: number;
    visitId: number;
    note?: string | null;
    items: PrescriptionItem[];
    createdAt?: string;
}

export interface CreatePrescriptionRequest {
    note?: string;
}

export interface AddPrescriptionItemRequest {
    medicineId: number;
    quantity: number;
    dosageInstruction?: string;
    note?: string;
}

export interface UpdatePrescriptionItemRequest {
    quantity: number;
    dosageInstruction?: string;
    note?: string;
}
