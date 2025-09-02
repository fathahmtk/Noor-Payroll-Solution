import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PayrollRun } from '../../types';

interface PayrollChartProps {
    payrollRuns: PayrollRun[];
}

const PayrollChart: React.FC<PayrollChartProps> = ({ payrollRuns }) => {
    const chartData = [...payrollRuns]
        .sort((a, b) => new Date(a.runDate).getTime() - new Date(b.runDate).getTime())
        .slice(-6)
        .map(run => ({
            name: `${run.month.substring(0, 3)} '${String(run.year).substring(2)}`,
            'Total Payroll': run.totalAmount,
        }));

    return (
        <div className="bg-brand-light p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Payroll History (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `QAR ${Number(value) / 1000}k`} />
                    <Tooltip 
                        formatter={(value: number) => [`QAR ${value.toLocaleString()}`, "Total Payroll"]}
                        cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="Total Payroll" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PayrollChart;
