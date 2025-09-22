import React from 'react';
import Button from './Button.tsx';
import AnalyticsIcon from '../icons/AnalyticsIcon.tsx';

interface UpgradeViewProps {
    onUpgrade: () => void;
}

const UpgradeView: React.FC<UpgradeViewProps> = ({ onUpgrade }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-secondary">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                <AnalyticsIcon className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Unlock Analytics & Reports</h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
                Gain deeper insights into your workforce with advanced analytics, headcount trends, and exportable reports. Upgrade to our Premium plan to access this feature and more.
            </p>
            <Button onClick={onUpgrade} className="mt-6">
                Go to Subscription Settings
            </Button>
        </div>
    );
};

export default UpgradeView;