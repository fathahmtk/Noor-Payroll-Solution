import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAttendanceRecords, getEmployees, addAttendanceRecord as apiAddRecord } from '../../services/api';
import type { AttendanceRecord, Employee } from '../../types';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import AddAttendanceModal from './AddAttendanceModal';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

const AttendanceLog: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAppContext();

    const [filters, setFilters] = useState({
        employeeId: 'all',
        startDate: '',
        endDate: '',
    });

    const fetchData = useCallback(async () => {
        if (!currentUser?.tenantId) return;
        setLoading(true);
        const [recordsData, empData] = await Promise.all([getAttendanceRecords(currentUser.tenantId), getEmployees(currentUser.tenantId)]);
        setRecords(recordsData);
        setEmployees(empData);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleAddRecord = async (newRecordData: Omit<AttendanceRecord, 'id' | 'hoursWorked' | 'employeeName' | 'tenantId'>) => {
        if (!currentUser?.tenantId) return;
        setIsSubmitting(true);
        await apiAddRecord(currentUser.tenantId, newRecordData);
        setIsSubmitting(false);
        setIsModalOpen(false);
        await fetchData();
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const isEmployeeMatch = filters.employeeId === 'all' || record.employeeId === filters.employeeId;
            const isAfterStartDate = !filters.startDate || record.date >= filters.startDate;
            const isBeforeEndDate = !filters.endDate || record.date <= filters.endDate;

            return isEmployeeMatch && isAfterStartDate && isBeforeEndDate;
        });
    }, [records, filters]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className="border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option value="all">All Employees</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md shadow-sm p-2" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />}>
                    Add Record
                </Button>
            </div>
            
             <div className="bg-brand-light rounded-lg shadow-md overflow-x-auto">
                {loading ? (
                    <LoadingSpinner />
                ) : filteredRecords.length === 0 ? (
                     <EmptyState message="No Records Found" description={filters.employeeId !== 'all' || filters.startDate ? "Try adjusting your filters." : "Get started by adding an attendance record."} />
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Employee</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Check In</th>
                                <th scope="col" className="px-6 py-3">Check Out</th>
                                <th scope="col" className="px-6 py-3">Hours Worked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{record.employeeName}</td>
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{record.checkIn}</td>
                                    <td className="px-6 py-4">{record.checkOut}</td>
                                    <td className="px-6 py-4 font-semibold">{record.hoursWorked.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <AddAttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
                onAddRecord={handleAddRecord}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default AttendanceLog;
