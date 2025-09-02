import React from 'react';
import Button from '../common/Button';
import PayrollIcon from '../icons/PayrollIcon';
import EmployeesIcon from '../icons/EmployeesIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import { getLatestPayrollRun } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../AppContext';

interface QuickActionHandlers {
    onProcessPayroll: () => void;
    onAddEmployee: () => void;
    onViewReports: () => void;
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
        <div className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
            <div className="text-brand-primary">{icon}</div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-brand-dark">{title}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleClick} isLoading={loading}>Start</Button>
        </div>
    );
};


const QuickActions: React.FC<QuickActionHandlers> = (handlers) => {
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

  return (
    <div className="bg-brand-light p-5 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <div>
                <h3 className="text-base font-bold text-brand-dark">Quick Actions</h3>
                <p className="text-xs text-gray-400">Frequently used HR operations</p>
             </div>
        </div>
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
    </div>
  );
};

export default QuickActions;
