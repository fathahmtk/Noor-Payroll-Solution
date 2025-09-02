import React, { useMemo } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployees } from '../../services/api';
import type { Employee } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import OrgChartNode, { type EmployeeWithChildren } from './OrgChartNode';
import { useAppContext } from '../../AppContext';

const OrganizationView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: employees, loading } = useDataFetching(() => getEmployees(currentUser!.tenantId));

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
    <div className="p-6 bg-brand-secondary min-h-full">
        <style>{`
            .org-chart ul {
                padding-top: 20px;
                position: relative;
                transition: all 0.5s;
            }
            .org-chart li {
                float: left;
                text-align: center;
                list-style-type: none;
                position: relative;
                padding: 20px 5px 0 5px;
                transition: all 0.5s;
            }
            .org-chart li::before, .org-chart li::after {
                content: '';
                position: absolute;
                top: 0;
                right: 50%;
                border-top: 2px solid #ccc;
                width: 50%;
                height: 20px;
            }
            .org-chart li::after {
                right: auto;
                left: 50%;
                border-left: 2px solid #ccc;
            }
            .org-chart li:only-child::after, .org-chart li:only-child::before {
                display: none;
            }
            .org-chart li:only-child {
                padding-top: 0;
            }
            .org-chart li:first-child::before, .org-chart li:last-child::after {
                border: 0 none;
            }
            .org-chart li:last-child::before {
                border-right: 2px solid #ccc;
                border-radius: 0 5px 0 0;
            }
            .org-chart li:first-child::after {
                border-radius: 5px 0 0 0;
            }
            .org-chart ul ul::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                border-left: 2px solid #ccc;
                width: 0;
                height: 20px;
            }
        `}</style>
        <div className="bg-brand-light p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-brand-dark mb-6">Organization Chart</h2>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="org-chart overflow-x-auto pb-4 flex justify-center">
                    <ul className="flex justify-center">
                        {orgTree.map(rootNode => (
                            <OrgChartNode key={rootNode.id} node={rootNode} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
};

export default OrganizationView;
