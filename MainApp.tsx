import React, { useState, useMemo, useEffect } from 'react';
import { View, User } from './types';
import Sidebar from './components/layout/Sidebar';
import TopNavBar from './components/layout/TopNavBar';
import Header from './components/layout/Header';
import ViewRenderer from './ViewRenderer';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useDataFetching } from './hooks/useDataFetching';
import { getPayrollRuns } from './services/api';
import GlobalAIAssistant from './components/common/GlobalAIAssistant';
import ChatBubbleIcon from './components/icons/ChatBubbleIcon';
import { useAppContext } from './AppContext';

const MainApp: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  
  const { employees, loading: employeesLoading, currentUser: userFromContext, isManager } = useAppContext();

  const initialView = useMemo(() => {
    if (isManager) {
        return View.ManagerDashboard;
    }
    if (currentUser.role.name === 'Employee') {
        return View.EmployeeDashboard;
    }
    if (!currentUser.role.permissions.includes('dashboard:view')) {
      return View.MyProfile; 
    }
    return View.Dashboard;
  }, [currentUser, isManager]);

  const [currentView, setCurrentView] = useState<View>(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const { data: payrollRuns } = useDataFetching(userFromContext ? `payrollRuns-${userFromContext.tenantId}` : null, () => userFromContext ? getPayrollRuns(userFromContext.tenantId) : Promise.resolve([]));
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!employeesLoading) {
        const timer = setTimeout(() => setIsInitialLoad(false), 200);
        return () => clearTimeout(timer);
    }
  }, [employeesLoading]);

  // Update view if manager status changes after initial load
  useEffect(() => {
    if(isManager && currentView === View.EmployeeDashboard) {
        setCurrentView(View.ManagerDashboard);
    }
  }, [isManager, currentView]);

  const dataContext = useMemo(() => {
    const relevantEmployees = employees?.map(({ id, name, position, department, basicSalary, allowances, joinDate }) => 
        ({ id, name, position, department, totalSalary: basicSalary + allowances, joinDate })
    );
    const relevantPayroll = payrollRuns?.map(({ month, year, totalAmount, employeeCount }) => 
        ({ month, year, totalAmount, employeeCount })
    );
    return JSON.stringify({ employees: relevantEmployees, payrollRuns: relevantPayroll }, null, 2);
  }, [employees, payrollRuns]);
  
  const isAdmin = useMemo(() => ['Owner', 'HR Manager'].includes(currentUser.role.name), [currentUser]);

  if (isInitialLoad && employeesLoading) {
      return (
          <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
              <LoadingSpinner />
          </div>
      );
  }

  const handleViewProfile = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setCurrentView(View.EmployeeProfile);
  };
  
  const handleBackToEmployees = () => {
    setSelectedEmployeeId(null);
    setCurrentView(View.Employees);
  };

  const headerTitle = useMemo(() => {
    if (currentView === View.EmployeeProfile && selectedEmployeeId) {
      return `Employee Profile`;
    }
    return currentView;
  }, [currentView, selectedEmployeeId]);


  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar user={currentUser} currentView={currentView} onNavigate={setCurrentView} onLogout={onLogout} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar user={currentUser} onNavigate={setCurrentView}/>
        <main className="flex-1 overflow-y-auto">
          <Header title={headerTitle} onBack={currentView === View.EmployeeProfile ? handleBackToEmployees : undefined} />
          <ViewRenderer 
              currentView={currentView} 
              setCurrentView={setCurrentView}
              selectedEmployeeId={selectedEmployeeId}
              onViewProfile={handleViewProfile}
          />
        </main>
      </div>
      {isAdmin && (
        <>
          <GlobalAIAssistant 
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            dataContext={dataContext}
          />
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-6 right-6 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform transform hover:scale-110 z-50"
            aria-label="Open AI Assistant"
          >
            <ChatBubbleIcon />
          </button>
        </>
      )}
    </div>
  );
};

export default MainApp;