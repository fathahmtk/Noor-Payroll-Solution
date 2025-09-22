import React from 'react';
import type { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  managerName?: string;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, managerName }) => {
  return (
    <div className="bg-card text-card-foreground p-4 rounded-xl border border-border flex flex-col items-center text-center transition-shadow duration-300 shadow-sm hover:shadow-md animate-fade-in-up">
      <img src={employee.avatarUrl} alt={employee.name} className="w-24 h-24 rounded-full mb-3 ring-2 ring-offset-2 ring-offset-card ring-primary/50" />
      <h4 className="font-bold text-foreground text-lg">{employee.name}</h4>
      <p className="text-sm text-primary font-medium">{employee.position}</p>
      <p className="text-xs text-muted-foreground mt-1">{employee.department}</p>
      <div className="border-t border-border w-full my-3"></div>
      <div className="text-left w-full space-y-2 text-xs">
          <p className="flex items-center"><span className="font-semibold text-muted-foreground w-16">Manager:</span> <span className="text-foreground">{managerName || 'N/A'}</span></p>
          <p className="flex items-center"><span className="font-semibold text-muted-foreground w-16">Joined:</span> <span className="text-foreground">{new Date(employee.joinDate).toLocaleDateString()}</span></p>
      </div>
    </div>
  );
};

export default EmployeeCard;
