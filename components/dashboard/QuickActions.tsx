import React from 'react';
import Button from '../common/Button.tsx';
import PayrollIcon from '../icons/PayrollIcon';
import EmployeesIcon from '../icons/EmployeesIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import { getLatestPayrollRun } from '../../services/api';
import { useToasts } from '../../hooks/useToasts.tsx';
import { useAppContext } from '../../AppContext.tsx';
import SkeletonLoader from '../common/SkeletonLoader.tsx';
import Card from '../common/Card.tsx';
import TimeIcon from '../icons/TimeIcon.tsx';

interface QuickActionHandlers {
    onProcessPayroll: () => void;
    onAddEmployee: () => void;
    onViewReports: () => void;
}

interface QuickActionsProps extends QuickActionHandlers {
    isLoading?: boolean;
}

const downloadWPSFile = (content: string, month: string, year: number) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `WPS_${month.toUpperCase()}_${year}.sif`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const QuickActionItem: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void | Promise<void>; isAsync?: boolean }> = ({ icon, title, description, onClick, isAsync }) => {
    const [loading, setLoading] = React.useState(false);

    const handleClick = async () => {
        if (isAsync) {
            setLoading(true);
            await onClick();
            setLoading(false);
        } else {
            onClick();
        }
    };

    return (
        <div className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
            <div className="text-primary">{icon}</div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleClick} isLoading={loading}>Start</Button>
        </div>
    );
};

const QuickActions: React.FC<QuickActionsProps> = ({ isLoading, ...handlers }) => {
    const { addToast } = useToasts();
    const { currentUser } = useAppContext();

    const handleGenerateWPS = async () => {
        const latestRun = await getLatestPayrollRun(currentUser!.tenantId);
        if (latestRun && latestRun.wpsFileContent) {
            downloadWPSFile(latestRun.wpsFileContent, latestRun.month, latestRun.year);
            addToast('Latest WPS SIF file downloaded.', 'success');
        } else {
            addToast('No recent payroll run with a WPS file found.', 'error');
        }
    };
    
  if (isLoading) {
      return (
          <Card
            title="Quick Actions"
            subtitle="Frequently used HR operations"
            icon={<TimeIcon className="w-6 h-6"/>}
          >
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
                        <SkeletonLoader className="w-5 h-5" />
                        <div className="flex-1 space-y-2">
                            <SkeletonLoader className="h-4 w-1/2" />
                            <SkeletonLoader className="h-3 w-3/4" />
                        </div>
                        <SkeletonLoader className="h-7 w-[68px] rounded-lg" />
                    </div>
                ))}
            </div>
          </Card>
      );
  }

  return (
    <Card
        title="Quick Actions"
        subtitle="Frequently used HR operations"
        icon={<TimeIcon className="w-6 h-6"/>}
    >
        <div>
            <QuickActionItem 
                icon={<PayrollIcon className="w-5 h-5"/>} 
                title="Process Monthly Payroll"
                description="Generate salary calculations for current month"
                onClick={handlers.onProcessPayroll}
            />
            <QuickActionItem 
                icon={<EmployeesIcon className="w-5 h-5"/>} 
                title="Add New Employee"
                description="Register new employee in the system"
                onClick={handlers.onAddEmployee}
            />
            <QuickActionItem 
                icon={<PayrollIcon className="w-5 h-5"/>} 
                title="Generate WPS File"
                description="Create WPS file for bank submission"
                onClick={handleGenerateWPS}
                isAsync={true}
            />
            <QuickActionItem 
                icon={<AnalyticsIcon className="w-5 h-5"/>} 
                title="View Reports"
                description="Access HR and payroll reports"
                onClick={handlers.onViewReports}
            />
        </div>
    </Card>
  );
};

export default QuickActions;