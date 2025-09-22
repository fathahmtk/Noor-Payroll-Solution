import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader.tsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBgColor, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card p-5 rounded-xl border border-border flex items-center space-x-4">
        <SkeletonLoader className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-2/3" />
          <SkeletonLoader className="h-6 w-1/2" />
          <SkeletonLoader className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border flex items-center space-x-4 transition-shadow duration-300 shadow-sm hover:shadow-md">
       <div className={`p-3 rounded-full flex items-center justify-center`} style={{backgroundColor: iconBgColor + '1A', color: iconBgColor}}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-xs text-muted-foreground/80">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;