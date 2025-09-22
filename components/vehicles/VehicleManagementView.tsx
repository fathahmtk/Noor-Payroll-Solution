import React, { useState } from 'react';
import Tabs from '../common/Tabs';
import VehicleTable from './VehicleTable';
import VehicleLogTable from './VehicleLogTable';

type TabId = 'vehicles' | 'logs';

const VehicleManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('vehicles');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'vehicles', label: 'Company Vehicles' },
        { id: 'logs', label: 'Trip Logs' },
    ];

    return (
        <div className="p-6 space-y-6">
            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'vehicles' && <VehicleTable />}
                {activeTab === 'logs' && <VehicleLogTable />}
            </div>
        </div>
    );
};

export default VehicleManagementView;
