import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PayrollRun } from '../../types';
import { useAppContext } from '../../AppContext.tsx';

interface PayrollCostChartProps {
    data: PayrollRun[];
}

const PayrollCostChart: React.FC<PayrollCostChartProps> = ({ data }) => {
    const { theme } = useAppContext();
    const chartData = [...data].reverse().slice(-6).map(run => ({
        name: `${run.month.substring(0, 3)} ${run.year}`,
        'Total Cost': run.totalAmount,
    }));

    const gridColor = theme === 'dark' ? 'hsl(217.2 32.6% 22.5%)' : 'hsl(214.3 31.8% 91.4%)';
    const tickColor = theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)';
    const tooltipBg = theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)';
    const tooltipBorder = theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)';

    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payroll Cost Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor }} />
                    <YAxis tickFormatter={(value) => `QAR ${Number(value) / 1000}k`} tick={{ fill: tickColor }} />
                    <Tooltip 
                        formatter={(value) => [`QAR ${Number(value).toLocaleString()}`, "Total Cost"]} 
                        cursor={{ fill: theme === 'dark' ? 'hsla(210, 40%, 98%, 0.1)' : 'hsla(222, 47%, 11%, 0.1)' }}
                        contentStyle={{ 
                            borderRadius: '0.5rem', 
                            border: `1px solid ${tooltipBorder}`, 
                            background: tooltipBg
                        }}
                    />
                    <Legend wrapperStyle={{ color: tickColor }} />
                    <Bar dataKey="Total Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PayrollCostChart;