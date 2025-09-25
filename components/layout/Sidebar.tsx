import React from 'react';
import { View, User, SubscriptionTier } from '../../types.ts';
import DashboardIcon from '../icons/DashboardIcon.tsx';
import EmployeesIcon from '../icons/EmployeesIcon.tsx';
import PayrollIcon from '../icons/PayrollIcon.tsx';
import SettingsIcon from '../icons/SettingsIcon.tsx';
import TimeIcon from '../icons/TimeIcon.tsx';
import ComplianceIcon from '../icons/ComplianceIcon.tsx';
import AnalyticsIcon from '../icons/AnalyticsIcon.tsx';
import ProfileIcon from '../icons/ProfileIcon.tsx';
import DocumentIcon from '../icons/DocumentIcon.tsx';
import AssetIcon from '../icons/AssetIcon.tsx';
import SignOutIcon from '../icons/SignOutIcon.tsx';
import OrganizationChartIcon from '../icons/OrganizationChartIcon.tsx';
import RecruitmentIcon from '../icons/RecruitmentIcon.tsx';
import VehicleIcon from '../icons/VehicleIcon.tsx';
import PettyCashIcon from '../icons/PettyCashIcon.tsx';
import { useAppContext } from '../../AppContext.tsx';
import LockIcon from '../icons/LockIcon.tsx';
import AuditLogIcon from '../icons/AuditLogIcon.tsx';
import ManagerIcon from '../icons/ManagerIcon.tsx';
import HelpIcon from '../icons/HelpIcon.tsx';
import KnowledgeBaseIcon from '../icons/KnowledgeBaseIcon.tsx';
import LoanIcon from '../icons/LoanIcon.tsx';

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
            { view: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager', 'Accounts'], tier: SubscriptionTier.Free },
            { view: View.EmployeeDashboard, label: 'My Dashboard', icon: <DashboardIcon className="w-5 h-5" />, roles: ['Employee'], hideIfManager: true, tier: SubscriptionTier.Free },
        ]
    },
    {
        title: 'Workforce',
        items: [
            { view: View.Employees, label: 'Employees', icon: <EmployeesIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Free },
            { view: View.Directory, label: 'Company Directory', icon: <EmployeesIcon className="w-5 h-5" />, roles: ['Employee', 'HR Manager', 'Accounts', 'Owner'], tier: SubscriptionTier.Free },
            { view: View.OrganizationChart, label: 'Org Chart', icon: <OrganizationChartIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Free },
            { view: View.Recruitment, label: 'Recruitment', icon: <RecruitmentIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Enterprise },
            { view: View.TimeAttendance, label: 'Time & Attendance', icon: <TimeIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Premium },
            { view: View.Documents, label: 'Documents', icon: <DocumentIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Free },
        ]
    },
    {
        title: 'Payroll',
        items: [
             { view: View.Payroll, label: 'Payroll & WPS', icon: <PayrollIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager', 'Accounts'], tier: SubscriptionTier.Premium },
             { view: View.PPP, label: 'PPP Calculator', icon: <LoanIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Premium },
        ]
    },
    {
        title: 'Operations',
        items: [
            { view: View.Assets, label: 'Asset Management', icon: <AssetIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Premium },
            { view: View.VehicleManagement, label: 'Vehicle Management', icon: <VehicleIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Premium },
            { view: View.PettyCash, label: 'Petty Cash', icon: <PettyCashIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Premium },
            { view: View.AnalyticsReports, label: 'Analytics', icon: <AnalyticsIcon className="w-5 h-5" />, roles: ['Owner', 'Accounts'], tier: SubscriptionTier.Enterprise },
        ]
    },
    {
        title: 'Administration',
        items: [
            { view: View.KnowledgeBase, label: 'Knowledge Base', icon: <KnowledgeBaseIcon className="w-5 h-5" />, roles: ['Employee', 'HR Manager', 'Accounts', 'Owner'], tier: SubscriptionTier.Free },
            { view: View.LaborLawCompliance, label: 'Compliance', icon: <ComplianceIcon className="w-5 h-5" />, roles: ['Owner', 'HR Manager'], tier: SubscriptionTier.Free },
            { view: View.AuditTrail, label: 'Audit Trail', icon: <AuditLogIcon className="w-5 h-5" />, roles: ['Owner'], tier: SubscriptionTier.Free },
            { view: View.MyProfile, label: 'My Profile', icon: <ProfileIcon className="w-5 h-5" />, roles: ['Employee', 'HR Manager', 'Accounts', 'Owner'], tier: SubscriptionTier.Free },
            { view: View.HelpSupport, label: 'Help & Support', icon: <HelpIcon className="w-5 h-5" />, roles: ['Employee', 'HR Manager', 'Accounts', 'Owner'], tier: SubscriptionTier.Free },
            { view: View.Settings, label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, roles: ['Owner'], tier: SubscriptionTier.Free },
        ]
    }
];

