import React, { useMemo, useState, useEffect } from 'react';
import type { Employee } from '../../types.ts';
import { EmployeeStatus } from '../../types.ts';
import EmptyState from '../common/EmptyState.tsx';
import Button from '../common/Button.tsx';
import EyeIcon from '../icons/EyeIcon.tsx';
import EmployeesIcon from '../icons/EmployeesIcon.tsx';

type SortableKeys = keyof Employee;

interface EmployeeTableProps {
    employees: Employee[];
    onViewProfile: (employee: Employee) => void;
    onAddEmployee: () => void;
}

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

const SortableHeader: React.FC<{ 
    sortKey: SortableKeys, 
    children: React.ReactNode,
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null,
    requestSort: (key: SortableKeys) => void
}> = ({ sortKey, children, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const sortIcon = useMemo(() => {
        if (!isSorted) {
            return <span className="text-muted-foreground/50">▲▼</span>;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }, [sortConfig, isSorted]);

    return (
        <th scope="col" className="px-6 py-3">
            <button
              onClick={() => requestSort(sortKey)}
              className="flex items-center w-full"
              aria-label={`Sort by ${String(children)}`}
            >
                {children}
                <span className="ml-1 text-xs w-4">{sortIcon}</span>
            </button>
        </th>
    );
};

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onViewProfile, onAddEmployee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

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
                let aValue: string | number;
                let bValue: string | number;

                // Handle composite "Total Salary" column
                if (sortConfig.key === 'basicSalary') {
                    aValue = a.basicSalary + a.allowances;
                    bValue = b.basicSalary + b.allowances;
                } else {
                    const rawA = a[sortConfig.key];
                    const rawB = b[sortConfig.key];
                    aValue = (typeof rawA === 'string' || typeof rawA === 'number') ? rawA : '';
                    bValue = (typeof rawB === 'string' || typeof rawB === 'number') ? rawB : '';
                }

                // Robust sorting for strings (case-insensitive, numeric)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                    return sortConfig.direction === 'ascending' ? comparison : -comparison;
                }
                
                // Fallback for numbers
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
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig]);

    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return sortedAndFilteredEmployees.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [sortedAndFilteredEmployees, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredEmployees.length / ROWS_PER_PAGE);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Employee List</h3>
            <input 
                type="text" 
                placeholder="Search employees..." 
                className="bg-background border border-border text-foreground rounded-lg shadow-sm p-2 w-1/3 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search employees by name, position, department, or QID"
            />
        </div>
        
        {sortedAndFilteredEmployees.length === 0 ? (
            <EmptyState 
                icon={<EmployeesIcon />}
                message={employees.length === 0 ? "No Employees Yet" : "No Employees Found"}
                description={employees.length === 0 ? "Get started by adding your first employee to the system." : "Try adjusting your search or clear filters."}
                action={employees.length === 0 ? { label: "Add Employee", onClick: onAddEmployee } : undefined}
            />
        ) : (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs uppercase bg-secondary text-secondary-foreground font-medium">
                        <tr>
                        <SortableHeader sortKey="name" sortConfig={sortConfig} requestSort={requestSort}>Employee</SortableHeader>
                        <SortableHeader sortKey="position" sortConfig={sortConfig} requestSort={requestSort}>Position</SortableHeader>
                        <SortableHeader sortKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                        <SortableHeader sortKey="basicSalary" sortConfig={sortConfig} requestSort={requestSort}>Total Salary</SortableHeader>
                        <SortableHeader sortKey="qid" sortConfig={sortConfig} requestSort={requestSort}>QID</SortableHeader>
                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-border hover:bg-muted/50">
                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="w-10 h-10 rounded-full" src={employee.avatarUrl} alt={`${employee.name} avatar`} />
                                <div className="pl-3">
                                <div className="text-base font-semibold">{employee.name}</div>
                                <div className="font-normal text-muted-foreground">Joined: {new Date(employee.joinDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4">{employee.position}</td>
                            <td className="px-6 py-4"><StatusBadge status={employee.status} /></td>
                            <td className="px-6 py-4 font-semibold text-foreground">QAR {(employee.basicSalary + employee.allowances).toLocaleString()}</td>
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
                 {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button size="sm" variant="secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default EmployeeTable;