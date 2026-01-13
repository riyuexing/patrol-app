
import React from 'react';
import { User, ClipboardList, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'list' | 'profile';
  onTabChange: (tab: 'list' | 'profile') => void;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  title, 
  showBack, 
  onBack,
  rightAction 
}) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 border-x border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="p-1 -ml-1 text-gray-600 active:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div>{rightAction}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center sticky bottom-0 z-10">
        <button 
          onClick={() => onTabChange('list')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'list' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ClipboardList size={24} />
          <span className="text-xs font-medium">巡检记录</span>
        </button>
        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <UserCircle size={24} />
          <span className="text-xs font-medium">个人中心</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