const MANAGER_NAV_GROUP = {
    title: 'Team Management',
    items: [
        { view: View.ManagerDashboard, label: 'Manager Dashboard', icon: <ManagerIcon className="w-5 h-5" />, tier: SubscriptionTier.Free },
    ]
};

const tierLevels: Record<SubscriptionTier, number> = {
    [SubscriptionTier.Free]: 0,
    [SubscriptionTier.Premium]: 1,
    [SubscriptionTier.Enterprise]: 2,
};

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onNavigate, onLogout, isCollapsed, setIsCollapsed }) => {
  const { tenant, isManager } = useAppContext();
  
  return (
    <nav className={`flex flex-col bg-card text-card-foreground border-r border-border transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-60'}`} aria-label="Sidebar">
      <div className="flex-1 flex flex-col pt-2 pb-4 overflow-y-auto">
        <div className="flex-1 px-2 space-y-4">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => {
                if ((item as any).hideIfManager && isManager) {
                    return false;
                }
                return item.roles.includes(user.role.name) || user.role.permissions.includes('operations:manage');
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h3>}
                <ul className="mt-2 space-y-1">
                  {visibleItems.map(item => {
                    const requiredTier = item.tier || SubscriptionTier.Free;
                    const userTier = tenant?.subscriptionTier || SubscriptionTier.Free;
                    const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier];
                    
                    const handleNav = (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (hasAccess) {
                            onNavigate(item.view);
                        } else {
                            onNavigate(View.Settings);
                        }
                    };

                    return (
                    <li key={item.view}>
                      <a
                        href="#"
                        onClick={handleNav}
                        className={`flex items-center p-2 text-sm font-medium rounded-md group transition-colors ${
                          currentView === item.view 
                            ? 'bg-primary/10 text-primary dark:text-foreground dark:bg-secondary font-semibold' 
                            : 'hover:bg-secondary text-foreground'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className={`${currentView === item.view ? 'text-primary dark:text-foreground' : 'text-muted-foreground'}`}>{item.icon}</span>
                        {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>}
                        {!isCollapsed && !hasAccess && (
                            <span className="ml-auto" title="Upgrade required">
                                <LockIcon className="w-4 h-4 text-yellow-500" />
                            </span>
                        )}
                      </a>
                    </li>
                  )})}
                </ul>
              </div>
            );
          })}

            {isManager && (
                 <div>
                    {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{MANAGER_NAV_GROUP.title}</h3>}
                    <ul className="mt-2 space-y-1">
                        {MANAGER_NAV_GROUP.items.map(item => (
                             <li key={item.view}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onNavigate(item.view); }}
                                    className={`flex items-center p-2 text-sm font-medium rounded-md group transition-colors ${
                                    currentView === item.view 
                                        ? 'bg-primary/10 text-primary dark:text-foreground dark:bg-secondary font-semibold' 
                                        : 'hover:bg-secondary text-foreground'
                                    }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className={`${currentView === item.view ? 'text-primary dark:text-foreground' : 'text-muted-foreground'}`}>{item.icon}</span>
                                    {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        
        <div className="mt-auto p-2">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onLogout(); }}
                className="flex items-center p-2 text-sm font-medium rounded-md hover:bg-secondary text-foreground"
                title={isCollapsed ? "Sign Out" : undefined}
            >
                <SignOutIcon className="w-5 h-5 text-muted-foreground" />
                {!isCollapsed && <span className="ml-3">Sign Out</span>}
            </a>
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center p-2 mt-2 text-sm font-medium rounded-md hover:bg-secondary"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${!isCollapsed && 'rotate-180'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;