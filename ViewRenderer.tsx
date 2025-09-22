import React, { Suspense } from 'react';
import type { View as ViewEnum, User } from './types';
import { View, SubscriptionTier } from './types';
import { useAppContext } from './AppContext.tsx';
import LoadingSpinner from './components/common/LoadingSpinner.tsx';

const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView.tsx'));
const EmployeesView = React.lazy(() => import('./components/employees/EmployeesView.tsx'));
const OrganizationView = React.lazy(() => import('./components/organization/OrganizationView.tsx'));
const PayrollView = React.lazy(() => import('./components/payroll/PayrollView.tsx'));
const TimeAttendanceView = React.lazy(() => import('./components/time-attendance/TimeAttendanceView.tsx'));
const DocumentView = React.lazy(() => import('./components/documents/DocumentView.tsx'));
const AssetView = React.lazy(() => import('./components/assets/AssetView.tsx'));
const LaborLawComplianceView = React.lazy(() => import('./components/compliance/LaborLawComplianceView.tsx'));
const AnalyticsView = React.lazy(() => import('./components/analytics/AnalyticsView.tsx'));
const AuditTrailView = React.lazy(() => import('./components/audit/AuditTrailView.tsx'));
const MyProfileView = React.lazy(() => import('./components/profile/MyProfileView.tsx'));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView.tsx'));
const EmployeeDashboardView = React.lazy(() => import('./components/employee-dashboard/EmployeeDashboardView.tsx'));
const EmployeeProfileView = React.lazy(() => import('./components/employees/EmployeeProfileView.tsx'));
const RecruitmentView = React.lazy(() => import('./components/recruitment/RecruitmentView.tsx'));
const VehicleManagementView = React.lazy(() => import('./components/vehicles/VehicleManagementView.tsx'));
const PettyCashView = React.lazy(() => import('./components/petty-cash/PettyCashView.tsx'));
const UpgradeView = React.lazy(() => import('./components/common/UpgradeView.tsx'));
const ManagerDashboardView = React.lazy(() => import('./components/manager-dashboard/ManagerDashboardView.tsx'));
const DirectoryView = React.lazy(() => import('./components/directory/DirectoryView.tsx'));
const HelpSupportView = React.lazy(() => import('./components/help/HelpSupportView.tsx'));
const KnowledgeBaseView = React.lazy(() => import('./components/knowledge-base/KnowledgeBaseView.tsx'));


interface ViewRendererProps {
    currentView: ViewEnum;
    setCurrentView: (view: ViewEnum) => void;
    selectedEmployeeId: string | null;
    onViewProfile: (employeeId: string) => void;
}

const AccessDenied: React.FC = () => (
  <div className="p-8 text-center text-destructive">
    <h2 className="text-xl font-bold">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

const tierLevels: Record<SubscriptionTier, number> = {
    [SubscriptionTier.Free]: 0,
    [SubscriptionTier.Premium]: 1,
    [SubscriptionTier.Enterprise]: 2,
};

const ViewRenderer: React.FC<ViewRendererProps> = ({ currentView, setCurrentView, selectedEmployeeId, onViewProfile }) => {
    const { currentUser, openModal, tenant, isManager } = useAppContext();

    const hasPermission = (permissionId: string): boolean => {
      // Owner role has all permissions implicitly
      if (currentUser!.role.name === 'Owner') return true;
      return currentUser!.role.permissions.includes(permissionId);
    };

    const hasTierAccess = (requiredTier: SubscriptionTier): boolean => {
        const userTier = tenant?.subscriptionTier || SubscriptionTier.Free;
        return tierLevels[userTier] >= tierLevels[requiredTier];
    }

    const handleRequestLeave = () => openModal('requestLeave');

    const suspenseFallback = (
      <div className="p-8 flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
    
    const renderContent = () => {
       if (!currentUser) return <div className="p-6"><LoadingSpinner /></div>;
       
       const UpgradeScreen = <UpgradeView onUpgrade={() => setCurrentView(View.Settings)} />;

       switch (currentView) {
          case View.Dashboard:
            return hasPermission('dashboard:view') ? <DashboardView onNavigate={setCurrentView} /> : <AccessDenied />;
          case View.ManagerDashboard:
            return isManager ? <ManagerDashboardView /> : <AccessDenied />;
          case View.Employees:
            return hasPermission('employees:read') ? <EmployeesView onViewProfile={onViewProfile} /> : <AccessDenied />;
          case View.EmployeeProfile:
            return hasPermission('employees:read') && selectedEmployeeId ? <EmployeeProfileView employeeId={selectedEmployeeId} onViewProfile={onViewProfile} /> : <AccessDenied />;
          case View.OrganizationChart:
            return hasPermission('employees:read') ? <OrganizationView onViewProfile={onViewProfile} /> : <AccessDenied />;
          case View.Directory:
            return <DirectoryView />;
          case View.Recruitment:
            if (!hasPermission('recruitment:manage')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Enterprise) ? <RecruitmentView /> : UpgradeScreen;
          case View.Payroll:
            if (!hasPermission('payroll:read')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Premium) ? <PayrollView /> : UpgradeScreen;
          case View.TimeAttendance:
            if (!hasPermission('employees:read')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Premium) ? <TimeAttendanceView /> : UpgradeScreen;
          case View.Documents:
            return hasPermission('employees:read') ? <DocumentView /> : <AccessDenied />;
          case View.Assets:
            if (!hasPermission('operations:manage')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Premium) ? <AssetView /> : UpgradeScreen;
          case View.VehicleManagement:
            if (!hasPermission('operations:manage')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Premium) ? <VehicleManagementView /> : UpgradeScreen;
          case View.PettyCash:
            if (!hasPermission('operations:manage')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Premium) ? <PettyCashView /> : UpgradeScreen;
          case View.KnowledgeBase:
            return <KnowledgeBaseView />;
          case View.LaborLawCompliance:
            return hasPermission('employees:read') ? <LaborLawComplianceView /> : <AccessDenied />;
          case View.AuditTrail:
            return currentUser.role.name === 'Owner' ? <AuditTrailView /> : <AccessDenied />;
          case View.AnalyticsReports:
            if (!hasPermission('reports:view')) return <AccessDenied />;
            return hasTierAccess(SubscriptionTier.Enterprise) ? <AnalyticsView /> : UpgradeScreen;
          case View.Settings:
            return hasPermission('settings:manage') ? <SettingsView /> : <AccessDenied />;
          // Employee-specific views don't typically need permission checks beyond being logged in
          case View.EmployeeDashboard:
            return <EmployeeDashboardView user={currentUser} onRequestLeave={handleRequestLeave} />;
          case View.MyProfile:
            return <MyProfileView user={currentUser} />;
          case View.HelpSupport:
            return <HelpSupportView />;
          default:
              // Fallback for managers or others to a relevant page
              if (isManager) return <ManagerDashboardView />;
              if (hasPermission('dashboard:view')) return <DashboardView onNavigate={setCurrentView} />;
              return <EmployeeDashboardView user={currentUser} onRequestLeave={handleRequestLeave} />;
        }
    }

    return (
      <Suspense fallback={suspenseFallback}>
        {renderContent()}
      </Suspense>
    );
};

export default ViewRenderer;