import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReportsGenerator from './ReportsGenerator';
import Tabs from '../common/Tabs';

type TabId = 'dashboard' | 'reports';

const AnalyticsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'reports', label: 'Generate Reports' },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Analytics & Reports</h2>
            
            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-4">
                {activeTab === 'dashboard' && <AnalyticsDashboard />}
                {activeTab === 'reports' && <ReportsGenerator />}
            </div>
        </div>
    );
};

export default AnalyticsView;