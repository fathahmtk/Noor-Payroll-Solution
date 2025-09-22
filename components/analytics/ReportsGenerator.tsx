import React from 'react';
import Button from '../common/Button';
import DownloadIcon from '../icons/DownloadIcon';
import { getEmployees, getPayrollRuns, getAttendanceRecords, getLeaveBalances } from '../../services/api';
import type { LeaveBalanceDetail } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../AppContext';

const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        return false;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
};

const ReportItem: React.FC<{ title: string; description: string; onDownload: () => Promise<boolean>; }> = ({ title, description, onDownload }) => {
    const [loading, setLoading] = React.useState(false);
    const { addToast } = useToasts();

    const handleClick = async () => {
        setLoading(true);
        const success = await onDownload();
        setLoading(false);
        if (success) {
            addToast(`Report "${title}" generated successfully.`, 'success');
        } else {
            addToast('No data available to generate this report.', 'info');
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border">
            <div>
                <h4 className="font-semibold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button variant="secondary" icon={<DownloadIcon />} onClick={handleClick} isLoading={loading}>
                Download
            </Button>
        </div>
    );
};

const ReportsGenerator: React.FC = () => {
    const { addToast } = useToasts();
    const { currentUser } = useAppContext();

    const handleDownloadEmployees = async () => {
        if (!currentUser?.tenantId) return false;
        const employees = await getEmployees(currentUser.tenantId);
        return downloadCSV(employees, 'Employee_Master_List');
    };

    const handleDownloadPayrollSummary = async () => {
        if (!currentUser?.tenantId) return false;
        const payrolls = await getPayrollRuns(currentUser.tenantId);
        return downloadCSV(payrolls, 'Payroll_Summary_Report');
    };
    
    const handleDownloadAttendance = async () => {
        if (!currentUser?.tenantId) return false;
        const records = await getAttendanceRecords(currentUser.tenantId);
        return downloadCSV(records, 'Attendance_Log_Report');
    };

    const handleDownloadLeaveBalances = async () => {
        if (!currentUser?.tenantId) return false;
        const balances = await getLeaveBalances(currentUser.tenantId);
        const flattenedData = balances.flatMap(empBalance => 
            empBalance.balances.map((detail: LeaveBalanceDetail) => ({
                employeeId: empBalance.employeeId,
                employeeName: empBalance.employeeName,
                leaveType: detail.leaveType,
                totalDays: detail.totalDays,
                usedDays: detail.usedDays,
                availableDays: detail.totalDays - detail.usedDays,
            }))
        );
        return downloadCSV(flattenedData, 'Leave_Balance_Report');
    };

    const reports = [
        { title: 'Employee Master List', description: 'A complete list of all active employees with their details.', onDownload: handleDownloadEmployees },
        { title: 'Payroll Summary Report', description: 'A summary of all payroll runs, including totals.', onDownload: handleDownloadPayrollSummary },
        { title: 'Attendance Log Report', description: 'A detailed log of employee attendance for a specified period.', onDownload: handleDownloadAttendance },
        { title: 'Leave Balance Report', description: 'A report showing the current leave balances for all employees.', onDownload: handleDownloadLeaveBalances },
        { title: 'WPS SIF File History', description: 'Access and download previously generated SIF files.', onDownload: async () => { addToast("This can be done from the Payroll & WPS page.", 'info'); return false;} },
    ];

    return (
        <div className="bg-card p-6 rounded-lg shadow-md max-w-4xl mx-auto border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Generate Reports</h3>
            <div className="space-y-4">
                {reports.map(report => (
                    <ReportItem key={report.title} {...report} />
                ))}
            </div>
        </div>
    );
};

export default ReportsGenerator;