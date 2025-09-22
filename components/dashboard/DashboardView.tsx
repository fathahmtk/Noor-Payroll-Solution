
import React from 'react';
import StatCard from './StatCard.tsx';
import QuickActions from './QuickActions.tsx';
import { useDataFetching } from '../../hooks/useDataFetching.ts';
import { getPayrollRuns, getAlerts } from '../../services/api.ts';
import { View } from '../../types.ts';
import EmployeesIcon from '../icons/EmployeesIcon.tsx';
import PayrollIcon from '../icons/PayrollIcon.tsx';
import PendingIcon from '../icons/PendingIcon.tsx';
import DocumentIcon from '../icons/DocumentIcon.tsx';
import PayrollChart from './PayrollChart.tsx';
import AIInsights from './AIInsights.tsx';
import { useAppContext } from '../../AppContext.tsx';

interface DashboardViewProps {
  onNavigate: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { openModal, employees, loading: loadingEmployees, currentUser } = useAppContext();
  const { data: payrollRuns, loading: loadingPayroll } = useDataFetching(
    currentUser ? `payrollRuns-${currentUser.tenantId}` : null,
    () => getPayrollRuns(currentUser!.tenantId)
  );
  const { data: alerts, loading: loadingAlerts } = useDataFetching(
    currentUser ? `alerts-${currentUser.tenantId}` : null,
    () => getAlerts(currentUser!.tenantId)
  );

  const isOverallLoading = loadingEmployees || loadingPayroll || loadingAlerts;

  const latestPayroll = payrollRuns?.[0];
  const totalPayroll = latestPayroll ? latestPayroll.totalAmount : 0;
  const employeeCount = employees?.length || 0;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          isLoading={loadingEmployees}
          title="Total Employees" 
          value={employeeCount} 
          subtitle="active employees" 
          icon={<EmployeesIcon className="w-6 h-6"/>} 
          iconBgColor="#60a5fa" 
        />
        <StatCard 
          isLoading={loadingPayroll}
          title="Monthly Payroll" 
          value={`QAR ${totalPayroll.toLocaleString()}`} 
          subtitle={latestPayroll ? `${latestPayroll?.month} ${latestPayroll?.year}`: 'No data'} 
          icon={<PayrollIcon className="w-6 h-6"/>} 
          iconBgColor="#34d399" 
        />
        <StatCard 
          isLoading={loadingAlerts}
          title="Pending Tasks" 
          value={alerts?.pendingLeaves?.length ?? 0} 
          subtitle="Leave requests" 
          icon={<PendingIcon className="w-6 h-6"/>} 
          iconBgColor="#f59e0b" 
        />
        <StatCard 
          isLoading={loadingAlerts}
          title="Expiring Documents" 
          value={alerts?.expiringDocs?.length ?? 0} 
          subtitle="Next 30 days" 
          icon={<DocumentIcon className="w-6 h-6"/>} 
          iconBgColor="#ef4444" 
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <PayrollChart payrollRuns={payrollRuns || []} isLoading={loadingPayroll} />
        </div>
        <div className="space-y-8">
            <QuickActions 
                onProcessPayroll={() => openModal('runPayroll')}
                onAddEmployee={() => openModal('addEmployee')}
                onViewReports={() => onNavigate(View.AnalyticsReports)}
                isLoading={isOverallLoading}
            />
            <AIInsights onNavigate={onNavigate} isLoading={loadingAlerts} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;