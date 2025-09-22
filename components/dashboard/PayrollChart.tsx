import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PayrollRun } from '../../types.ts';
import SkeletonLoader from '../common/SkeletonLoader.tsx';
import Card from '../common/Card.tsx';
import PayrollIcon from '../icons/PayrollIcon.tsx';
import { useAppContext } from '../../AppContext.tsx';

interface PayrollChartProps {
    payrollRuns: PayrollRun[];
    isLoading?: boolean;
}

const PayrollChart: React.FC<PayrollChartProps> = ({ payrollRuns, isLoading }) => {
    const { theme } = useAppContext();
    const chartData = [...payrollRuns]
        .sort((a, b) => new Date(a.runDate).getTime() - new Date(b.runDate).getTime())
        .slice(-6)
        .map(run => ({
            name: `${run.month.substring(0, 3)} '${String(run.year).substring(2)}`,
            'Total Payroll': run.totalAmount,
        }));
    
    if (isLoading) {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm col-span-1 lg:col-span-2 h-[372px] flex flex-col">
                 <SkeletonLoader className="h-6 w-1/2 mb-4" />
                 <div className="flex-1 flex justify-around items-end pb-10">
                    <SkeletonLoader className="w-8 h-2/4" />
                    <SkeletonLoader className="w-8 h-3/4" />
                    <SkeletonLoader className="w-8 h-2/5" />
                    <SkeletonLoader className="w-8 h-3/5" />
                    <SkeletonLoader className="w-8 h-5/6" />
                    <SkeletonLoader className="w-8 h-4/6" />
                 </div>
            </div>
        );
    }

    return (
        <Card 
            title="Payroll History"
            subtitle="Last 6 Months"
            icon={<PayrollIcon className="w-6 h-6"/>}
            className="col-span-1 lg:col-span-2"
            noPadding
        >
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tickFormatter={(value) => `QAR ${Number(value) / 1000}k`} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip 
                        formatter={(value: number) => [`QAR ${value.toLocaleString()}`, "Total Payroll"]}
                        cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }}
                        contentStyle={{ 
                            borderRadius: '0.5rem', 
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`, 
                            background: theme === 'dark' ? '#1f2937' : '#ffffff' 
                        }}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }} />
                    <Bar dataKey="Total Payroll" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30}/>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default PayrollChart;