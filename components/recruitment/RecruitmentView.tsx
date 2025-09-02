import React, { useState } from 'react';
import Tabs from '../common/Tabs';
import JobOpenings from './JobOpenings';
import CandidatePipeline from './CandidatePipeline';

type TabId = 'openings' | 'pipeline';

const RecruitmentView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('openings');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'openings', label: 'Job Openings' },
        { id: 'pipeline', label: 'Candidate Pipeline' },
    ];

    return (
        <div className="p-6 space-y-6">
            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'openings' && <JobOpenings />}
                {activeTab === 'pipeline' && <CandidatePipeline />}
            </div>
        </div>
    );
};

export default RecruitmentView;
