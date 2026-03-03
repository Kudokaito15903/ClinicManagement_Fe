import api from './client';
import type { SystemConfig } from '@/types';

/** GET /api/system-configs?search= */
export const getSystemConfigs = (params?: { search?: string }) =>
    api.get<SystemConfig[]>('/configs', { params }).then((r) => r.data);

/** GET /api/system-configs/:key */
export const getSystemConfig = (key: string) =>
    api.get<SystemConfig>(`/configs/${key}`).then((r) => r.data);

/** PUT /api/system-configs/:key */
export const updateSystemConfig = (key: string, body: { configValue: string; description?: string }) =>
    api.put<SystemConfig>(`/configs/${key}`, body).then((r) => r.data);

/** PATCH /api/system-configs */
export const updateSystemConfigs = (body: Record<string, string>) =>
    api.patch<{ updated: string[]; created: string[]; skipped: string[] }>('/configs', body).then((r) => r.data);

/** DELETE /api/system-configs/:key */
export const deleteSystemConfig = (key: string) =>
    api.delete(`/system-configs/${key}`);
