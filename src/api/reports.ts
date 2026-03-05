import api from './client';
import type { Statistics, RevenueReportResponse } from '@/types';

export const getStatistics = () =>
    api.get<Statistics>('/statistics').then((r) => r.data);


export const getRevenueReport = (from: string, to: string) =>
    api.get<RevenueReportResponse>('/reports/revenue', { params: { from, to } }).then((r) => r.data);
