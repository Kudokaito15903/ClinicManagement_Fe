import api from './client';
import type { Diagnosis, DiagnosisRequest } from '@/types';

export const getDiagnoses = (keyword?: string) =>
    api.get<Diagnosis[]>('/diagnoses', { params: { keyword } }).then((r) => r.data);

export const getDiagnosis = (id: number) =>
    api.get<Diagnosis>(`/diagnoses/${id}`).then((r) => r.data);

export const createDiagnosis = (body: DiagnosisRequest) =>
    api.post<Diagnosis>('/diagnoses', body).then((r) => r.data);

export const updateDiagnosis = (id: number, body: DiagnosisRequest) =>
    api.put<Diagnosis>(`/diagnoses/${id}`, body).then((r) => r.data);

export const deleteDiagnosis = (id: number) =>
    api.delete(`/diagnoses/${id}`);
