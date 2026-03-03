import api from './client';
import type { Doctor, DoctorRequest } from '@/types';

export const getDoctors = () =>
    api.get<Doctor[]>('/doctors').then((r) => r.data);

export const getDoctor = (id: number) =>
    api.get<Doctor>(`/doctors/${id}`).then((r) => r.data);

export const createDoctor = (body: DoctorRequest) =>
    api.post<Doctor>('/doctors', body).then((r) => r.data);

export const updateDoctor = (id: number, body: DoctorRequest) =>
    api.put<Doctor>(`/doctors/${id}`, body).then((r) => r.data);

export const deleteDoctor = (id: number) =>
    api.delete(`/doctors/${id}`);
