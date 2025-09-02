import React from 'react';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import { View } from '../../types';
import { useAppContext } from '../../AppContext';

interface HeaderProps {
    title: string;
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  const { openModal } = useAppContext();
  
  const getCommandBarActions = () => {
    switch(title as View) {
      case View.Employees:
        return (
          <Button size="sm" icon={<PlusIcon />} onClick={() => openModal('addEmployee')}>
            New Employee
          </Button>
        );
      case View.Payroll:
         return (
          <Button size="sm" icon={<PlusIcon />} onClick={() => openModal('runPayroll')}>
            Run New Payroll
          </Button>
         );
      case View.Recruitment:
        return (
          <Button size="sm" icon={<PlusIcon />} onClick={() => openModal('addJobOpening')}>
            Post New Job
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-brand-light border-b border-slate-200 z-30 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
                 <h1 className="text-xl font-semibold text-brand-dark">{title}</h1>
            </div>
            <div className="flex items-center space-x-2">
                {getCommandBarActions()}
            </div>
        </div>
    </header>
  );
};

export default Header;
