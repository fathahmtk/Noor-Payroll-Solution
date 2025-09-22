import React, { useState } from 'react';
import GratuityCalculator from './GratuityCalculator.tsx';
import LeavePolicy from './LeavePolicy.tsx';
import WPSChecklist from './WPSChecklist.tsx';
import Tabs from '../common/Tabs.tsx';
import AIPolicyWriter from './AIPolicyWriter.tsx';

type TabId = 'about' | 'calculator' | 'policy' | 'checklist' | 'aiwriter';

const WPSInformation: React.FC = () => (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md max-w-4xl mx-auto space-y-6 border border-border">
        <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Understanding the Wage Protection System (WPS)</h3>
            <p className="text-sm text-muted-foreground">The WPS is a mandatory electronic salary transfer system developed by the Qatar Central Bank. It requires all private sector employers in Qatar to pay their employees' wages via approved financial institutions, ensuring transparency and timely payment.</p>
        </div>

        <div className="p-4 bg-secondary border border-border rounded-lg">
            <h4 className="text-md font-semibold text-blue-500 dark:text-blue-400 mb-3">Why is WPS Compliance Crucial?</h4>
            <ul className="list-disc list-inside text-sm space-y-2 text-secondary-foreground">
                <li><span className="font-semibold">Protects Employee Rights:</span> Guarantees that employees receive their agreed-upon wages in full and on time.</li>
                <li><span className="font-semibold">Enhances Transparency:</span> Creates an electronic record of wage payments, reducing salary-related disputes.</li>
                <li><span className="font-semibold">Avoids Penalties:</span> Non-compliance can lead to significant fines, suspension of company services (including issuance of new work permits), and legal repercussions for the employer.</li>
            </ul>
        </div>
        
        <div className="p-4 bg-secondary border border-border rounded-lg">
            <h4 className="text-md font-semibold text-blue-500 dark:text-blue-400 mb-3">How Noor HR Simplifies WPS</h4>
            <ul className="list-disc list-inside text-sm space-y-2 text-secondary-foreground">
                <li><span className="font-semibold">Automated SIF Generation:</span> Noor HR automatically generates the correctly formatted Salary Information File (SIF) required by banks.</li>
                <li><span className="font-semibold">Accurate Calculations:</span> Ensures all salary components (basics, allowances, deductions) are correctly calculated and reflected in the SIF file.</li>
                <li><span className="font-semibold">Centralized Records:</span> Keeps a clear history of all payroll runs and generated SIF files for easy auditing and reference.</li>
                 <li><span className="font-semibold">Compliance Checklist:</span> Provides a simple checklist to track and verify all necessary steps for WPS compliance.</li>
            </ul>
        </div>
    </div>
);

const LaborLawComplianceView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('about');

    const tabs: { id: TabId, label: string }[] = [
        { id: 'about', label: 'About WPS' },
        { id: 'checklist', label: 'WPS Compliance Checklist' },
        { id: 'calculator', label: 'End of Service Calculator' },
        { id: 'policy', label: 'Leave Policy Overview' },
        { id: 'aiwriter', label: 'AI Policy Writer' },
    ];

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Labor Law Compliance</h2>

            <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-4">
                {activeTab === 'about' && <WPSInformation />}
                {activeTab === 'checklist' && <WPSChecklist />}
                {activeTab === 'calculator' && <GratuityCalculator />}
                {activeTab === 'policy' && <LeavePolicy />}
                {activeTab === 'aiwriter' && <AIPolicyWriter />}
            </div>
        </div>
    );
};

export default LaborLawComplianceView;
