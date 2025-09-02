import React from 'react';

const OrganizationChartIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4c0 .55.45 1 1 1h3l3 3v-2.5c0-.83.67-1.5 1.5-1.5H15v-2h-1.5c-.83 0-1.5-.67-1.5-1.5V9l-3 3H4c-.55 0-1 .45-1 1zm18-4h-3l-3 3v2.5c0 .83-.67 1.5-1.5 1.5H9v2h1.5c.83 0 1.5.67 1.5 1.5V18l3 3h3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-3l-3-3V9l3-3h3c.55 0 1 .45 1 1v4z" />
    </svg>
);

export default OrganizationChartIcon;
