import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmployeeCard from './EmployeeCard';
import type { Employee } from '../../types';
import EmptyState from '../common/EmptyState';
import EmployeesIcon from '../icons/EmployeesIcon';

const DirectoryView: React.FC = () => {
    const { employees, loading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    const employeeMap = useMemo(() => {
        if (!employees) return new Map();
        return new Map(employees.map(e => [e.id, e]));
    }, [employees]);

    const departments = useMemo(() => {
        if (!employees) return [];
        const depts = new Set(employees.map(e => e.department));
        return ['All', ...Array.from(depts).sort()];
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter(employee => {
            const nameMatch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
            const positionMatch = employee.position.toLowerCase().includes(searchTerm.toLowerCase());
            const departmentMatch = departmentFilter === 'All' || employee.department === departmentFilter;
            return (nameMatch || positionMatch) && departmentMatch;
        }).sort((a,b) => a.name.localeCompare(b.name)); // sort alphabetically
    }, [employees, searchTerm, departmentFilter]);

    if (loading) {
        return <div className="p-6"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">Company Directory</h2>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search name or position..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-secondary border border-border text-foreground rounded-lg shadow-sm p-2 w-56 focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={departmentFilter}
                        onChange={e => setDepartmentFilter(e.target.value)}
                        className="bg-secondary border border-border text-foreground rounded-lg shadow-sm p-2 focus:ring-primary focus:border-primary"
                    >
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
            </div>
            
            {filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredEmployees.map(employee => {
                        const manager = employee.managerId ? employeeMap.get(employee.managerId) : null;
                        return <EmployeeCard key={employee.id} employee={employee} managerName={manager?.name} />;
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={<EmployeesIcon />}
                    message="No Employees Found"
                    description="Try adjusting your search or filter criteria."
                />
            )}
        </div>
    );
};
export default DirectoryView;
