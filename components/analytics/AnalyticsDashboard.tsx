import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, getPayrollRuns, getLeaveRequests } from '../../services/api';
import type { Employee, PayrollRun, LeaveRequest } from '../../types';

import PayrollCostChart from './PayrollCostChart';
import DepartmentSalaryChart from './DepartmentSalaryChart';
import HeadcountChart from './HeadcountChart';
import LeaveTypeChart from './LeaveTypeChart';
import { useAppContext } from '../../AppContext';

const AnalyticsDashboard: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAppContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.tenantId) return;
            setLoading(true);
            const [empData, payrollData, leaveData] = await Promise.all([
                getEmployees(currentUser.tenantId),
                getPayrollRuns(currentUser.tenantId),
                getLeaveRequests(currentUser.tenantId),
            ]);
            setEmployees(empData);
            setPayrollRuns(payrollData);
            setLeaveRequests(leaveData);
            setLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const departmentSalaryData = useMemo(() => {
        const deptMap = new Map<string, number>();
        employees.forEach(emp => {
            const totalSalary = emp.basicSalary + emp.allowances;
            deptMap.set(emp.department, (deptMap.get(emp.department) || 0) + totalSalary);
        });
        return Array.from(deptMap, ([name, value]) => ({ name, value }));
    }, [employees]);
    
    const headcountData = useMemo(() => {
        if (employees.length === 0) return [];
        const sortedEmployees = [...employees].sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        const dataMap = new Map<string, number>();
        let count = 0;
        sortedEmployees.forEach(emp => {
            const month = emp.joinDate.substring(0, 7); // YYYY-MM
            count++;
            dataMap.set(month, count);
        });

        // Fill in missing months
        const result = [];
        const startDate = new Date(sortedEmployees[0].joinDate);
        const endDate = new Date();
        for (let d = startDate; d <= endDate; d.setMonth(d.getMonth() + 1)) {
            const monthKey = d.toISOString().substring(0, 7);
            const lastMonthKey = new Date(d.getFullYear(), d.getMonth() -1, 1).toISOString().substring(0,7);
            const value = dataMap.get(monthKey) || result.find(r => r.month === lastMonthKey)?.count || 0;
            result.push({ month: monthKey, count: value });
        }
        return result;

    }, [employees]);

    const leaveTypeData = useMemo(() => {
        const typeMap = new Map<string, number>();
        leaveRequests.forEach(req => {
            typeMap.set(req.leaveType, (typeMap.get(req.leaveType) || 0) + 1);
        });
        return Array.from(typeMap, ([name, value]) => ({ name, value }));
    }, [leaveRequests]);

    if (loading) {
        return <div className="text-center py-10">Loading analytics dashboard...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PayrollCostChart data={payrollRuns} />
            <DepartmentSalaryChart data={departmentSalaryData} />
            <HeadcountChart data={headcountData} />
            <LeaveTypeChart data={leaveTypeData} />
        </div>
    );
};

export default AnalyticsDashboard;
