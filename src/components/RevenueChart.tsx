import {
    ResponsiveContainer, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, Area, AreaChart,
} from 'recharts';
import { Box } from '@mui/material';
import type { RevenueReport } from '@/types';

interface Props {
    data: RevenueReport[];
    height?: number;
}

const fmt = (v: number) => (v / 1_000_000).toFixed(1) + 'M';

export default function RevenueChart({ data, height = 300 }: Props) {
    return (
        <Box>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={fmt}
                        width={50}
                    />
                    <Tooltip
                        formatter={(v: number) => [v.toLocaleString('vi-VN') + ' ₫', 'Doanh thu']}
                        labelStyle={{ fontWeight: 600 }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Doanh thu (₫)"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#revenueGrad)"
                        dot={{ r: 3, fill: '#2563eb' }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="visitCount"
                        name="Số lần khám"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        yAxisId={0}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
}
