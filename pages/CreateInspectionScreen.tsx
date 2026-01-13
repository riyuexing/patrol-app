
import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Check, X, Loader2, CheckCircle, AlertCircle, MessageSquare, Trash2, Wrench, ShieldCheck, QrCode } from 'lucide-react';
import { db } from '../db';
import { 
  InspectionRecord, InspectionStatus, ShiftType, User, 
  InspectionItem, RectifyLog 
} from '../types';
import { SHIFTS, MOCK_TEMPLATES } from '../constants';
import VoiceInputButton from '../components/VoiceInputButton';
import ScannerModal from '../components/ScannerModal';

interface CreateInspectionScreenProps {
  onCancel: () => void;
  onSave: () => void;
  user: User;
  initialData?: { location: string; code: string };
}

const CreateInspectionScreen: React.FC<CreateInspectionScreenProps> = ({ onCancel, onSave, user, initialData }) => {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [location, setLocation] = useState(initialData?.location || '');
  const [locationCode, setLocationCode] = useState(initialData?.code || '');
  const [shift, setShift] = useState<ShiftType>(ShiftType.MORNING);
  const [overallStatus, setOverallStatus] = useState<InspectionStatus>(InspectionStatus.NORMAL);
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // 现场即时整改相关状态
  const [isRectifiedOnSite, setIsRectifiedOnSite] = useState(false);
  const [rectifyRemarkOnSite, setRectifyRemarkOnSite] = useState('');

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
        photos: [],
        remark: ''
      })));
    }
  };

  const handleScanSuccess = (loc: string, code: string) => {
    setLocation(loc);
    setLocationCode(code);
    setShowScanner(false);
  };

  const updateItemStatus = (id: string, result: 'NORMAL' | 'ABNORMAL') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, result } : item));
    if (result === 'ABNORMAL') setOverallStatus(InspectionStatus.ABNORMAL);
  };

  const updateItemRemark = (id: string, val: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, remark: val } : item));
  };

  const handleVoiceResult = (text: string) => {
    setRemark(prev => (prev ? `${prev}，${text}` : text));
  };

  const handleRectifyVoiceResult = (text: string) => {
    setRectifyRemarkOnSite(prev => (prev ? `${prev}，${text}` : text));
  };

  const handleItemVoiceResult = (id: string, text: string) => {
    setItems(prev => prev.map(item => item.id === id ? { 
      ...item, 
      remark: item.remark ? `${item.remark}，${text}` : text 
    } : item));
  };

  const addItemPhoto = (id: string) => {
    const mockPhoto = `https://picsum.photos/400/300?sig=${Math.random()}`;
    setItems(prev => prev.map(item => item.id === id ? { ...item, photos: [...item.photos, mockPhoto] } : item));
  };

  const removeItemPhoto = (id: string, photoIndex: number) => {
    setItems(prev => prev.map(item => item.id === id ? { 
      ...item, 
      photos: item.photos.filter((_, i) => i !== photoIndex) 
    } : item));
  };

  const handleSave = async () => {
    if (!location.trim()) return alert('请输入或扫描巡检地点');
    
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    
    let finalStatus = overallStatus;
    let finalRectifyLogs: RectifyLog[] = [];

    // 处理现场即时整改逻辑
    if (mode === 'quick' && overallStatus === InspectionStatus.ABNORMAL && isRectifiedOnSite) {
      finalStatus = InspectionStatus.REVIEWED;
      finalRectifyLogs = [{
        timestamp: Date.now(),
        remark: `[现场即时整改] ${rectifyRemarkOnSite || '发现隐患并当场处理完毕。'}`,
        photos: [] 
      }];
    }

    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      location: location.trim(),
      locationCode: locationCode || ('LOC-' + Math.floor(Math.random() * 1000)),
      team: user.team,
      shift,
      inspector: user.username,
      timestamp: Date.now(),
      overallStatus: finalStatus,
      remark: mode === 'quick' ? remark : '',
      items: mode === 'quick' ? [{ id: 'q1', name: '全项检查', result: overallStatus as any, photos: [], remark }] : items,
      rectifyLogs: finalRectifyLogs
    };

    db.saveInspection(newRecord);
    onSave();
    setIsSaving(false);
  };

  return (
    <div className="p-4 pb-48 space-y-6">
      {/* 顶部页签 */}
      <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner dark:bg-gray-800">
        <button 
          onClick={() => setMode('quick')}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'quick' ? 'bg-white shadow-lg text-primary dark:bg-gray-700' : 'text-gray-500'}`}
        >
          快速模式
        </button>
        <button 
          onClick={() => setMode('advanced')}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'advanced' ? 'bg-white shadow-lg text-primary dark:bg-gray-700' : 'text-gray-500'}`}
        >
          高级模板
        </button>
      </div>

      {/* 基础信息 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 animate-in slide-in-from-bottom-4 duration-300 dark:bg-gray-900 dark:border-gray-800">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input 
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-primary/10 transition-all dark:bg-gray-800 dark:text-white"
                placeholder="请输入巡检地点..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all dark:bg-blue-500/10"
            >
              <QrCode size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select 
              className="px-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-xs appearance-none text-center dark:bg-gray-800 dark:text-white"
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType)}
            >
              {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="px-4 py-4 bg-gray-50 rounded-2xl font-black text-xs flex items-center justify-center text-gray-400 dark:bg-gray-800">
              {locationCode || user.username}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {mode === 'quick' ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4 dark:bg-gray-900 dark:border-gray-800">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">巡检结论</p>
             <div className="flex gap-4">
                <button 
                  onClick={() => { setOverallStatus(InspectionStatus.NORMAL); setIsRectifiedOnSite(false); }}
                  className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.NORMAL ? 'bg-green-50 border-green-500 dark:bg-green-500/10' : 'bg-gray-50 border-transparent opacity-40 dark:bg-gray-800'}`}
                >
                  <CheckCircle size={32} className="text-green-600" />
                  <span className="font-black text-xs text-green-800 dark:text-green-400">正常</span>
                </button>
                <button 
                  onClick={() => setOverallStatus(InspectionStatus.ABNORMAL)}
                  className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.ABNORMAL ? 'bg-red-50 border-red-500 dark:bg-red-500/10' : 'bg-gray-50 border-transparent opacity-40 dark:bg-gray-800'}`}
                >
                  <AlertCircle size={32} className="text-red-600" />
                  <span className="font-black text-xs text-red-800 dark:text-red-400">发现异常</span>
                </button>
             </div>
          </div>

          {/* 现场即时整改选项 - 仅在异常时显示 */}
          {overallStatus === InspectionStatus.ABNORMAL && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 animate-in slide-in-from-top-4 duration-300 dark:bg-gray-900 dark:border-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 dark:bg-orange-500/20">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-white">现场即时整改</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Immediate Rectification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRectifiedOnSite(!isRectifiedOnSite)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isRectifiedOnSite ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${isRectifiedOnSite ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {isRectifiedOnSite && (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="relative">
                    <div className="absolute right-4 top-4 z-10">
                      <VoiceInputButton onResult={handleRectifyVoiceResult} />
                    </div>
                    <textarea 
                      className="w-full p-4 pr-16 bg-gray-50 rounded-2xl outline-none min-h-[100px] font-bold text-sm dark:bg-gray-800 dark:text-white border border-green-100 dark:border-green-500/20"
                      placeholder="请简要描述整改过程...（如：已重新紧固螺丝）"
                      value={rectifyRemarkOnSite}
                      onChange={(e) => setRectifyRemarkOnSite(e.target.value)}
                    />
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl flex items-center gap-3 border border-green-100 dark:bg-green-500/5 dark:border-green-500/10">
                    <ShieldCheck size={18} className="text-green-600" />
                    <p className="text-[10px] font-bold text-green-700 dark:text-green-400">
                      开启后，此记录提交将直接标记为“已复查”并进入归档。
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative dark:bg-gray-900 dark:border-gray-800">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">隐患描述/备注</p>
            <div className="relative">
              <div className="absolute right-4 top-4 z-10">
                <VoiceInputButton onResult={handleVoiceResult} />
              </div>
              <textarea 
                className="w-full p-4 pr-16 bg-gray-50 rounded-2xl outline-none min-h-[150px] font-bold text-sm dark:bg-gray-800 dark:text-white"
                placeholder="备注说明信息... 点击右侧图标语音录入"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
            <div className="mt-4 flex gap-3">
               <button className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 active:bg-gray-200 transition-colors dark:bg-gray-800">
                 <Camera size={24} />
               </button>
               <div className="flex-1 flex items-center text-xs font-bold text-gray-300">
                 拍摄现场取证照片（可选）
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
           {/* 高级模式内容保持不变... */}
           <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
             <select 
              className="w-full px-4 py-3 bg-primary/5 text-primary rounded-xl outline-none font-black text-sm appearance-none dark:bg-primary/10"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">点击选择预置模板...</option>
              {MOCK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
           </div>
           
           {items.map((item, idx) => (
             <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-right duration-300 dark:bg-gray-900 dark:border-gray-800" style={{ animationDelay: `${idx * 50}ms` }}>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-black text-gray-700 dark:text-gray-200">{idx + 1}. {item.name}</span>
                 <div className="flex bg-gray-100 p-1 rounded-xl dark:bg-gray-800">
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
               {/* 其余项逻辑同前 */}
             </div>
           ))}
        </div>
      )}

      {/* 底部操作 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex flex-col gap-3 z-40 dark:bg-gray-900/80 dark:border-gray-800">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
          {isSaving ? '正在上传同步...' : '提交巡检记录'}
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-4 text-gray-400 font-black text-sm active:bg-gray-100 rounded-2xl transition-colors dark:active:bg-gray-800"
        >
          放弃本次巡检
        </button>
      </div>

      {showScanner && (
        <ScannerModal 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default CreateInspectionScreen;
