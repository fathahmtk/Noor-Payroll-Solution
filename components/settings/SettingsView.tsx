import React, { useState } from 'react';
import CompanySettingsForm from './CompanySettingsForm';
import UserManagement from './UserManagement';
import Tabs from '../common/Tabs';
import RoleManagementView from './RoleManagementView';

type TabId = 'company' | 'users' | 'roles';

const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('company');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'company', label: 'Company Settings' },
        { id: 'users', label: 'User Management' },
        { id: 'roles', label: 'Roles & Permissions' },
    ];

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="mt-6">
                    {activeTab === 'company' && <CompanySettingsForm />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'roles' && <RoleManagementView />}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;