import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PayrollRun } from '../../types';

interface PayrollCostChartProps {
    data: PayrollRun[];
}

const PayrollCostChart: React.FC<PayrollCostChartProps> = ({ data }) => {
    const chartData = [...data].reverse().slice(-6).map(run => ({
        name: `${run.month.substring(0, 3)} ${run.year}`,
        'Total Cost': run.totalAmount,
    }));

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Payroll Cost Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `QAR ${Number(value) / 1000}k`} />
                    <Tooltip formatter={(value) => [`QAR ${Number(value).toLocaleString()}`, "Total Cost"]} />
                    <Legend />
                    <Bar dataKey="Total Cost" fill="#6B7280" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PayrollCostChart;