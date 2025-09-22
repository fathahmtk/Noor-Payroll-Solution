import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
            <p className="mt-3 text-sm font-medium">Loading data...</p>
        </div>
    );
};

export default LoadingSpinner;