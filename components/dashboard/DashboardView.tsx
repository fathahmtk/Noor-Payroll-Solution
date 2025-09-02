import React from 'react';
import StatCard from './StatCard';
import QuickActions from './QuickActions';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getPayrollRuns, getAlerts } from '../../services/api';
import { View } from '../../types';
import EmployeesIcon from '../icons/EmployeesIcon';
import PayrollIcon from '../icons/PayrollIcon';
import PendingIcon from '../icons/PendingIcon';
import VisaIcon from '../icons/VisaIcon';
import PayrollChart from './PayrollChart';
import LoadingSpinner from '../common/LoadingSpinner';
import AIInsights from './AIInsights';
import { useAppContext } from '../../AppContext';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { openModal, employees, currentUser } = useAppContext();
  const { data: payrollRuns, loading: loadingPayroll } = useDataFetching(() => getPayrollRuns(currentUser!.tenantId));
  const { data: alerts, loading: loadingAlerts } = useDataFetching(() => getAlerts(currentUser!.tenantId));
  const loading = !employees || loadingPayroll || loadingAlerts;

  const latestPayroll = payrollRuns?.[0];
  const totalPayroll = latestPayroll ? latestPayroll.totalAmount : 0;
  const employeeCount = employees?.length || 0;

  if (loading) {
    return <div className="p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={employeeCount} subtitle="active employees" icon={<EmployeesIcon className="w-6 h-6"/>} iconBgColor="#2563eb" />
        <StatCard title="Monthly Payroll" value={`QAR ${totalPayroll.toLocaleString()}`} subtitle={latestPayroll ? `${latestPayroll?.month} ${latestPayroll?.year}`: 'No data'} icon={<PayrollIcon className="w-6 h-6"/>} iconBgColor="#10b981" />
        <StatCard title="Pending Tasks" value={alerts?.pendingLeaves?.length ?? 0} subtitle="Leave requests" icon={<PendingIcon className="w-6 h-6"/>} iconBgColor="#f59e0b" />
        <StatCard title="Expiring Visas" value={alerts?.expiringDocs?.length ?? 0} subtitle="Next 30 days" icon={<VisaIcon className="w-6 h-6"/>} iconBgColor="#ef4444" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <PayrollChart payrollRuns={payrollRuns || []} />
        </div>
        <div className="space-y-8">
            <QuickActions 
                onProcessPayroll={() => openModal('runPayroll')}
                onAddEmployee={() => openModal('addEmployee')}
                onViewReports={() => onNavigate(View.AnalyticsReports)}
            />
            <AIInsights onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
