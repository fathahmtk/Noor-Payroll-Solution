import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../AppContext.tsx';

interface HeadcountChartProps {
    data: { month: string; count: number }[];
}

const HeadcountChart: React.FC<HeadcountChartProps> = ({ data }) => {
    const { theme } = useAppContext();
    const gridColor = theme === 'dark' ? 'hsl(217.2 32.6% 22.5%)' : 'hsl(214.3 31.8% 91.4%)';
    const tickColor = theme === 'dark' ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)';
    const tooltipBg = theme === 'dark' ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)';
    const tooltipBorder = theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)';

    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Employee Headcount Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" tick={{ fill: tickColor }} />
                    <YAxis allowDecimals={false} tick={{ fill: tickColor }} />
                    <Tooltip 
                         contentStyle={{ 
                            borderRadius: '0.5rem', 
                            border: `1px solid ${tooltipBorder}`, 
                            background: tooltipBg
                        }}
                    />
                    <Legend wrapperStyle={{ color: tickColor }} />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name="Total Employees" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HeadcountChart;