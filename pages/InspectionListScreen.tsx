
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Trash2, AlertCircle, CheckCircle, 
  Clock, Construction, ClipboardList, RefreshCw, Calendar, ChevronDown, Filter, X
} from 'lucide-react';
import { db } from '../db';
import { InspectionRecord, InspectionStatus } from '../types';

interface InspectionListScreenProps {
  onViewDetail: (id: string) => void;
  onCreateNew: () => void;
}

type TimeFilterType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

const InspectionListScreen: React.FC<InspectionListScreenProps> = ({ onViewDetail, onCreateNew }) => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  
  // Selection States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Swipe States
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);

  const refreshData = () => {
    setRecords(db.getInspections());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: records.length,
      abnormal: records.filter(r => r.overallStatus === InspectionStatus.ABNORMAL).length,
      rectifying: records.filter(r => r.overallStatus === InspectionStatus.RECTIFYING).length,
    };
  }, [records]);

  const filteredRecords = records.filter(r => {
    // 1. Text Search
    const matchesSearch = r.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (r.locationCode?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Status Filter
    const matchesStatus = filterStatus === 'ALL' || r.overallStatus === filterStatus;

    // 3. Time Filter
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let matchesTime = true;
    if (timeFilter === 'TODAY') {
      matchesTime = r.timestamp >= todayStart;
    } else if (timeFilter === 'YESTERDAY') {
      matchesTime = r.timestamp >= yesterdayStart && r.timestamp < todayStart;
    } else if (timeFilter === 'WEEK') {
      matchesTime = r.timestamp >= weekStart;
    } else if (timeFilter === 'MONTH') {
      matchesTime = r.timestamp >= monthStart;
    } else if (timeFilter === 'CUSTOM') {
      const start = customRange.start ? new Date(customRange.start).getTime() : 0;
      const end = customRange.end ? new Date(customRange.end).getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;
      matchesTime = r.timestamp >= start && r.timestamp <= end;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const getStatusConfig = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.NORMAL:
        return { color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} />, label: '正常' };
      case InspectionStatus.ABNORMAL:
        return { color: 'text-red-600 bg-red-50', icon: <AlertCircle size={14} />, label: '异常' };
      case InspectionStatus.RECTIFYING:
        return { color: 'text-orange-600 bg-orange-50', icon: <Construction size={14} />, label: '待整改' };
      case InspectionStatus.REVIEWED:
        return { color: 'text-blue-600 bg-blue-50', icon: <CheckCircle size={14} />, label: '已复查' };
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: <Clock size={14} />, label: '未知' };
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    if (isSelectionMode) return;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!touchStartPos.current || isSelectionMode) return;
    const deltaX = e.touches[0].clientX - touchStartPos.current.x;
    const deltaY = e.touches[0].clientY - touchStartPos.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      if (deltaX < -40) setSwipedId(id);
      else if (deltaX > 40) setSwipedId(null);
    }
  };

  const filterOptions: { label: string; value: TimeFilterType }[] = [
    { label: '全部', value: 'ALL' },
    { label: '今日', value: 'TODAY' },
    { label: '昨日', value: 'YESTERDAY' },
    { label: '本周', value: 'WEEK' },
    { label: '本月', value: 'MONTH' },
    { label: '自定义', value: 'CUSTOM' },
  ];

  return (
    <div className="p-4 space-y-4 pb-32">
      {/* 顶部统计卡片 */}
      {!isSelectionMode && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">总任务</p>
            <p className="text-2xl font-black text-gray-800 leading-none">{stats.total}</p>
          </div>
          <div className="bg-red-500 p-4 rounded-3xl shadow-lg shadow-red-100 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-tighter mb-1">异常项</p>
            <p className="text-2xl font-black text-white leading-none">{stats.abnormal}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 delay-150">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">待复查</p>
            <p className="text-2xl font-black text-orange-500 leading-none">{stats.rectifying}</p>
          </div>
        </div>
      )}

      {/* 搜索与筛选栏 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              placeholder="搜索地点/编码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={refreshData}
            className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 active:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center overflow-x-auto pb-1 no-scrollbar">
            <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase px-1">
              <Calendar size={12} />
              时间
            </div>
            <div className="flex bg-gray-200/40 p-1 rounded-xl whitespace-nowrap">
              {filterOptions.map(opt => (
                <button 
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${timeFilter === opt.value ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="relative flex-shrink-0">
              <select 
                className="bg-white pl-8 pr-8 py-2 rounded-xl text-[10px] font-black text-gray-700 border-none shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">全部状态</option>
                <option value={InspectionStatus.NORMAL}>正常</option>
                <option value={InspectionStatus.ABNORMAL}>异常</option>
                <option value={InspectionStatus.RECTIFYING}>待整改</option>
                <option value={InspectionStatus.REVIEWED}>已复查</option>
              </select>
              <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 自定义日期选择面板 */}
          {timeFilter === 'CUSTOM' && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase">开始日期</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-200"
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="text-gray-300 self-end pb-3">至</div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase">结束日期</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-200"
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <button 
                onClick={() => {
                  setTimeFilter('ALL');
                  setCustomRange({ start: '', end: '' });
                }}
                className="p-2 text-gray-400 hover:text-red-500 self-end mb-1"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 列表区域 */}
      <div className="space-y-3">
        {filteredRecords.length > 0 ? filteredRecords.map(record => {
          const cfg = getStatusConfig(record.overallStatus);
          const isSwiped = swipedId === record.id;
          
          return (
            <div key={record.id} className="relative overflow-hidden rounded-3xl bg-red-500">
              {/* 隐藏的侧滑按钮 */}
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <button 
                  onClick={() => {
                    db.deleteInspection(record.id);
                    refreshData();
                    setSwipedId(null);
                  }}
                  className="text-white flex flex-col items-center gap-1 font-black"
                >
                  <Trash2 size={24} />
                  <span className="text-[10px]">删除记录</span>
                </button>
              </div>

              {/* 卡片主体 */}
              <div 
                onTouchStart={(e) => handleTouchStart(e, record.id)}
                onTouchMove={(e) => handleTouchMove(e, record.id)}
                onClick={() => isSwiped ? setSwipedId(null) : onViewDetail(record.id)}
                className={`relative bg-white p-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSwiped ? '-translate-x-28' : 'translate-x-0'} shadow-sm border border-gray-100 active:bg-gray-50`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-gray-800 tracking-tight">📍 {record.location}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(record.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{record.locationCode}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 ${cfg.color} border border-current/10 shadow-sm`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {record.inspector[0]}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 italic uppercase">Inspector: {record.inspector}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-300 space-y-4">
            <ClipboardList size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="text-sm font-bold">没有找到匹配的记录</p>
              <p className="text-[10px] mt-1">请尝试调整筛选条件或搜索关键字</p>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮按钮 */}
      <button 
        onClick={onCreateNew}
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-300 flex items-center justify-center active:scale-90 active:rotate-90 transition-all duration-300 z-30 border-4 border-white/20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

export default InspectionListScreen;
