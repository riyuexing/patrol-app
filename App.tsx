
import React, { useState, useEffect } from 'react';
import { db } from './db';
import { InspectionRecord, User, InspectionStatus } from './types';
import Layout from './components/Layout';
import LoginScreen from './pages/LoginScreen';
import InspectionListScreen from './pages/InspectionListScreen';
import CreateInspectionScreen from './pages/CreateInspectionScreen';
import InspectionDetailScreen from './pages/InspectionDetailScreen';
import ProfileScreen from './pages/ProfileScreen';

type Screen = 'splash' | 'login' | 'home' | 'create' | 'detail';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'profile'>('list');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  useEffect(() => {
    // Initializing
    const user = db.getCurrentUser();
    setTimeout(() => {
      if (user) {
        setCurrentUser(user);
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    }, 1500); // Splash delay
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    db.setCurrentUser(user);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    db.setCurrentUser(null);
    setCurrentScreen('login');
  };

  if (currentScreen === 'splash') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-blue-600 text-white animate-pulse">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-white flex items-center justify-center shadow-lg">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight">智巡煤矿</h1>
        <p className="mt-2 text-blue-100 font-medium opacity-80 uppercase tracking-widest text-sm">Smart Inspection System</p>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeTab === 'profile') {
      return <ProfileScreen user={currentUser} onLogout={handleLogout} />;
    }

    switch (currentScreen) {
      case 'home':
        return (
          <InspectionListScreen 
            onViewDetail={(id) => {
              setSelectedInspectionId(id);
              setCurrentScreen('detail');
            }}
            onCreateNew={() => setCurrentScreen('create')}
          />
        );
      case 'create':
        return (
          <CreateInspectionScreen 
            onCancel={() => setCurrentScreen('home')}
            onSave={() => setCurrentScreen('home')}
            user={currentUser!}
          />
        );
      case 'detail':
        return selectedInspectionId ? (
          <InspectionDetailScreen 
            inspectionId={selectedInspectionId}
            onBack={() => setCurrentScreen('home')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Layout 
      title={activeTab === 'profile' ? "个人中心" : (currentScreen === 'create' ? "新建巡检" : (currentScreen === 'detail' ? "巡检详情" : "巡检列表"))}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'list') setCurrentScreen('home');
      }}
      showBack={currentScreen !== 'home' && activeTab === 'list'}
      onBack={() => setCurrentScreen('home')}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
