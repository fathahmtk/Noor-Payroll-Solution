import React from 'react';
import { View, User } from '../../types';
import DashboardIcon from '../icons/DashboardIcon';
import EmployeesIcon from '../icons/EmployeesIcon';
import PayrollIcon from '../icons/PayrollIcon';
import SettingsIcon from '../icons/SettingsIcon';
import TimeIcon from '../icons/TimeIcon';
import ComplianceIcon from '../icons/ComplianceIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import ProfileIcon from '../icons/ProfileIcon';
import DocumentIcon from '../icons/DocumentIcon';
import AssetIcon from '../icons/AssetIcon';
import SignOutIcon from '../icons/SignOutIcon';
import OrganizationChartIcon from '../icons/OrganizationChartIcon';
import RecruitmentIcon from '../icons/RecruitmentIcon';

interface SidebarProps {
  user: User;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const NAV_GROUPS = [
    { 
        title: 'Main', 
        items: [
            { view: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager', 'Accounts'] },
            { view: View.EmployeeDashboard, label: 'My Dashboard', icon: <DashboardIcon className="w-5 h-5" />, roles: ['Employee'] },
        ]
    },
    {
        title: 'Workforce',
        items: [
            { view: View.Employees, label: 'Employees', icon: <EmployeesIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.OrganizationChart, label: 'Org Chart', icon: <OrganizationChartIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.Recruitment, label: 'Recruitment', icon: <RecruitmentIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.TimeAttendance, label: 'Time & Attendance', icon: <TimeIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.Documents, label: 'Documents', icon: <DocumentIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
        ]
    },
    {
        title: 'Payroll',
        items: [
             { view: View.Payroll, label: 'Payroll Runs', icon: <PayrollIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager', 'Accounts'] },
        ]
    },
    {
        title: 'Operations',
        items: [
            { view: View.Assets, label: 'Asset Management', icon: <AssetIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.AnalyticsReports, label: 'Analytics', icon: <AnalyticsIcon className="w-5 h-5" />, roles: ['Owner', 'Accounts'] },
        ]
    },
    {
        title: 'Administration',
        items: [
            { view: View.LaborLawCompliance, label: 'Compliance', icon: <ComplianceIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'] },
            { view: View.MyProfile, label: 'My Profile', icon: <ProfileIcon className="w-5 h-5" />, roles: ['Employee', 'HR Manager', 'Accounts', 'Owner'] },
            { view: View.Settings, label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, roles: ['Owner'] },
        ]
    }
];

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onNavigate, onLogout, isCollapsed, setIsCollapsed }) => {
  return (
    <nav className={`flex flex-col bg-brand-light border-r border-slate-200 transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-60'}`} aria-label="Sidebar">
      <div className="flex-1 flex flex-col pt-2 pb-4 overflow-y-auto">
        <div className="flex-1 px-2 space-y-4">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => item.roles.includes(user.role.name));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.title}</h3>}
                <ul className="mt-2 space-y-1">
                  {visibleItems.map(item => (
                    <li key={item.view}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate(item.view); }}
                        className={`flex items-center p-2 text-sm font-medium rounded-md group transition-colors ${
                          currentView === item.view 
                            ? 'bg-brand-primary-light text-brand-primary font-semibold' 
                            : 'text-nav-text hover:bg-brand-secondary'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className={`${currentView === item.view ? 'text-brand-primary' : 'text-nav-icon'}`}>{item.icon}</span>
                        {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="mt-auto p-2">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onLogout(); }}
                className="flex items-center p-2 text-sm font-medium rounded-md text-nav-text hover:bg-brand-secondary"
                title={isCollapsed ? "Sign Out" : undefined}
            >
                <SignOutIcon className="w-5 h-5 text-nav-icon" />
                {!isCollapsed && <span className="ml-3">Sign Out</span>}
            </a>
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center p-2 mt-2 text-sm font-medium rounded-md text-nav-text hover:bg-brand-secondary"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg className={`w-5 h-5 text-nav-icon transition-transform duration-300 ${!isCollapsed && 'rotate-180'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
