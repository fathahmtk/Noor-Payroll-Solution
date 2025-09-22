import React from 'react';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
    );
};

export default SkeletonLoader;