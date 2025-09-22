import React, { useState } from 'react';
import CompanySettingsForm from './CompanySettingsForm.tsx';
import UserManagement from './UserManagement.tsx';
import Tabs from '../common/Tabs.tsx';
import RoleManagementView from './RoleManagementView.tsx';
import SubscriptionView from './SubscriptionView.tsx';

type TabId = 'company' | 'users' | 'roles' | 'subscription';

const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('company');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'company', label: 'Company Settings' },
        { id: 'users', label: 'User Management' },
        { id: 'roles', label: 'Roles & Permissions' },
        { id: 'subscription', label: 'Subscription & Billing' },
    ];

    return (
        <div className="p-6 bg-background text-foreground">
            <div className="max-w-4xl mx-auto">
                <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="mt-6">
                    {activeTab === 'company' && <CompanySettingsForm />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'roles' && <RoleManagementView />}
                    {activeTab === 'subscription' && <SubscriptionView />}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;