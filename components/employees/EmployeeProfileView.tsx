import React, { useState } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployeeById } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Tabs from '../common/Tabs';
import OnboardingTab from './OnboardingTab';
import ContractTab from './ContractTab';
import OffboardingTab from './OffboardingTab';
import EmployeeDocumentsTab from './EmployeeDocumentsTab';
import EmployeeAssignedAssetsTab from './EmployeeAssignedAssetsTab';
import { useAppContext } from '../../AppContext';
import Button from '../common/Button';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import { EmployeeStatus } from '../../types';
import EmployeeLeaveHistoryTab from './EmployeeLeaveHistoryTab';

interface EmployeeProfileViewProps {
  employeeId: string;
  onViewProfile: (employeeId: string) => void;
}

type TabId = 'onboarding' | 'contract' | 'offboarding' | 'documents' | 'assets' | 'leave';

const StatusBadge: React.FC<{ status: EmployeeStatus }> = ({ status }) => {
    const colors = {
        [EmployeeStatus.Active]: 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
        [EmployeeStatus.OnLeave]: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20',
        [EmployeeStatus.Terminated]: 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20',
        [EmployeeStatus.Transferred]: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 dark:bg-slate-500/20',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
            {status}
        </span>
    );
};

const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({ employeeId, onViewProfile }) => {
  const { currentUser, employees: allEmployees, openModal } = useAppContext();
  const { data: employee, loading, refresh: refreshEmployee } = useDataFetching(
    currentUser ? `employee-${currentUser.tenantId}-${employeeId}` : null,
    () => getEmployeeById(currentUser!.tenantId, employeeId)
  );
  const [activeTab, setActiveTab] = useState<TabId>('onboarding');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'contract', label: 'Contract' },
    { id: 'offboarding', label: 'Offboarding' },
    { id: 'documents', label: 'Documents' },
    { id: 'assets', label: 'Assigned Assets' },
    { id: 'leave', label: 'Leave History' },
  ];
  
  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (!employee) return <div className="p-6">Employee not found.</div>;

  const manager = allEmployees?.find(e => e.id === employee.managerId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="flex items-center space-x-4">
            <img className="w-24 h-24 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-x-3">{employee.name} <StatusBadge status={employee.status} /></h2>
                <p className="text-md text-muted-foreground">{employee.position}, {employee.department}</p>
                <p className="text-sm text-muted-foreground">Manager: {manager ? (
                  <button onClick={() => onViewProfile(manager.id)} className="text-primary hover:underline font-semibold">{manager.name}</button>
                ) : 'N/A'}</p>
                 <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span><strong>QID:</strong> {employee.qid}</span>
                    <span className="border-l border-border pl-4"><strong>Sponsorship:</strong> {employee.sponsorship}</span>
                    <span className="border-l border-border pl-4"><strong>Visa:</strong> {employee.visaType}</span>
                    <span className="border-l border-border pl-4"><strong>Residency:</strong> {employee.residencyStatus}</span>
                </div>
            </div>
        </div>
        <div className="flex space-x-2">
            <Button size="sm" icon={<ReceiptIcon className="w-4 h-4" />} onClick={() => openModal('generatePayslip', { employee })}>Generate Payslip</Button>
            <Button variant="secondary" size="sm" icon={<PencilIcon className="w-4 h-4" />} onClick={() => openModal('editEmployee', employee)}>Edit</Button>
            <Button variant="danger" size="sm" icon={<TrashIcon className="w-4 h-4" />} onClick={() => openModal('deleteEmployee', employee)}>Delete</Button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
            {activeTab === 'onboarding' && <OnboardingTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'contract' && <ContractTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'offboarding' && <OffboardingTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'documents' && <EmployeeDocumentsTab employeeId={employee.id} />}
            {activeTab === 'assets' && <EmployeeAssignedAssetsTab employeeId={employee.id} />}
            {activeTab === 'leave' && <EmployeeLeaveHistoryTab employeeId={employee.id} />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileView;
