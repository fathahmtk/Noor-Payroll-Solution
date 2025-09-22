import React, { useState, useEffect, useCallback } from 'react';
import type { User, Employee } from '../../types.ts';
import { getEmployeeById } from '../../services/api.ts';
import Button from '../common/Button.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import LoadingSpinner from '../common/LoadingSpinner.tsx';
import Tabs from '../common/Tabs.tsx';
import EmployeeProfileOverview from './EmployeeProfileOverview.tsx';
import MyDocuments from './MyDocuments.tsx';
import MyPayslips from './MyPayslips.tsx';
import { useAppContext } from '../../AppContext.tsx';

interface EmployeeDashboardViewProps {
  user: User;
  onRequestLeave: () => void;
}

type TabId = 'overview' | 'documents' | 'payslips';

const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({ user, onRequestLeave }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  const tabs: { id: TabId, label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'My Documents' },
    { id: 'payslips', label: 'My Payslips' },
  ];

  const fetchEmployeeData = useCallback(async () => {
    if (!user.employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getEmployeeById(user.tenantId, user.employeeId);
    setEmployee(data);
    setLoading(false);
  }, [user.employeeId, user.tenantId]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  if (loading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  if (!employee) {
    return <div className="p-6">Could not find your employee details.</div>;
  }

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
                <img className="w-24 h-24 rounded-full object-cover shadow-lg" src={employee.avatarUrl} alt="Your avatar" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Welcome, {employee.name}!</h1>
                    <p className="text-muted-foreground text-lg">{employee.position}</p>
                </div>
            </div>
            <Button onClick={onRequestLeave} icon={<PlusIcon />}>Request Leave</Button>
        </div>

        <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-4">
            {activeTab === 'overview' && <EmployeeProfileOverview user={user} employee={employee} />}
            {activeTab === 'documents' && <MyDocuments employeeId={employee.id} />}
            {activeTab === 'payslips' && <MyPayslips employeeId={employee.id} />}
        </div>
    </div>
  );
};

export default EmployeeDashboardView;