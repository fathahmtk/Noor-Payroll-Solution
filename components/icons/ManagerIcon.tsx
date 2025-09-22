import React from 'react';

const ManagerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.284-.24-1.88M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.284.24-1.88M12 12a3 3 0 100-6 3 3 0 000 6zM12 15c-2.67 0-8 1.336-8 4v2h16v-2c0-2.664-5.33-4-8-4z" />
  </svg>
);

export default ManagerIcon;
