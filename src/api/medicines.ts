import api from './client';
import type { Medicine, MedicineRequest } from '@/types';

/** GET /api/medicines?search=&activeOnly= */
export const getMedicines = (params?: { search?: string; activeOnly?: boolean }) =>
    api.get<Medicine[]>('/medicines', { params }).then((r) => r.data);

/** POST /api/medicines */
export const createMedicine = (body: MedicineRequest) =>
    api.post<Medicine>('/medicines', body).then((r) => r.data);

/** PUT /api/medicines/{id} */
export const updateMedicine = (id: number, body: MedicineRequest) =>
    api.put<Medicine>(`/medicines/${id}`, body).then((r) => r.data);

/** PATCH /api/medicines/{id}/toggle-active */
export const toggleMedicineActive = (id: number) =>
    api.patch<Medicine>(`/medicines/${id}/toggle-active`).then((r) => r.data);

/** DELETE /api/medicines/{id} */
export const deleteMedicine = (id: number) =>
    api.delete(`/medicines/${id}`);
