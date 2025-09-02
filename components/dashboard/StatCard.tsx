import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBgColor }) => {
  return (
    <div className="bg-brand-light p-5 rounded-xl border border-slate-200 flex items-center space-x-4 transition-shadow duration-300 shadow-sm hover:shadow-md">
       <div className={`p-3 rounded-full flex items-center justify-center`} style={{backgroundColor: iconBgColor + '1A', color: iconBgColor}}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-brand-dark mt-1">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;