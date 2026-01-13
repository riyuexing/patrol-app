
import React from 'react';
import { X, Sun, Moon, Monitor, Palette, Type } from 'lucide-react';

interface ThemeSettingsProps {
  onClose: () => void;
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  currentPrimary: string;
  onPrimaryChange: (color: string) => void;
}

const PRIMARY_COLORS = [
  { name: '矿山蓝', value: '#2563eb', class: 'bg-blue-600' },
  { name: '警示橙', value: '#ea580c', class: 'bg-orange-600' },
  { name: '运营绿', value: '#16a34a', class: 'bg-green-600' },
  { name: '沉稳灰', value: '#475569', class: 'bg-slate-600' },
  { name: '安全紫', value: '#7c3aed', class: 'bg-violet-600' },
];

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ 
  onClose, 
  currentTheme, 
  onThemeChange,
  currentPrimary,
  onPrimaryChange
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end justify-center">
      <div className="bg-white w-full max-w-md p-8 rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Palette className="text-gray-400" size={20} />
            <h3 className="text-xl font-black text-gray-800 tracking-tight">应用偏好设置</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* 外观模式 */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">外观显示 / Appearance</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: '浅色', icon: <Sun size={18} /> },
              { id: 'dark', label: '深色', icon: <Moon size={18} /> },
              { id: 'system', label: '跟随系统', icon: <Monitor size={18} /> },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => onThemeChange(mode.id as any)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  currentTheme === mode.id 
                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                  : 'border-gray-50 bg-gray-50 text-gray-400'
                }`}
              >
                {mode.icon}
                <span className="text-xs font-black">{mode.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 主题配色 */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">主题配色 / Brand Color</h4>
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl">
            {PRIMARY_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onPrimaryChange(color.value)}
                className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-all ${
                  currentPrimary === color.value ? 'ring-4 ring-offset-2 ring-gray-200 scale-110' : 'scale-100 opacity-60'
                }`}
              >
                {currentPrimary === color.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
            ))}
          </div>
        </section>

        {/* 字体大小 */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">显示密度 / Density</h4>
          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
            <button className="flex-1 py-3 text-xs font-black text-gray-400">标准</button>
            <button className="flex-1 py-3 bg-white shadow-sm rounded-xl text-xs font-black text-gray-800">舒适</button>
            <button className="flex-1 py-3 text-xs font-black text-gray-400">紧凑</button>
          </div>
        </section>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm active:scale-95 transition-all"
        >
          保存并应用设置
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
