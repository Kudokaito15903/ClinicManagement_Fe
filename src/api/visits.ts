import api from './client';
import type { Visit, VisitCreateRequest, VisitUpdateRequest, VisitServiceItem, Bill, AddVisitServiceRequest } from '@/types';

export const createVisit = (body: VisitCreateRequest) =>
    api.post<Visit>('/visits', body).then((r) => r.data);

export const getVisit = (id: number) =>
    api.get<Visit>(`/visits/${id}`).then((r) => r.data);

export const getVisitDetail = (id: number) =>
    api.get<Visit>(`/visits/${id}/detail`).then((r) => r.data);

export const updateVisit = (id: number, body: VisitUpdateRequest) =>
    api.put<Visit>(`/visits/${id}`, body).then((r) => r.data);

export const getVisitServices = (visitId: number) =>
    api.get<VisitServiceItem[]>(`/visits/${visitId}/services`).then((r) => r.data);

export const addVisitService = (visitId: number, body: AddVisitServiceRequest) =>
    api.post<VisitServiceItem>(`/visits/${visitId}/services`, body).then((r) => r.data);

export const deleteVisitService = (visitId: number, vsId: number) =>
    api.delete(`/visits/${visitId}/services/${vsId}`);

export const getVisitBill = (visitId: number) =>
    api.get<Bill>(`/visits/${visitId}/bill`).then((r) => r.data);

export const getVisitReceiptUrl = (visitId: number) =>
    `/api/visits/${visitId}/receipt`;
