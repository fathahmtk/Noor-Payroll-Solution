import React from 'react';
import type { User, Employee } from '../../types';
import AIAssistant from './AIAssistant';

interface EmployeeProfileOverviewProps {
    user: User;
    employee: Employee;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
    </div>
);

const EmployeeProfileOverview: React.FC<EmployeeProfileOverviewProps> = ({ user, employee }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Personal Information">
                    <InfoRow label="Full Name" value={employee.name} />
                    <InfoRow label="Qatar ID (QID)" value={employee.qid} />
                    <InfoRow label="Department" value={employee.department} />
                    <InfoRow label="Joining Date" value={new Date(employee.joinDate).toLocaleDateString()} />
                </InfoCard>
                <InfoCard title="Salary & Bank Details">
                    <InfoRow label="Basic Salary" value={`QAR ${employee.basicSalary.toLocaleString()}`} />
                    <InfoRow label="Allowances" value={`QAR ${employee.allowances.toLocaleString()}`} />
                    <div className="border-t border-border my-2"></div>
                    <InfoRow label="Total Monthly Salary" value={`QAR ${(employee.basicSalary + employee.allowances).toLocaleString()}`} />
                    <div className="border-t border-border my-2"></div>
                    <InfoRow label="Bank Name" value={employee.bankName} />
                    <InfoRow label="IBAN" value={employee.iban} />
                </InfoCard>
            </div>
            <div>
                <AIAssistant user={user} />
            </div>
        </div>
    );
};

export default EmployeeProfileOverview;