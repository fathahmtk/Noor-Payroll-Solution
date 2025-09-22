import React, { useState } from 'react';
import AttendanceLog from './AttendanceLog.tsx';
import LeaveRequests from './LeaveRequests.tsx';
import LeaveBalances from './LeaveBalances.tsx';
import Tabs from '../common/Tabs.tsx';

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
            <h2 className="text-xl font-semibold text-foreground">Time &amp; Attendance</h2>
            
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