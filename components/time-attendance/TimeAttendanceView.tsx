
import React, { useState } from 'react';
import AttendanceLog from './AttendanceLog';
import LeaveRequests from './LeaveRequests';
import LeaveBalances from './LeaveBalances';
import Tabs from '../common/Tabs';

type TabId = 'log' | 'requests' | 'balances';

const TimeAttendanceView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('log');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'log', label: 'Attendance Log' },
        { id: 'requests', label: 'Leave Requests' },
        { id: 'balances', label: 'Leave Balances' },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-brand-dark">Time & Attendance</h2>
            
            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-4">
                {activeTab === 'log' && <AttendanceLog />}
                {activeTab === 'requests' && <LeaveRequests />}
                {activeTab === 'balances' && <LeaveBalances />}
            </div>
        </div>
    );
};

export default TimeAttendanceView;
