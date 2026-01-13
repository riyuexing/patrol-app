
import React, { useState } from 'react';
import { Camera, MapPin, Check, X, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { 
  InspectionRecord, InspectionStatus, ShiftType, User, 
  AbnormalType, AbnormalLevel, InspectionItem 
} from '../types';
import { SHIFTS, MOCK_TEMPLATES } from '../constants';

interface CreateInspectionScreenProps {
  onCancel: () => void;
  onSave: () => void;
  user: User;
}

const CreateInspectionScreen: React.FC<CreateInspectionScreenProps> = ({ onCancel, onSave, user }) => {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [location, setLocation] = useState('');
  const [shift, setShift] = useState<ShiftType>(ShiftType.MORNING);
  const [overallStatus, setOverallStatus] = useState<InspectionStatus>(InspectionStatus.NORMAL);
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const template = MOCK_TEMPLATES.find(t => t.id === id);
    if (template) {
      setItems(template.items.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        result: 'NORMAL',
        photos: []
      })));
    }
  };

  const updateItemStatus = (id: string, result: 'NORMAL' | 'ABNORMAL') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, result } : item));
    if (result === 'ABNORMAL') setOverallStatus(InspectionStatus.ABNORMAL);
  };

  const handleSave = async () => {
    if (!location.trim()) return alert('请输入巡检地点');
    
    setIsSaving(true);
    // 拟物化加载动画
    await new Promise(r => setTimeout(r, 1200));
    
    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      location: location.trim(),
      locationCode: 'LOC-' + Math.floor(Math.random() * 1000),
      team: user.team,
      shift,
      inspector: user.username,
      timestamp: Date.now(),
      overallStatus,
      remark,
      items: mode === 'quick' ? [{ id: 'q1', name: '全项检查', result: overallStatus as any, photos: [] }] : items
    };

    db.saveInspection(newRecord);
    onSave();
    setIsSaving(false);
  };

  return (
    <div className="p-4 pb-40 space-y-6">
      {/* 顶部页签 */}
      <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner">
        <button 
          onClick={() => setMode('quick')}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'quick' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500'}`}
        >
          快速模式
        </button>
        <button 
          onClick={() => setMode('advanced')}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'advanced' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500'}`}
        >
          高级模板
        </button>
      </div>

      {/* 基础信息 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
        <div className="space-y-4">
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
            <input 
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-blue-100 transition-all"
              placeholder="请输入巡检地点..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select 
              className="px-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-xs appearance-none text-center"
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType)}
            >
              {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="px-4 py-4 bg-gray-50 rounded-2xl font-black text-xs flex items-center justify-center text-gray-400">
              {user.username}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {mode === 'quick' ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">巡检结论结论</p>
             <div className="flex gap-4">
                <button 
                  onClick={() => setOverallStatus(InspectionStatus.NORMAL)}
                  className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.NORMAL ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-transparent opacity-40'}`}
                >
                  <CheckCircle size={32} className="text-green-600" />
                  <span className="font-black text-xs text-green-800">正常</span>
                </button>
                <button 
                  onClick={() => setOverallStatus(InspectionStatus.ABNORMAL)}
                  className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.ABNORMAL ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-transparent opacity-40'}`}
                >
                  <AlertCircle size={32} className="text-red-600" />
                  <span className="font-black text-xs text-red-800">发现异常</span>
                </button>
             </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none min-h-[120px] font-bold text-sm"
              placeholder="备注说明信息..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
               <button className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 active:bg-gray-200 transition-colors">
                 <Camera size={24} />
               </button>
               <div className="flex-1 flex items-center text-xs font-bold text-gray-300">
                 拍摄现场照片（可选）
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
           <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
             <select 
              className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl outline-none font-black text-sm appearance-none"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">点击选择预置模板...</option>
              {MOCK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
           </div>
           {items.map((item, idx) => (
             <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group">
               <span className="text-sm font-black text-gray-700">{idx + 1}. {item.name}</span>
               <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => updateItemStatus(item.id, 'NORMAL')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${item.result === 'NORMAL' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400'}`}
                  >正常</button>
                  <button 
                    onClick={() => updateItemStatus(item.id, 'ABNORMAL')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${item.result === 'ABNORMAL' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}
                  >异常</button>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* 底部操作 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex flex-col gap-3 z-40">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
          {isSaving ? '正在上传同步...' : '提交记录'}
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-4 text-gray-400 font-black text-sm active:bg-gray-100 rounded-2xl transition-colors"
        >
          放弃本次巡检
        </button>
      </div>
    </div>
  );
};

export default CreateInspectionScreen;
