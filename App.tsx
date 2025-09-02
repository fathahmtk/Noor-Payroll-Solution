import React, { useState, useMemo } from 'react';
import { View, User } from './types';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './components/LandingPage';
import { ToastProvider } from './hooks/useToasts';
import { AppProvider } from './AppContext';
import Sidebar from './components/layout/Sidebar';
import TopNavBar from './components/layout/TopNavBar';
import Header from './components/layout/Header';
import ViewRenderer from './ViewRenderer';

const MainApp: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  
  const initialView = useMemo(() => {
    if (currentUser.role.name === 'Employee') {
        return View.EmployeeDashboard;
    }
    if (!currentUser.role.permissions.includes('dashboard:view')) {
      return View.MyProfile; 
    }
    return View.Dashboard;
  }, [currentUser]);

  const [currentView, setCurrentView] = useState<View>(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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
    <div className="flex h-screen bg-brand-secondary">
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
    </div>
  );
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState('dashboard');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('landing');
  };

  const renderContent = () => {
    switch (appState) {
      case 'landing':
        return <LandingPage onLoginClick={() => setAppState('login')} onSignUpClick={() => setAppState('login')} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        if (currentUser) {
          return <MainApp currentUser={currentUser} onLogout={handleLogout} />;
        }
        setAppState('login');
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <ToastProvider>
      <AppProvider currentUser={currentUser}>
        {renderContent()}
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
