import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HeadcountChartProps {
    data: { month: string; count: number }[];
}

const HeadcountChart: React.FC<HeadcountChartProps> = ({ data }) => {
    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Employee Headcount Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#00A896" strokeWidth={2} name="Total Employees" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HeadcountChart;