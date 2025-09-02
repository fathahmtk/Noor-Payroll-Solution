import React from 'react';

const PolicyCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-bold text-brand-primary mb-3">{title}</h4>
        <div className="text-sm text-gray-600 space-y-2">{children}</div>
    </div>
);

const LeavePolicy: React.FC = () => {
    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Leave Policy Overview (Qatar Labor Law)</h3>
            <p className="text-sm text-gray-500 mb-6">This is a simplified summary for reference purposes. Always consult the official Qatar Labor Law for complete and up-to-date information.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PolicyCard title="Annual Leave">
                    <p><strong>- Less than 5 years of service:</strong> 3 weeks (21 days) per year.</p>
                    <p><strong>- 5 or more years of service:</strong> 4 weeks (28 days) per year.</p>
                    <p>- Leave is accrued and typically taken in agreement with the employer.</p>
                    <p>- Employees are entitled to their basic wage during annual leave.</p>
                </PolicyCard>
                 <PolicyCard title="Sick Leave">
                    <p>An employee is entitled to sick leave after completing 3 months of service.</p>
                    <p><strong>- First 2 weeks:</strong> 100% of basic wage.</p>
                    <p><strong>- Next 4 weeks:</strong> 50% of basic wage.</p>
                    <p><strong>- Subsequent periods (up to 6 weeks):</strong> Unpaid.</p>
                     <p>- A valid medical certificate from a licensed physician is required.</p>
                </PolicyCard>
                <PolicyCard title="Public Holidays">
                    <p>Employees are entitled to paid leave on official public holidays, which include:</p>
                    <p><strong>- Eid Al-Fitr:</strong> 3 working days.</p>
                    <p><strong>- Eid Al-Adha:</strong> 3 working days.</p>
                    <p><strong>- National Day:</strong> 1 working day (December 18th).</p>
                    <p><strong>- National Sports Day:</strong> 1 working day (Second Tuesday of February).</p>
                </PolicyCard>
                 <PolicyCard title="Maternity Leave">
                    <p><strong>- Entitlement:</strong> 50 days of fully paid leave for female employees with at least one full year of service.</p>
                    <p>- The leave can be taken before and after delivery.</p>
                    <p>- After returning, the employee is entitled to a nursing break of one hour per day for one year.</p>
                </PolicyCard>
            </div>
        </div>
    );
};

export default LeavePolicy;