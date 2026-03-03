import api from './client';
import type { Statistics, RevenueReportResponse } from '@/types';

/** GET /api/statistics */
export const getStatistics = () =>
    api.get<Statistics>('/statistics').then((r) => r.data);

/**
 * GET /api/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns a RevenueReportResponse object (not an array).
 * The `daily` field contains per-day breakdown.
 */
export const getRevenueReport = (from: string, to: string) =>
    api.get<RevenueReportResponse>('/reports/revenue', { params: { from, to } }).then((r) => r.data);
