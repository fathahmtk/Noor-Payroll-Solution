

import React from 'react';
import EmployeeTable from './EmployeeTable.tsx';
import type { Employee } from '../../types.ts';
import EmployeeTableSkeleton from './EmployeeTableSkeleton.tsx';
import { useAppContext } from '../../AppContext.tsx';

interface EmployeesViewProps {
  onViewProfile: (employeeId: string) => void;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({ onViewProfile }) => {
  const { employees, loading, openModal } = useAppContext();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {loading ? (
        <EmployeeTableSkeleton />
      ) : (
        <EmployeeTable 
          employees={employees || []} 
          onViewProfile={(employee: Employee) => onViewProfile(employee.id)}
          onAddEmployee={() => openModal('addEmployee')}
        />
      )}
    </div>
  );
};

export default EmployeesView;