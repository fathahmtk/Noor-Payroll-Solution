import React from 'react';

const VehicleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9.5 14.5a.5.5 0 01-.5-.5v-2a.5.5 0 011 0v2a.5.5 0 01-.5.5z" />
        <path d="M14.5 14.5a.5.5 0 01-.5-.5v-2a.5.5 0 011 0v2a.5.5 0 01-.5.5z" />
        <path d="M21 12.5a.5.5 0 01-.5-.5v-2a2 2 0 00-2-2h-1.17a3 3 0 00-2.66 1.57L13.5 12.5h-3l-1.17-2.93a3 3 0 00-2.66-1.57H5.5a2 2 0 00-2 2v2a.5.5 0 01-1 0v-2a3 3 0 013-3h1.17a2 2 0 011.77 1.05L9.5 11h5l1.11-2.95a2 2 0 011.77-1.05H18.5a3 3 0 013 3v2a.5.5 0 01-1 0z" />
        <path d="M4.5 18.5a2 2 0 100-4 2 2 0 000 4z" />
        <path d="M19.5 18.5a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

export default VehicleIcon;
