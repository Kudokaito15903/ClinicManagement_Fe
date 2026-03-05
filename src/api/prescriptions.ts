import api from './client';
import type {
    Prescription,
    PrescriptionItem,
    CreatePrescriptionRequest,
    AddPrescriptionItemRequest,
    UpdatePrescriptionItemRequest,
} from '@/types';

export const getPrescription = (visitId: number): Promise<Prescription | null> =>
    api.get<Prescription>(`/visits/${visitId}/prescription`)
        .then((r) => (r.status === 204 ? null : r.data))
        .catch((err) => {
            if (err?.response?.status === 204) return null;
            throw err;
        });

export const createPrescription = (visitId: number, body: CreatePrescriptionRequest) =>
    api.post<Prescription>(`/visits/${visitId}/prescription`, body).then((r) => r.data);

export const updatePrescription = (visitId: number, body: CreatePrescriptionRequest) =>
    api.put<Prescription>(`/visits/${visitId}/prescription`, body).then((r) => r.data);

/** DELETE /api/visits/{visitId}/prescription */
export const deletePrescription = (visitId: number) =>
    api.delete(`/visits/${visitId}/prescription`);

/** POST /api/visits/{visitId}/prescription/items */
export const addPrescriptionItem = (visitId: number, body: AddPrescriptionItemRequest) =>
    api.post<PrescriptionItem>(`/visits/${visitId}/prescription/items`, body).then((r) => r.data);

/** PUT /api/visits/{visitId}/prescription/items/{itemId} */
export const updatePrescriptionItem = (
    visitId: number,
    itemId: number,
    body: UpdatePrescriptionItemRequest,
) => api.put<PrescriptionItem>(`/visits/${visitId}/prescription/items/${itemId}`, body).then((r) => r.data);

/** DELETE /api/visits/{visitId}/prescription/items/{itemId} */
export const deletePrescriptionItem = (visitId: number, itemId: number) =>
    api.delete(`/visits/${visitId}/prescription/items/${itemId}`);
