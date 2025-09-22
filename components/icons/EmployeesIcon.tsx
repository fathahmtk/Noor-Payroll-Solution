
import React from 'react';

const EmployeesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a3 3 0 01-6 0m6 0a3 3 0 00-6 0m6 0h6m-6 0V10m6 5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default EmployeesIcon;