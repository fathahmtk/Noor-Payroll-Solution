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

interface EmployeeProfileViewProps {
  employeeId: string;
}

type TabId = 'onboarding' | 'contract' | 'offboarding' | 'documents' | 'assets';

const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({ employeeId }) => {
  const { currentUser } = useAppContext();
  const { data: employee, loading, refresh: refreshEmployee } = useDataFetching(() => getEmployeeById(currentUser!.tenantId, employeeId));
  const [activeTab, setActiveTab] = useState<TabId>('onboarding');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'contract', label: 'Contract' },
    { id: 'offboarding', label: 'Offboarding' },
    { id: 'documents', label: 'Documents' },
    { id: 'assets', label: 'Assigned Assets' },
  ];
  
  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (!employee) return <div className="p-6">Employee not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4 bg-brand-light p-4 rounded-xl shadow-sm border">
        <img className="w-24 h-24 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">{employee.name}</h2>
          <p className="text-md text-gray-600">{employee.position}, {employee.department}</p>
          <p className="text-sm text-gray-500">QID: {employee.qid}</p>
        </div>
      </div>

      <div className="bg-brand-light p-6 rounded-xl shadow-sm border">
        <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
            {activeTab === 'onboarding' && <OnboardingTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'contract' && <ContractTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'offboarding' && <OffboardingTab employee={employee} onUpdate={refreshEmployee} />}
            {activeTab === 'documents' && <EmployeeDocumentsTab employeeId={employee.id} />}
            {activeTab === 'assets' && <EmployeeAssignedAssetsTab employeeId={employee.id} />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileView;