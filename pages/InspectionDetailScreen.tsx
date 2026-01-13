
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { InspectionRecord, InspectionStatus, RectifyLog } from '../types';
import { 
  Clock, MapPin, User, ChevronRight, AlertCircle, 
  CheckCircle, Construction, ShieldCheck, Camera, X, PlusCircle, Calendar
} from 'lucide-react';

interface InspectionDetailScreenProps {
  inspectionId: string;
  onBack: () => void;
}

const InspectionDetailScreen: React.FC<InspectionDetailScreenProps> = ({ inspectionId, onBack }) => {
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [showRectifyForm, setShowRectifyForm] = useState(false);
  const [rectifyRemark, setRectifyRemark] = useState('');

  useEffect(() => {
    const r = db.getInspections().find(i => i.id === inspectionId);
    if (r) setRecord(r);
  }, [inspectionId]);

  const handleAddRectification = () => {
    if (!record || !rectifyRemark.trim()) return;
    
    const newLog: RectifyLog = {
      timestamp: Date.now(),
      remark: rectifyRemark,
      photo: `https://picsum.photos/400/300?sig=${Math.random()}` // Mock photo
    };

    const updated: InspectionRecord = {
      ...record,
      overallStatus: InspectionStatus.RECTIFYING,
      rectifyLogs: [...(record.rectifyLogs || []), newLog]
    };
    
    db.saveInspection(updated);
    setRecord(updated);
    setRectifyRemark('');
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
    <div className="pb-40 animate-in fade-in duration-300">
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
            <span className="text-[10px] font-bold text-blue-500">按模板标准</span>
          </div>
          <div className="space-y-3">
            {record.items.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 group active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black text-gray-800">{item.name}</span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase border ${item.result === 'NORMAL' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                    {item.result === 'NORMAL' ? '正常' : '异常'}
                  </span>
                </div>
                {item.remark && <p className="text-xs font-medium text-gray-500 leading-relaxed bg-gray-50/50 p-3 rounded-xl mt-2 italic">“ {item.remark} ”</p>}
                {item.photos.length > 0 && (
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

        {/* Business Flow Timeline */}
        {(record.overallStatus !== InspectionStatus.NORMAL || (record.rectifyLogs && record.rectifyLogs.length > 0)) && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">全周期整改记录</h3>
            
            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-gray-100 before:rounded-full">
              {/* Step 1: Abnormal Discovery */}
              <div className="relative">
                <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm ring-4 ring-red-50"></div>
                <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">异常发现</p>
                    <span className="text-[10px] font-bold text-gray-300">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed">系统标记为“异常”状态，等待整改响应。</p>
                </div>
              </div>

              {/* Step 2: Multiple Rectification Logs */}
              {record.rectifyLogs?.map((log, lIdx) => (
                <div key={lIdx} className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm ring-4 ring-orange-50"></div>
                  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">整改提交 #{lIdx + 1}</p>
                      <span className="text-[10px] font-bold text-gray-300">{new Date(log.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 mb-3">{log.remark}</p>
                    {log.photo && (
                      <div className="rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                        <img src={log.photo} className="w-full h-32 object-cover" alt="rectify" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Step 3: Self-Review Finish */}
              {record.overallStatus === InspectionStatus.REVIEWED && (
                <div className="relative">
                  <div className="absolute -left-[1.625rem] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-4 ring-blue-50"></div>
                  <div className="bg-blue-600 p-5 rounded-[1.5rem] shadow-xl shadow-blue-100 text-white">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">流程终结</p>
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-xs font-black">已由巡检员确认隐患排除，任务已闭环。</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer Floating Actions */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        {showRectifyForm ? (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-200 animate-in slide-in-from-bottom duration-300 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-gray-800 text-sm tracking-tight">提交新整改记录</h4>
              <button 
                onClick={() => setShowRectifyForm(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full active:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold min-h-[100px] outline-none focus:ring-2 focus:ring-orange-200 border-none transition-all"
              placeholder="描述当前整改进展或结果..."
              value={rectifyRemark}
              onChange={(e) => setRectifyRemark(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-gray-100 text-gray-400 rounded-2xl active:bg-gray-200 transition-colors">
                <Camera size={20} />
                <span className="text-[10px] font-black">拍摄照片</span>
              </button>
              <button 
                onClick={handleAddRectification}
                className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-100 active:scale-95 transition-all"
              >
                确认提交整改
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Contextual Buttons */}
            {record.overallStatus === InspectionStatus.ABNORMAL && (
              <button 
                onClick={() => setShowRectifyForm(true)}
                className="w-full bg-orange-500 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Construction size={20} />
                开始首次整改
              </button>
            )}

            {record.overallStatus === InspectionStatus.RECTIFYING && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowRectifyForm(true)}
                  className="bg-white text-orange-500 border-2 border-orange-500 font-black py-5 rounded-[1.5rem] shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <PlusCircle size={20} />
                  追加进展
                </button>
                <button 
                  onClick={() => handleReviewFinish(true)}
                  className="bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ShieldCheck size={20} />
                  复查通过
                </button>
              </div>
            )}

            {record.overallStatus === InspectionStatus.REVIEWED && (
              <div className="w-full bg-green-50 text-green-700 py-4 rounded-2xl flex items-center justify-center gap-2 border border-green-200 opacity-80">
                <CheckCircle size={18} />
                <span className="text-sm font-black uppercase tracking-widest">此巡检记录已闭环归档</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetailScreen;
