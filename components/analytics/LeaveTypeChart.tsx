import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../AppContext.tsx';

interface LeaveTypeChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#6366F1'];

const LeaveTypeChart: React.FC<LeaveTypeChartProps> = ({ data }) => {
    const { theme } = useAppContext();
    const tickColor = theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)';
    const tooltipBg = theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)';
    const tooltipBorder = theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)';

    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Leave Request Analysis</h3>
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
                    <Tooltip 
                        formatter={(value, name) => [`${value} requests`, name]}
                        contentStyle={{ 
                            borderRadius: '0.5rem', 
                            border: `1px solid ${tooltipBorder}`, 
                            background: tooltipBg
                        }}
                    />
                    <Legend wrapperStyle={{ color: tickColor }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeaveTypeChart;