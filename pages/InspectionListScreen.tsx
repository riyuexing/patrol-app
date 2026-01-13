
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Trash2, AlertCircle, CheckCircle, 
  Clock, Construction, ClipboardList, RefreshCw, Calendar, ChevronDown, Filter, X, Tag, MoreHorizontal, Check, QrCode, Radio
} from 'lucide-react';
import { db } from '../db';
import { InspectionRecord, InspectionStatus } from '../types';
import ScannerModal from '../components/ScannerModal';
import NFCScannerModal from '../components/NFCScannerModal';

interface InspectionListScreenProps {
  onViewDetail: (id: string) => void;
  onCreateNew: (initialData?: { location: string; code: string }) => void;
}

type TimeFilterType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

const InspectionListScreen: React.FC<InspectionListScreenProps> = ({ onViewDetail, onCreateNew }) => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  
  // UI States
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showScanner, setShowScanner] = useState(false);
  const [showNFC, setShowNFC] = useState(false);
  
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
    const matchesSearch = r.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (r.locationCode?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || r.overallStatus === filterStatus;

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

  const handleScanSuccess = (location: string, code: string) => {
    setShowScanner(false);
    setShowNFC(false);
    onCreateNew({ location, code });
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    if (next.size === 0) setIsSelectionMode(false);
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) {
      selectedIds.forEach(id => db.deleteInspection(id));
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      refreshData();
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

  const timeFilterOptions: { label: string; value: TimeFilterType }[] = [
    { label: '全部', value: 'ALL' }, { label: '今日', value: 'TODAY' },
    { label: '昨日', value: 'YESTERDAY' }, { label: '本周', value: 'WEEK' },
    { label: '本月', value: 'MONTH' }, { label: '自定义', value: 'CUSTOM' },
  ];

  const statusFilterOptions = [
    { label: '全部状态', value: 'ALL' },
    { label: '正常', value: InspectionStatus.NORMAL },
    { label: '异常', value: InspectionStatus.ABNORMAL },
    { label: '待整改', value: InspectionStatus.RECTIFYING },
    { label: '已复查', value: InspectionStatus.REVIEWED },
  ];

  return (
    <div className="p-4 space-y-4 pb-32">
      {/* 顶部统计或操作栏 */}
      {isSelectionMode ? (
        <div className="bg-blue-600 p-4 rounded-3xl shadow-xl flex items-center justify-between text-white animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-1 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
            <span className="font-black text-sm uppercase tracking-widest">已选择 {selectedIds.size} 项</span>
          </div>
          <button 
            onClick={handleBatchDelete}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 px-4 py-2 rounded-2xl transition-colors font-black text-xs"
          >
            <Trash2 size={16} />
            批量删除
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">我的巡检</p>
            <p className="text-2xl font-black text-gray-800 leading-none">{stats.total}</p>
          </div>
          <div className="bg-red-500 p-4 rounded-3xl shadow-lg shadow-red-100 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-tighter mb-1">发现异常</p>
            <p className="text-2xl font-black text-white leading-none">{stats.abnormal}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 delay-150">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">待整改</p>
            <p className="text-2xl font-black text-orange-500 leading-none">{stats.rectifying}</p>
          </div>
        </div>
      )}

      {/* 搜索与筛选切换 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
            placeholder="搜索地点或编码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center transition-all ${isFilterExpanded ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-400 active:bg-gray-50'}`}
        >
          {isFilterExpanded ? <ChevronDown size={20} /> : <Filter size={20} />}
        </button>
      </div>

      {/* 可折叠的筛选器 */}
      {isFilterExpanded && (
        <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-top duration-300 origin-top">
          {/* 时间筛选 */}
          <div className="flex items-center gap-3">
            <div className="w-8 flex flex-col items-center justify-center text-gray-300">
              <Calendar size={14} />
              <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">时间</span>
            </div>
            <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {timeFilterOptions.map(opt => (
                <button 
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex-shrink-0 border ${timeFilter === opt.value ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-gray-50 mx-2"></div>
          {/* 状态筛选 */}
          <div className="flex items-center gap-3">
            <div className="w-8 flex flex-col items-center justify-center text-gray-300">
              <Tag size={14} />
              <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">状态</span>
            </div>
            <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {statusFilterOptions.map(opt => (
                <button 
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all flex-shrink-0 border ${filterStatus === opt.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {timeFilter === 'CUSTOM' && (
            <div className="pt-2 mt-2 border-t border-dashed border-gray-100 animate-in zoom-in-95">
              <div className="bg-blue-50/50 p-3 rounded-2xl flex items-center gap-3">
                <input type="date" className="flex-1 bg-white px-3 py-2 rounded-xl text-[10px] font-bold outline-none border border-blue-100" value={customRange.start} onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))} />
                <span className="text-blue-300 text-xs font-black">至</span>
                <input type="date" className="flex-1 bg-white px-3 py-2 rounded-xl text-[10px] font-bold outline-none border border-blue-100" value={customRange.end} onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 列表区域 */}
      <div className="space-y-3">
        {filteredRecords.length > 0 ? filteredRecords.map(record => {
          const cfg = getStatusConfig(record.overallStatus);
          const isSwiped = swipedId === record.id;
          const isSelected = selectedIds.has(record.id);
          
          return (
            <div key={record.id} className="relative overflow-hidden rounded-3xl bg-red-500 shadow-sm">
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <button 
                  onClick={() => {
                    if (confirm('确定要删除此条记录吗？')) {
                      db.deleteInspection(record.id);
                      refreshData();
                      setSwipedId(null);
                    }
                  }}
                  className="text-white flex flex-col items-center gap-1 font-black"
                >
                  <Trash2 size={24} />
                  <span className="text-[10px]">删除</span>
                </button>
              </div>

              <div 
                onContextMenu={(e) => { e.preventDefault(); setIsSelectionMode(true); toggleSelection(record.id); }}
                onTouchStart={(e) => handleTouchStart(e, record.id)}
                onTouchMove={(e) => handleTouchMove(e, record.id)}
                onClick={() => {
                  if (isSelectionMode) toggleSelection(record.id);
                  else if (isSwiped) setSwipedId(null);
                  else onViewDetail(record.id);
                }}
                className={`relative bg-white p-5 transition-transform duration-300 flex gap-4 ${isSwiped ? '-translate-x-28' : 'translate-x-0'} active:bg-gray-50`}
              >
                {/* 选择框 */}
                {isSelectionMode && (
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 bg-gray-50'}`}>
                    {isSelected && <Check size={14} strokeWidth={4} />}
                  </div>
                )}

                <div className="flex-1">
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
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-black tracking-widest">{record.locationCode}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 ${cfg.color} border border-current/10`}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-300 space-y-4">
            <ClipboardList size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="text-sm font-bold">暂无巡检记录</p>
              <p className="text-[10px] mt-1">点击下方按钮开始新的巡检</p>
            </div>
          </div>
        )}
      </div>

      {!isSelectionMode && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-4 items-center z-30">
          <button 
            onClick={() => setShowNFC(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all border-2 border-white/20"
          >
            <Radio size={24} strokeWidth={2.5} className="animate-pulse" />
          </button>
          <button 
            onClick={() => setShowScanner(true)}
            className="w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all border border-blue-100"
          >
            <QrCode size={24} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => onCreateNew()}
            className="w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-300 flex items-center justify-center active:scale-90 active:rotate-90 transition-all duration-300 border-4 border-white/20"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
      )}

      {showScanner && (
        <ScannerModal 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {showNFC && (
        <NFCScannerModal 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowNFC(false)} 
        />
      )}
    </div>
  );
};

export default InspectionListScreen;
