import React from 'react';

const FolderIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013.75 3h5.25a2.25 2.25 0 011.697.72l.923 1.026a.75.75 0 00.53.224h5.17c1.24 0 2.25 1.01 2.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25M3.75 9.75v8.25a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 18v-8.25" />
    </svg>
);

export default FolderIcon;
