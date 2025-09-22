import React, { useState, useEffect } from 'react';
import { User } from './types.ts';
import LandingPage from './components/LandingPage.tsx';
import { ToastProvider } from './hooks/useToasts.tsx';
import { AppProvider } from './AppContext.tsx';
import LoadingSpinner from './components/common/LoadingSpinner.tsx';
import MainApp from './MainApp.tsx';
import LoginPage from './components/auth/LoginPage.tsx';

const SESSION_KEY = 'noor-hr-session-v1';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'loading' | 'landing' | 'login' | 'dashboard'>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check session only once on initial mount
    try {
      const storedUser = sessionStorage.getItem(SESSION_KEY);
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
        setAppState('dashboard');
      } else {
        setAppState('landing'); // No session, go to landing page
      }
    } catch (error) {
      console.error("Failed to parse session user", error);
      sessionStorage.removeItem(SESSION_KEY);
      setAppState('landing');
    }
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    // Effect to handle inconsistent state safely
    if (appState === 'dashboard' && !currentUser) {
      console.warn("Inconsistent state: dashboard view without a user. Redirecting to login.");
      setAppState('login');
    }
  }, [appState, currentUser]);

  const handleLoginSuccess = (user: User) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setAppState('landing');
  };
  
  const renderContent = () => {
    const loadingScreen = (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
          <LoadingSpinner />
        </div>
    );

    switch (appState) {
      case 'loading':
        return loadingScreen;
      case 'landing':
        return <LandingPage onLoginClick={() => setAppState('login')} onSignUpClick={() => setAppState('login')} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        if (currentUser) {
          return <MainApp currentUser={currentUser} onLogout={handleLogout} />;
        }
        // State is inconsistent, wait for useEffect to correct it.
        // Show a loader to prevent a flicker of content.
        return loadingScreen;
    }
  };

  return (
    <ToastProvider>
      <AppProvider currentUser={currentUser}>
        {renderContent()}
      </AppProvider>
    </ToastProvider>
  );
};

export default App;