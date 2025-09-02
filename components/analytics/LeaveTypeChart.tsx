import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LeaveTypeChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#F59E0B', '#3B82F6', '#EF4444'];

const LeaveTypeChart: React.FC<LeaveTypeChartProps> = ({ data }) => {
    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Leave Request Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} requests`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeaveTypeChart;