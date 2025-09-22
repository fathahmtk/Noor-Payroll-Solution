import React, { useState } from 'react';
import Tabs from '../common/Tabs';
import FaqTab from './FaqTab';
// FIX: AISupportTab was not found because of a syntax error in the imported file. The error is now fixed in AISupportTab.tsx
import AISupportTab from './AISupportTab';
import ContactSupportTab from './ContactSupportTab';

type TabId = 'faq' | 'ai' | 'contact';

const HelpSupportView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('faq');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'faq', label: 'FAQ' },
        { id: 'ai', label: 'AI Support Chat' },
        { id: 'contact', label: 'Contact Support' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="max-w-4xl mx-auto">
                <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="mt-6">
                    {activeTab === 'faq' && <FaqTab />}
                    {activeTab === 'ai' && <AISupportTab />}
                    {activeTab === 'contact' && <ContactSupportTab />}
                </div>
            </div>
        </div>
    );
};

export default HelpSupportView;