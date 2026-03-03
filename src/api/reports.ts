import api from './client';
import type { Statistics, RevenueReport } from '@/types';

export const getStatistics = () =>
    api.get<Statistics>('/statistics').then((r) => r.data);

export const getRevenueReport = (from: string, to: string) =>
    api.get<RevenueReport[]>('/reports/revenue', { params: { from, to } }).then((r) => r.data);
