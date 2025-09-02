import React, { useMemo, useState } from 'react';
import type { Employee } from '../../types';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import EyeIcon from '../icons/EyeIcon';

interface EmployeeTableProps {
  employees: Employee[];
  onViewProfile: (employee: Employee) => void;
}

type SortableKeys = keyof Employee;

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onViewProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.qid.includes(searchTerm)
        );
    }, [employees, searchTerm]);

    const sortedAndFilteredEmployees = useMemo(() => {
        let sortableItems = [...filteredEmployees];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredEmployees, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortableKeys, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        const icon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : <span className="text-gray-300">▲▼</span>;

        return (
            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center">
                    {children}
                    <span className="ml-1 text-xs">{icon}</span>
                </div>
            </th>
        );
    }

  return (
    <div className="bg-brand-light p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-dark">Employee List</h3>
            <input 
                type="text" 
                placeholder="Search employees..." 
                className="border border-slate-300 rounded-lg shadow-sm p-2 w-1/3 focus:ring-brand-primary focus:border-brand-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {sortedAndFilteredEmployees.length === 0 ? (
            <EmptyState 
                message="No Employees Found"
                description={searchTerm ? "Try adjusting your search." : "Get started by adding a new employee."}
            />
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-slate-500 uppercase bg-gray-soft font-medium">
                    <tr>
                    <SortableHeader sortKey="name">Employee</SortableHeader>
                    <SortableHeader sortKey="position">Position</SortableHeader>
                    <SortableHeader sortKey="department">Department</SortableHeader>
                    <SortableHeader sortKey="basicSalary">Total Salary</SortableHeader>
                    <SortableHeader sortKey="qid">QID</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredEmployees.map((employee) => (
                    <tr key={employee.id} className="bg-white border-b hover:bg-gray-soft">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="w-10 h-10 rounded-full" src={employee.avatarUrl} alt={`${employee.name} avatar`} />
                            <div className="pl-3">
                            <div className="text-base font-semibold">{employee.name}</div>
                            <div className="font-normal text-gray-500">Joined: {new Date(employee.joinDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">{employee.position}</td>
                        <td className="px-6 py-4">{employee.department}</td>
                        <td className="px-6 py-4 font-semibold">QAR {(employee.basicSalary + employee.allowances).toLocaleString()}</td>
                        <td className="px-6 py-4">{employee.qid}</td>
                        <td className="px-6 py-4 text-center">
                           <Button size="sm" variant="secondary" icon={<EyeIcon className="w-4 h-4" />} onClick={() => onViewProfile(employee)}>
                                View Profile
                           </Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

export default EmployeeTable;