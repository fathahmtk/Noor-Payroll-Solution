import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentSalaryChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];

const DepartmentSalaryChart: React.FC<DepartmentSalaryChartProps> = ({ data }) => {
    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Salary Distribution by Department</h3>
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
                    <Tooltip formatter={(value) => `QAR ${Number(value).toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DepartmentSalaryChart;