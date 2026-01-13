
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { InspectionRecord, InspectionStatus, RectifyLog } from '../types';
import { 
  Clock, MapPin, User, ChevronRight, AlertCircle, 
  CheckCircle, Construction, ShieldCheck, Camera, X, PlusCircle, Calendar, Trash2, Send, Info
} from 'lucide-react';

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

  useEffect(() => {
    const r = db.getInspections().find(i => i.id === inspectionId);
    if (r) setRecord(r);
  }, [inspectionId]);

  const handleAddPhotoToRectify = () => {
    // 模拟拍照
    const mockPhoto = `https://picsum.photos/400/300?sig=${Math.random()}`;
    setRectifyPhotos([...rectifyPhotos, mockPhoto]);
  };

  const handleRemovePhotoFromRectify = (index: number) => {
    setRectifyPhotos(rectifyPhotos.filter((_, i) => i !== index));
  };

  const handleAddRectification = () => {
    if (!record || !rectifyRemark.trim()) return;
    
    const newLog: RectifyLog = {
      timestamp: Date.now(),
      remark: rectifyRemark,
      photos: rectifyPhotos.length > 0 ? [...rectifyPhotos] : []
    };

    const updated: InspectionRecord = {
      ...record,
      overallStatus: InspectionStatus.RECTIFYING,
      rectifyLogs: [...(record.rectifyLogs || []), newLog]
    };
    
    db.saveInspection(updated);
    setRecord(updated);
    setRectifyRemark('');
    setRectifyPhotos([]);
    setShowRectifyForm(false);
  };

  const handleReviewFinish = (pass: boolean) => {
    if (!record) return;
    const updated: InspectionRecord = {
      ...record,
      overallStatus: InspectionStatus.REVIEWED,
      reviewResult: pass ? 'PASS' : 'FAIL'
    };
    db.saveInspection(updated);
    setRecord(updated);
    setShowReviewConfirm(false);
  };

  if (!record) return <div className="p-10 text-center text-gray-400 font-bold">正在加载数据...</div>;

  const getStatusDisplay = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.NORMAL:
        return { color: 'text-green-600 bg-green-50', icon: <CheckCircle size={18} />, label: '一切正常' };
      case InspectionStatus.ABNORMAL:
        return { color: 'text-red-600 bg-red-50', icon: <AlertCircle size={18} />, label: '发现隐患' };
      case InspectionStatus.RECTIFYING:
        return { color: 'text-orange-600 bg-orange-50', icon: <Construction size={18} />, label: '持续整改中' };
      case InspectionStatus.REVIEWED:
        return { color: 'text-blue-600 bg-blue-50', icon: <ShieldCheck size={18} />, label: '自检已闭环' };
    }
  };

  const statusCfg = getStatusDisplay(record.overallStatus);

  return (
    <div className="pb-48 animate-in fade-in duration-300">
      {/* Summary Banner */}
      <div className="bg-white px-6 py-8 border-b border-gray-100 flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 ${statusCfg.color} shadow-sm border-4 border-white ring-4 ring-current/5`}>
          {React.cloneElement(statusCfg.icon as any, { size: 40 })}
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{record.location}</h2>
        <p className="text-gray-400 font-bold text-[10px] mt-1 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">{record.locationCode || 'NO_CODE'}</p>
        <div className={`mt-4 px-5 py-2 rounded-2xl font-black text-xs flex items-center gap-2 ${statusCfg.color} border border-current/10`}>
          {statusCfg.label}
        </div>
      </div>

      {/* Basic Grid */}
      <div className="grid grid-cols-2 bg-white border-b border-gray-100 text-center">
        <div className="p-4 border-r border-gray-50 flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">巡检时间</span>
          <span className="text-xs font-black text-gray-700 flex items-center gap-1">
            <Calendar size={12} className="text-blue-500" />
            {new Date(record.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
            <span className="text-gray-300 mx-0.5">|</span>
            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="p-4 flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">巡检人员</span>
          <span className="text-xs font-black text-gray-700 flex items-center gap-1">
            <User size={12} className="text-blue-500" />
            {record.inspector}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Inspection Items */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">检查细项 ({record.items.length})</h3>
          </div>
          <div className="space-y-3">
            {record.items.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black text-gray-800">{item.name}</span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase border ${item.result === 'NORMAL' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                    {item.result === 'NORMAL' ? '正常' : '异常'}
                  </span>
                </div>
                {item.remark && <p className="text-xs font-medium text-gray-500 bg-gray-50/50 p-3 rounded-xl mt-2 italic">“ {item.remark} ”</p>}
                {item.photos && item.photos.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                    {item.photos.map((p, i) => (
                      <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <img src={p} className="w-full h-full object-cover" alt="item photo" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Timeline of Rectification */}
        {(record.overallStatus !== InspectionStatus.NORMAL || (record.rectifyLogs && record.rectifyLogs.length > 0)) && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">全周期整改记录</h3>
            
            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-gray-100 before:rounded-full">
              {/* Discovery Step */}
              <div className="relative">
                <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm ring-4 ring-red-50"></div>
                <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter mb-1">异常发现</p>
                  <p className="text-xs font-bold text-gray-700">系统标记为“异常”状态，等待整改响应。</p>
                  <p className="text-[9px] text-gray-300 mt-2 font-black">{new Date(record.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Rectification Logs */}
              {record.rectifyLogs?.map((log, lIdx) => (
                <div key={lIdx} className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm ring-4 ring-orange-50"></div>
                  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">整改进度 #{lIdx + 1}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-800 mb-3">{log.remark}</p>
                    {log.photos && log.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {log.photos.map((ph, pIdx) => (
                          <div key={pIdx} className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                            <img src={ph} className="w-full h-full object-cover" alt="rectify" />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-gray-300 mt-3 font-black text-right uppercase">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}

              {/* Reviewed Step */}
              {record.overallStatus === InspectionStatus.REVIEWED && (
                <div className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-4 ring-blue-50"></div>
                  <div className="bg-blue-600 p-5 rounded-[1.5rem] shadow-xl shadow-blue-100 text-white">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">流程销号</p>
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-xs font-black">已确认隐患排除，巡检任务正式闭环。</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modals and Forms */}
      {showRectifyForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-600">
                <PlusCircle size={20} />
                <h4 className="font-black text-sm tracking-tight">提交整改进度说明</h4>
              </div>
              <button onClick={() => { setShowRectifyForm(false); setRectifyPhotos([]); }} className="p-2 bg-gray-50 text-gray-400 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold min-h-[120px] outline-none border-2 border-transparent focus:border-orange-100 transition-all"
              placeholder="请输入本次整改的具体进展、完成情况或临时措施..."
              value={rectifyRemark}
              onChange={(e) => setRectifyRemark(e.target.value)}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">整改现场照片 ({rectifyPhotos.length})</span>
                <button 
                  onClick={handleAddPhotoToRectify}
                  className="text-xs font-black text-blue-600 flex items-center gap-1"
                >
                  <Camera size={14} /> 拍摄照片
                </button>
              </div>
              
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {rectifyPhotos.map((photo, pIdx) => (
                  <div key={pIdx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group">
                    <img src={photo} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleRemovePhotoFromRectify(pIdx)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {rectifyPhotos.length === 0 && (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-200">
                    <Camera size={24} />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleAddRectification}
              className="w-full py-5 bg-orange-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              提交本轮整改
            </button>
          </div>
        </div>
      )}

      {showReviewConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-800">确认复查通过？</h4>
              <p className="text-xs font-bold text-gray-400 leading-relaxed">请确保隐患已完全排除且整改照片真实有效。操作后该记录将闭环归档。</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleReviewFinish(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                确认并结束任务
              </button>
              <button 
                onClick={() => setShowReviewConfirm(false)}
                className="w-full py-3 text-gray-400 font-bold text-xs"
              >
                返回检查
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <div className="flex flex-col gap-3">
          {record.overallStatus === InspectionStatus.ABNORMAL && (
            <button 
              onClick={() => setShowRectifyForm(true)}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Construction size={20} />
              开始整改处理
            </button>
          )}

          {record.overallStatus === InspectionStatus.RECTIFYING && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowRectifyForm(true)}
                className="bg-white text-orange-600 border-2 border-orange-600 font-black py-5 rounded-[1.5rem] shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <PlusCircle size={20} />
                追加进展
              </button>
              <button 
                onClick={() => setShowReviewConfirm(true)}
                className="bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ShieldCheck size={20} />
                复查通过
              </button>
            </div>
          )}

          {record.overallStatus === InspectionStatus.REVIEWED && (
            <div className="w-full bg-blue-50 text-blue-700 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 border border-blue-200 animate-in fade-in">
              <CheckCircle size={20} />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">闭环状态</p>
                <p className="text-sm font-black">此巡检记录已成功复查销号</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailScreen;
