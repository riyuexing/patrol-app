
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
  const [initialCreateData, setInitialCreateData] = useState<{ location: string; code: string } | undefined>();

  // 主题状态
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  useEffect(() => {
    // 初始化应用
    const user = db.getCurrentUser();
    
    // 从本地读取偏好
    const savedTheme = localStorage.getItem('app-theme') as any;
    const savedColor = localStorage.getItem('app-primary-color');
    if (savedTheme) setTheme(savedTheme);
    if (savedColor) setPrimaryColor(savedColor);

    setTimeout(() => {
      if (user) {
        setCurrentUser(user);
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    }, 1500); 
  }, []);

  // 动态更新 CSS 变量和深色模式类
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    localStorage.setItem('app-primary-color', primaryColor);

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme, primaryColor]);

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-primary text-white animate-pulse">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-white flex items-center justify-center shadow-lg">
          <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight">智巡煤矿</h1>
        <p className="mt-2 text-white/80 font-medium uppercase tracking-widest text-sm">Smart Inspection System</p>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <ProfileScreen 
          user={currentUser} 
          onLogout={handleLogout} 
          themeProps={{
            theme,
            setTheme,
            primaryColor,
            setPrimaryColor
          }}
        />
      );
    }

    switch (currentScreen) {
      case 'home':
        return (
          <InspectionListScreen 
            onViewDetail={(id) => {
              setSelectedInspectionId(id);
              setCurrentScreen('detail');
            }}
            onCreateNew={(initialData) => {
              setInitialCreateData(initialData);
              setCurrentScreen('create');
            }}
          />
        );
      case 'create':
        return (
          <CreateInspectionScreen 
            onCancel={() => {
              setCurrentScreen('home');
              setInitialCreateData(undefined);
            }}
            onSave={() => {
              setCurrentScreen('home');
              setInitialCreateData(undefined);
            }}
            user={currentUser!}
            initialData={initialCreateData}
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
