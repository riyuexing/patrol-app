
import React from 'react';
import { User } from '../types';
import { 
  Settings, LogOut, FileDown, 
  Archive, Database, Trash2, ShieldCheck, HelpCircle 
} from 'lucide-react';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const handleExportCSV = () => {
    alert('正在准备 CSV 数据导出...\n(模拟下载)');
  };

  const handleExportZIP = () => {
    alert('正在打包巡检照片和详细数据...\n(模拟下载 ZIP)');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 ring-4 ring-blue-50">
          <span className="text-3xl text-blue-600 font-black">{user?.username[0]}</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">{user?.username || '未登录'}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{user?.team}</span>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      {/* Action Groups */}
      <div className="space-y-4">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">数据管理</h3>
          </div>
          <button 
            onClick={handleExportCSV}
            className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <FileDown size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800">导出巡检台账 (CSV)</p>
              <p className="text-[10px] text-gray-400">表格形式导出所有巡检数据</p>
            </div>
          </button>
          <button 
            onClick={handleExportZIP}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Archive size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800">导出照片压缩包 (ZIP)</p>
              <p className="text-[10px] text-gray-400">包含所有现场取证照片</p>
            </div>
          </button>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">设置与支持</h3>
          </div>
          <div className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <p className="flex-1 text-left text-sm font-bold text-gray-800">应用设置 / 主题</p>
          </div>
          <div className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 active:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <p className="flex-1 text-left text-sm font-bold text-gray-800">关于智巡 App</p>
            <span className="text-[10px] font-bold text-gray-400">V 1.0.0</span>
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-red-50 text-red-600 rounded-3xl font-black text-sm active:scale-95 transition-all mt-4"
        >
          <LogOut size={20} />
          退 出 登 录
        </button>
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">智慧矿山安全管控系统 · 终端</p>
      </div>
    </div>
  );
};

export default ProfileScreen;
