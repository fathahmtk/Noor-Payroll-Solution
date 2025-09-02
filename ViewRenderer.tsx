import React from 'react';
import type { View as ViewEnum, User } from './types';
import { View } from './types';
import DashboardView from './components/dashboard/DashboardView';
import EmployeesView from './components/employees/EmployeesView';
import OrganizationView from './components/organization/OrganizationView';
import PayrollView from './components/payroll/PayrollView';
import TimeAttendanceView from './components/time-attendance/TimeAttendanceView';
import DocumentView from './components/documents/DocumentView';
import AssetView from './components/assets/AssetView';
import LaborLawComplianceView from './components/compliance/LaborLawComplianceView';
import AnalyticsView from './components/analytics/AnalyticsView';
import MyProfileView from './components/profile/MyProfileView';
import SettingsView from './components/settings/SettingsView';
import EmployeeDashboardView from './components/employee-dashboard/EmployeeDashboardView';
import { useAppContext } from './AppContext';
import EmployeeProfileView from './components/employees/EmployeeProfileView';
import RecruitmentView from './components/recruitment/RecruitmentView';

interface ViewRendererProps {
    currentView: ViewEnum;
    setCurrentView: (view: ViewEnum) => void;
    selectedEmployeeId: string | null;
    onViewProfile: (employeeId: string) => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({ currentView, setCurrentView, selectedEmployeeId, onViewProfile }) => {
    const { currentUser, openModal } = useAppContext();
    
    if (!currentUser) return <div>Loading user...</div>; // Or a spinner

    const hasPermission = (permissionId: string): boolean => {
      return currentUser.role.permissions.includes(permissionId);
    };

    const AccessDenied: React.FC = () => (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );

    const handleRequestLeave = () => openModal('requestLeave');

    switch (currentView) {
      case View.Dashboard:
        return hasPermission('dashboard:view') ? <DashboardView onNavigate={setCurrentView} /> : <EmployeeDashboardView user={currentUser} onRequestLeave={handleRequestLeave} />;
      case View.Employees:
        return hasPermission('employees:read') ? <EmployeesView onViewProfile={onViewProfile} /> : <AccessDenied />;
      case View.EmployeeProfile:
        return hasPermission('employees:read') && selectedEmployeeId ? <EmployeeProfileView employeeId={selectedEmployeeId} /> : <AccessDenied />;
      case View.OrganizationChart:
        return hasPermission('employees:read') ? <OrganizationView /> : <AccessDenied />;
      case View.Recruitment:
        return hasPermission('recruitment:manage') ? <RecruitmentView /> : <AccessDenied />;
      case View.Payroll:
        return hasPermission('payroll:read') ? <PayrollView /> : <AccessDenied />;
      case View.TimeAttendance:
        return hasPermission('employees:read') ? <TimeAttendanceView /> : <AccessDenied />;
      case View.Documents:
        return hasPermission('employees:read') ? <DocumentView /> : <AccessDenied />;
      case View.Assets:
        return hasPermission('employees:read') ? <AssetView /> : <AccessDenied />;
      case View.LaborLawCompliance:
        return hasPermission('employees:read') ? <LaborLawComplianceView /> : <AccessDenied />;
      case View.AnalyticsReports:
        return hasPermission('reports:view') ? <AnalyticsView /> : <AccessDenied />;
      case View.Settings:
        return hasPermission('settings:manage') ? <SettingsView /> : <AccessDenied />;
      // Employee-specific views don't typically need permission checks beyond being logged in
      case View.EmployeeDashboard:
        return <EmployeeDashboardView user={currentUser} onRequestLeave={handleRequestLeave} />;
      case View.MyProfile:
        return <MyProfileView user={currentUser} />;
      default:
        return <div>View not found</div>;
    }
};

export default ViewRenderer;
