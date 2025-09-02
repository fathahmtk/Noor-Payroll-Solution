import React, { useState } from 'react';
import GratuityCalculator from './GratuityCalculator';
import LeavePolicy from './LeavePolicy';
import WPSChecklist from './WPSChecklist';
import Tabs from '../common/Tabs';

type TabId = 'calculator' | 'policy' | 'checklist';

const LaborLawComplianceView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('calculator');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'calculator', label: 'End of Service Calculator' },
        { id: 'policy', label: 'Leave Policy Overview' },
        { id: 'checklist', label: 'WPS Compliance Checklist' },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-brand-dark">Labor Law Compliance</h2>

            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-4">
                {activeTab === 'calculator' && <GratuityCalculator />}
                {activeTab === 'policy' && <LeavePolicy />}
                {activeTab === 'checklist' && <WPSChecklist />}
            </div>
        </div>
    );
};

export default LaborLawComplianceView;