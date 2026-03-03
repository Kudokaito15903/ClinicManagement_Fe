import api from './client';
import type { Patient, PatientCreateRequest, PatientUpdateRequest, Visit } from '@/types';

export const getPatients = (keyword?: string) =>
    api.get<Patient[]>('/patients', { params: { keyword } }).then((r) => r.data);

export const getPatient = (id: number) =>
    api.get<Patient>(`/patients/${id}`).then((r) => r.data);

export const getPatientVisits = (id: number) =>
    api.get<Visit[]>(`/patients/${id}/visits`).then((r) => r.data);

export const createPatient = (body: PatientCreateRequest) =>
    api.post<Patient>('/patients', body).then((r) => r.data);

export const updatePatient = (id: number, body: PatientUpdateRequest) =>
    api.put<Patient>(`/patients/${id}`, body).then((r) => r.data);

export const deletePatient = (id: number) =>
    api.delete(`/patients/${id}`);
