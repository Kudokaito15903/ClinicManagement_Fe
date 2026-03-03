import api from './client';
import type { MedService, MedServiceRequest } from '@/types';

export const getServices = () =>
    api.get<MedService[]>('/services').then((r) => r.data);

export const getService = (id: number) =>
    api.get<MedService>(`/services/${id}`).then((r) => r.data);

export const createService = (body: MedServiceRequest) =>
    api.post<MedService>('/services', body).then((r) => r.data);

export const updateService = (id: number, body: MedServiceRequest) =>
    api.put<MedService>(`/services/${id}`, body).then((r) => r.data);

export const deleteService = (id: number) =>
    api.delete(`/services/${id}`);
