import React from 'react';
import EmployeeTable from './EmployeeTable';
import type { Employee } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAppContext } from '../../AppContext';

interface EmployeesViewProps {
  onViewProfile: (employeeId: string) => void;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({ onViewProfile }) => {
  const { employees, loading } = useAppContext();

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <EmployeeTable 
          employees={employees || []} 
          onViewProfile={(employee: Employee) => onViewProfile(employee.id)}
        />
      )}
    </div>
  );
};

export default EmployeesView;