
import React, { useState } from 'react';
import { User, InspectionRecord } from '../types';
import { 
  Settings, LogOut, FileDown, 
  Archive, Database, Trash2, ShieldCheck, HelpCircle, FileText, ChevronRight, MapPin
} from 'lucide-react';
import { db } from '../db';
import ReportPreview from '../components/ReportPreview';
import ThemeSettings from '../components/ThemeSettings';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
  onOpenLocations: () => void;
  themeProps: {
    theme: 'light' | 'dark' | 'system';
    setTheme: (t: 'light' | 'dark' | 'system') => void;
    primaryColor: string;
    setPrimaryColor: (c: string) => void;
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onOpenLocations, themeProps }) => {
  const [previewRecord, setPreviewRecord] = useState<InspectionRecord | null>(null);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  const handleExportCSV = () => {
    alert('正在准备 CSV 数据导出...\n(模拟下载)');
  };

  const handleExportZIP = () => {
    alert('正在打包巡检照片和详细数据...\n(模拟下载 ZIP)');
  };

  const handleOpenWordPreview = () => {
    const records = db.getInspections();
    if (records.length === 0) return alert('暂无巡检记录可导出');
    setPreviewRecord(records[0]);
  };

  const handleFinalExportWord = () => {
    alert('🎉 已生成台账报表: [智巡报告_' + previewRecord?.location + '.docx]\n(模拟下载成功)');
    setPreviewRecord(null);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center animate-in zoom-in-95 duration-500 dark:bg-gray-900 dark:border-gray-800">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5">
          <span className="text-3xl text-primary font-black">{user?.username[0]}</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight dark:text-white">{user?.username || '未登录'}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider dark:bg-gray-800">{user?.team}</span>
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      {/* Action Groups */}
      <div className="space-y-4">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">基础档案维护</h3>
          </div>
          
          <button 
            onClick={onOpenLocations}
            className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors dark:active:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-500/10">
              <MapPin size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">巡检地点库管理</p>
              <p className="text-[10px] text-gray-400">维护点位、绑定 NFC、生成二维码</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">数据管理</h3>
          </div>
          
          <button 
            onClick={handleOpenWordPreview}
            className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors dark:active:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-500/10">
              <FileText size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">导出巡检台账 (Word)</p>
              <p className="text-[10px] text-gray-400">生成标准 A4 安全检查记录报表</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button 
            onClick={handleExportCSV}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 active:bg-gray-50 transition-colors dark:border-gray-800 dark:active:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center dark:bg-green-500/10">
              <FileDown size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">导出汇总表 (CSV)</p>
              <p className="text-[10px] text-gray-400">表格形式导出批量巡检原始数据</p>
            </div>
          </button>

          <button 
            onClick={handleExportZIP}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 active:bg-gray-50 transition-colors dark:border-gray-800 dark:active:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center dark:bg-orange-500/10">
              <Archive size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">打包照片凭证 (ZIP)</p>
              <p className="text-[10px] text-gray-400">离线下载所有现场取证高清照片</p>
            </div>
          </button>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">系统设置</h3>
          </div>
          <button 
            onClick={() => setShowThemeSettings(true)}
            className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors dark:active:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center dark:bg-gray-800">
              <Settings size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">应用偏好 / 主题配色</p>
              <p className="text-[10px] text-gray-400">切换外观模式与系统品牌色</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          
          <div className="w-full flex items-center gap-4 px-5 py-4 border-t border-gray-50 active:bg-gray-50 cursor-pointer dark:border-gray-800 dark:active:bg-gray-800">
            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center dark:bg-gray-800">
              <HelpCircle size={20} />
            </div>
            <p className="flex-1 text-left text-sm font-bold text-gray-800 dark:text-gray-200">帮助中心 / 反馈</p>
            <span className="text-[10px] font-bold text-gray-400">V 1.0.0</span>
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-red-50 text-red-600 rounded-3xl font-black text-sm active:scale-95 transition-all mt-4 dark:bg-red-500/10"
        >
          <LogOut size={20} />
          安全退出登录
        </button>
      </div>

      {/* 预览模态框 */}
      {previewRecord && (
        <ReportPreview 
          record={previewRecord} 
          onClose={() => setPreviewRecord(null)} 
          onConfirmExport={handleFinalExportWord}
        />
      )}

      {/* 主题设置 */}
      {showThemeSettings && (
        <ThemeSettings 
          onClose={() => setShowThemeSettings(false)}
          currentTheme={themeProps.theme}
          onThemeChange={themeProps.setTheme}
          currentPrimary={themeProps.primaryColor}
          onPrimaryChange={themeProps.setPrimaryColor}
        />
      )}

      <div className="text-center py-4">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">智巡工业终端安全管控引擎</p>
      </div>
    </div>
  );
};

export default ProfileScreen;
