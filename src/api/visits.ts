import api from './client';
import type {
    Visit,
    VisitCreateRequest,
    VisitUpdateRequest,
    VisitStatusUpdateRequest,
    VisitServiceItem,
    Bill,
    AddVisitServiceRequest,
} from '@/types';

/** GET /api/visits?date=&status=&doctorId= */
export const getVisits = (params?: { date?: string; status?: string; doctorId?: number }) =>
    api.get<Visit[]>('/visits', { params }).then((r) => r.data);

/** POST /api/visits */
export const createVisit = (body: VisitCreateRequest) =>
    api.post<Visit>('/visits', body).then((r) => r.data);

/** GET /api/visits/{id} */
export const getVisit = (id: number) =>
    api.get<Visit>(`/visits/${id}`).then((r) => r.data);

/** GET /api/visits/{id}/detail */
export const getVisitDetail = (id: number) =>
    api.get<Visit>(`/visits/${id}/detail`).then((r) => r.data);

/** PUT /api/visits/{id} */
export const updateVisit = (id: number, body: VisitUpdateRequest) =>
    api.put<Visit>(`/visits/${id}`, body).then((r) => r.data);

/** PATCH /api/visits/{id}/status */
export const updateVisitStatus = (id: number, body: VisitStatusUpdateRequest) =>
    api.patch<Visit>(`/visits/${id}/status`, body).then((r) => r.data);

/** GET /api/visits/{visitId}/services */
export const getVisitServices = (visitId: number) =>
    api.get<VisitServiceItem[]>(`/visits/${visitId}/services`).then((r) => r.data);

/** POST /api/visits/{visitId}/services */
export const addVisitService = (visitId: number, body: AddVisitServiceRequest) =>
    api.post<VisitServiceItem>(`/visits/${visitId}/services`, body).then((r) => r.data);

/** DELETE /api/visits/{visitId}/services/{vsId} */
export const deleteVisitService = (visitId: number, vsId: number) =>
    api.delete(`/visits/${visitId}/services/${vsId}`);

/** GET /api/visits/{visitId}/bill */
export const getVisitBill = (visitId: number) =>
    api.get<Bill>(`/visits/${visitId}/bill`).then((r) => r.data);

/** Returns the URL for the HTML receipt (open in new tab) */
export const getVisitReceiptUrl = (visitId: number) =>
    `/api/visits/${visitId}/receipt`;
