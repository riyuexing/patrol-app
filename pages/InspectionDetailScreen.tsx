
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { InspectionRecord, InspectionStatus, RectifyLog } from '../types';
import { 
  Clock, MapPin, User, ChevronRight, AlertCircle, 
  CheckCircle, Construction, ShieldCheck, Camera, X, PlusCircle, Calendar, Trash2, Send, Info, Maximize2, PenTool
} from 'lucide-react';
import VoiceInputButton from '../components/VoiceInputButton';

interface InspectionDetailScreenProps {
  inspectionId: string;
  onBack: () => void;
}

const InspectionDetailScreen: React.FC<InspectionDetailScreenProps> = ({ inspectionId, onBack }) => {
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [showRectifyForm, setShowRectifyForm] = useState(false);
  const [showReviewConfirm, setShowReviewConfirm] = useState(false);
  const [rectifyRemark, setRectifyRemark] = useState('');
  const [rectifyPhotos, setRectifyPhotos] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const r = db.getInspections().find(i => i.id === inspectionId);
    if (r) setRecord(r);
  }, [inspectionId]);

  const handleAddRectification = () => {
    if (!record || !rectifyRemark.trim()) return;
    const newLog: RectifyLog = { timestamp: Date.now(), remark: rectifyRemark, photos: [...rectifyPhotos] };
    const updated = { ...record, overallStatus: InspectionStatus.RECTIFYING, rectifyLogs: [...(record.rectifyLogs || []), newLog] };
    db.saveInspection(updated);
    setRecord(updated);
    setRectifyRemark('');
    setRectifyPhotos([]);
    setShowRectifyForm(false);
  };

  if (!record) return <div className="p-10 text-center text-gray-400 font-bold">正在加载数据...</div>;

  const getStatusDisplay = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.NORMAL: return { color: 'text-green-600 bg-green-50', icon: <CheckCircle size={18} />, label: '一切正常' };
      case InspectionStatus.ABNORMAL: return { color: 'text-red-600 bg-red-50', icon: <AlertCircle size={18} />, label: '发现隐患' };
      case InspectionStatus.RECTIFYING: return { color: 'text-orange-600 bg-orange-50', icon: <Construction size={18} />, label: '持续整改中' };
      case InspectionStatus.REVIEWED: return { color: 'text-primary bg-primary/5', icon: <ShieldCheck size={18} />, label: '自检已闭环' };
    }
  };

  const statusCfg = getStatusDisplay(record.overallStatus);
  const sortedRectifyLogs = record.rectifyLogs ? [...record.rectifyLogs].sort((a, b) => b.timestamp - a.timestamp) : [];

  return (
    <div className="pb-48 animate-in fade-in duration-300">
      {/* 顶部概览 */}
      <div className="bg-white px-6 py-8 border-b border-gray-100 flex flex-col items-center text-center dark:bg-gray-900 dark:border-gray-800">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 ${statusCfg.color} shadow-sm border-4 border-white dark:border-gray-800`}>
          {React.cloneElement(statusCfg.icon as any, { size: 40 })}
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{record.location}</h2>
        <div className={`mt-4 px-5 py-2 rounded-2xl font-black text-xs flex items-center gap-2 ${statusCfg.color}`}>
          {statusCfg.label}
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* 情况详述 */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">巡检报告内容</h3>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">
              {record.remark || "（该记录无额外情况备注）"}
            </p>
          </div>
        </section>

        {/* 合规存证 - 签名展示 */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">安全责任存证</h3>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
             <div className="space-y-1">
               <p className="text-xs font-black text-gray-800 dark:text-gray-200">巡检人：{record.inspector}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Digitally</p>
             </div>
             {record.signature ? (
               <div className="w-24 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700">
                 <img src={record.signature} className="max-h-full max-w-full object-contain mix-blend-multiply dark:invert" alt="signature" />
               </div>
             ) : (
               <div className="text-[10px] text-gray-300 italic">缺少签名存证</div>
             )}
          </div>
        </section>

        {/* 整改时间轴 */}
        {(record.overallStatus !== InspectionStatus.NORMAL || sortedRectifyLogs.length > 0) && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">整改闭环流水</h3>
            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-gray-100 dark:before:bg-gray-800">
              {record.overallStatus === InspectionStatus.REVIEWED && (
                <div className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-gray-900 shadow-sm"></div>
                  <div className="bg-primary p-4 rounded-2xl text-white shadow-lg">
                    <p className="text-xs font-black">任务已销号，隐患已排除。</p>
                  </div>
                </div>
              )}
              {sortedRectifyLogs.map((log, lIdx) => (
                <div key={lIdx} className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-gray-900 shadow-sm"></div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{log.remark}</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-black">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div className="relative">
                <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white dark:border-gray-900 shadow-sm"></div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">初始异常上报</p>
                  <p className="text-[9px] text-gray-400 mt-1 font-black">{new Date(record.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 图片预览 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-[80vh] object-contain rounded-3xl" alt="preview" />
        </div>
      )}

      {/* 底部悬浮按钮 */}
      <div className="fixed bottom-24 left-6 right-6 z-40">
        {record.overallStatus === InspectionStatus.ABNORMAL && (
          <button onClick={() => setShowRectifyForm(true)} className="w-full bg-orange-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Construction size={20} />
            立即处理隐患
          </button>
        )}
      </div>
    </div>
  );
};

export default InspectionDetailScreen;
