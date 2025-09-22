import React, { useMemo } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployees } from '../../services/api';
import type { Employee } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import OrgChartNode, { type EmployeeWithChildren } from './OrgChartNode';
import { useAppContext } from '../../AppContext';

interface OrganizationViewProps {
    onViewProfile: (employeeId: string) => void;
}

const OrganizationView: React.FC<OrganizationViewProps> = ({ onViewProfile }) => {
  const { currentUser } = useAppContext();
  const { data: employees, loading } = useDataFetching(
    currentUser ? `employees-${currentUser.tenantId}` : null,
    () => getEmployees(currentUser!.tenantId)
  );

  const orgTree = useMemo((): EmployeeWithChildren[] => {
    if (!employees) return [];

    const employeeMap = new Map<string, EmployeeWithChildren>(
      employees.map(e => [e.id, { ...e, children: [] }])
    );

    const roots: EmployeeWithChildren[] = [];

    employees.forEach(employee => {
      const node = employeeMap.get(employee.id);
      if (node) {
        if (employee.managerId && employeeMap.has(employee.managerId)) {
          const managerNode = employeeMap.get(employee.managerId);
          managerNode?.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }, [employees]);

  return (
    <div className="p-6 bg-background min-h-full">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Organization Chart</h2>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="org-chart overflow-x-auto pb-4">
                    <ul>
                        {orgTree.map(rootNode => (
                            <OrgChartNode key={rootNode.id} node={rootNode} onViewProfile={onViewProfile} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
};

export default OrganizationView;