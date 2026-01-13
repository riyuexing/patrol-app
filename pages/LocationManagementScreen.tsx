
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, MapPin, Radio, QrCode, MoreVertical, 
  Trash2, ChevronRight, X, Smartphone, Check, Download,
  LayoutGrid, Info, Loader2, Link, Link2Off, RefreshCw, Printer, 
  ScanLine, FileUp, FileDown, CheckSquare, Square, Zap
} from 'lucide-react';
import { db } from '../db';
import { LocationDef } from '../types';
import ScannerModal from '../components/ScannerModal';

const LocationManagementScreen: React.FC = () => {
  const [locations, setLocations] = useState<LocationDef[]>(db.getLocations());
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExternalQrScanner, setShowExternalQrScanner] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Partial<LocationDef> | null>(null);
  
  // 批量操作状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [activeBindingTab, setActiveBindingTab] = useState<'info' | 'nfc' | 'qr'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLocations = useMemo(() => {
    return locations.filter(l => 
      l.name.includes(searchTerm) || l.code.includes(searchTerm) || l.area.includes(searchTerm)
    );
  }, [locations, searchTerm]);

  const handleSaveLocation = () => {
    if (!editingLoc?.name || !editingLoc?.code) return alert('请填写完整信息');
    
    const newLoc: LocationDef = {
      id: editingLoc.id || Math.random().toString(36).substr(2, 9),
      name: editingLoc.name!,
      code: editingLoc.code!,
      area: editingLoc.area || '未分类',
      hasNFC: editingLoc.hasNFC || false,
      hasQR: editingLoc.hasQR || false,
      nfcTagId: editingLoc.nfcTagId,
      qrTagId: editingLoc.qrTagId,
      nfcBindDate: editingLoc.nfcBindDate,
      qrBindDate: editingLoc.qrBindDate,
    };

    db.saveLocation(newLoc);
    setLocations(db.getLocations());
    setShowEditModal(false);
  };

  // Define the missing handleDelete function to fix the error on line 362
  const handleDelete = (id: string) => {
    if (confirm('确定要删除此点位档案吗？此操作不可撤销。')) {
      db.deleteLocation(id);
      setLocations(db.getLocations());
    }
  };

  // --- 导入导出逻辑 ---
  const handleExportCSV = () => {
    const headers = ['ID', '名称', '编码', '区域', 'NFC_UID', 'QR_资产ID'];
    const rows = locations.map(l => [l.id, l.name, l.code, l.area, l.nfcTagId || '', l.qrTagId || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    alert('正在生成地点库报表...\n(模拟下载地点库详情.csv)');
    console.log("CSV Content:\n", csvContent);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    // 模拟解析过程
    setTimeout(() => {
      alert('成功导入 3 个新巡检点，并自动关联了 2 个预设 NFC 标签。');
      setIsProcessing(false);
    }, 1500);
  };

  // --- 批量操作逻辑 ---
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个点位档案吗？此操作不可撤销。`)) {
      selectedIds.forEach(id => db.deleteLocation(id));
      setLocations(db.getLocations());
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleBatchHardwareAction = (type: 'NFC' | 'QR', action: 'BIND' | 'UNBIND') => {
    if (action === 'UNBIND' && !confirm(`确定要批量解除 ${selectedIds.size} 个点位的硬件绑定吗？`)) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      selectedIds.forEach(id => {
        const loc = locations.find(l => l.id === id);
        if (loc) {
          if (type === 'NFC') {
            loc.hasNFC = action === 'BIND';
            loc.nfcTagId = action === 'BIND' ? 'BATCH_NFC_' + Math.floor(Math.random() * 9999) : undefined;
            loc.nfcBindDate = action === 'BIND' ? Date.now() : undefined;
          } else {
            loc.hasQR = action === 'BIND';
            loc.qrTagId = action === 'BIND' ? 'BATCH_QR_' + Math.floor(Math.random() * 9999) : undefined;
            loc.qrBindDate = action === 'BIND' ? Date.now() : undefined;
          }
          db.saveLocation(loc);
        }
      });
      setLocations(db.getLocations());
      setIsProcessing(false);
      alert(`批量操作成功：已${action === 'BIND' ? '绑定' : '解绑'}硬件。`);
    }, 1000);
  };

  // --- NFC 逻辑 ---
  const handleNfcAction = (action: 'bind' | 'replace') => {
    setIsProcessing(true);
    setTimeout(() => {
      const newUid = 'UID_' + Math.floor(Math.random() * 1000000);
      setEditingLoc(prev => ({ 
        ...prev, 
        hasNFC: true, 
        nfcTagId: newUid,
        nfcBindDate: Date.now()
      }));
      setIsProcessing(false);
      if (navigator.vibrate) navigator.vibrate(200);
    }, 1500);
  };

  const handleUnbindNfc = () => {
    if (confirm('解绑后，现有的物理 NFC 标签将失效。确定继续？')) {
      setEditingLoc(prev => ({ ...prev, hasNFC: false, nfcTagId: undefined, nfcBindDate: undefined }));
    }
  };

  // --- 二维码逻辑 ---
  const handleExternalQrBind = (scannedCode: string) => {
    setEditingLoc(prev => ({ 
      ...prev, 
      hasQR: true, 
      qrTagId: scannedCode,
      qrBindDate: Date.now() 
    }));
    setShowExternalQrScanner(false);
  };

  const handleUnbindQr = () => {
    if (confirm('解绑后，该资产二维码将不再指向此巡检点。确定解绑？')) {
      setEditingLoc(prev => ({ ...prev, hasQR: false, qrTagId: undefined, qrBindDate: undefined }));
    }
  };

  return (
    <div className="p-4 space-y-4 pb-32 animate-in fade-in duration-300">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv" />
      
      {/* 顶部标题与批量切换 */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-white">地点库与硬件管理</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {isSelectionMode ? `已选择 ${selectedIds.size} 项` : `Managed Assets: ${locations.length}`}
          </p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
            className={`p-2 rounded-xl transition-all ${isSelectionMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-400 border border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}
          >
            {isSelectionMode ? <X size={20} /> : <CheckSquare size={20} />}
          </button>
          {!isSelectionMode && (
            <button 
              onClick={() => { setEditingLoc({ area: '采煤区' }); setActiveBindingTab('info'); setShowEditModal(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={3} />
              新增点位
            </button>
          )}
        </div>
      </div>

      {/* 导入导出与搜索 */}
      <div className="space-y-3">
        {!isSelectionMode && (
          <div className="flex gap-2">
            <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 active:scale-95 transition-all">
              <FileUp size={14} className="text-indigo-500" /> 批量导入
            </button>
            <button onClick={handleExportCSV} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 active:scale-95 transition-all">
              <FileDown size={14} className="text-blue-500" /> 导出详情
            </button>
          </div>
        )}
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 outline-none font-bold text-sm"
            placeholder="搜索名称、区域或硬件 UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="grid gap-3">
        {filteredLocations.map(loc => {
          const isSelected = selectedIds.has(loc.id);
          return (
            <div 
              key={loc.id} 
              onClick={() => isSelectionMode && toggleSelect(loc.id)}
              className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all flex items-center justify-between group active:scale-[0.98] ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}
            >
              <div className="flex items-center gap-4">
                {isSelectionMode ? (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 bg-gray-50'}`}>
                    {isSelected && <Check size={14} strokeWidth={4} />}
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 dark:bg-gray-800">
                    <MapPin size={24} />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-gray-800 dark:text-gray-200">{loc.name}</h3>
                    <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-black tracking-widest dark:bg-gray-800">{loc.area}</span>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider">#{loc.code}</p>
                    {loc.nfcTagId && <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">NFC: {loc.nfcTagId.split('_')[1]}</span>}
                  </div>
                </div>
              </div>

              {!isSelectionMode && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className={`p-1.5 rounded-lg border-2 ${loc.hasNFC ? 'text-indigo-600 border-indigo-100 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-200 border-gray-50 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <Radio size={12} strokeWidth={3} />
                    </div>
                    <div className={`p-1.5 rounded-lg border-2 ${loc.hasQR ? 'text-blue-600 border-blue-100 bg-blue-50 dark:bg-blue-500/10' : 'text-gray-200 border-gray-50 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <QrCode size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingLoc(loc); setActiveBindingTab('info'); setShowEditModal(true); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 批量操作工具栏 */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-900 text-white rounded-[2.5rem] p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 z-50 flex items-center justify-around">
          <button onClick={() => handleBatchHardwareAction('NFC', 'BIND')} className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-indigo-600 rounded-2xl group-active:scale-90 transition-transform"><Smartphone size={20} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">批量 NFC</span>
          </button>
          <button onClick={() => handleBatchHardwareAction('QR', 'BIND')} className="flex flex-col items-center gap-1 group">
            <div className="p-3 bg-blue-600 rounded-2xl group-active:scale-90 transition-transform"><QrCode size={20} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">批量二维码</span>
          </button>
          <div className="w-px h-10 bg-white/10 mx-2"></div>
          <button onClick={() => handleBatchHardwareAction('NFC', 'UNBIND')} className="flex flex-col items-center gap-1 group text-orange-400">
            <div className="p-3 bg-white/10 rounded-2xl group-active:scale-90 transition-transform"><Link2Off size={20} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">批量解绑</span>
          </button>
          <button onClick={handleBatchDelete} className="flex flex-col items-center gap-1 group text-red-400">
            <div className="p-3 bg-red-600/20 rounded-2xl group-active:scale-90 transition-transform text-red-500"><Trash2 size={20} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-red-500">批量删除</span>
          </button>
        </div>
      )}

      {/* 维护详情模态框 */}
      {showEditModal && editingLoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 dark:bg-gray-900 flex flex-col max-h-[90vh] overflow-hidden text-gray-900">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white">点位硬件维护</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hardware Binding System</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 bg-gray-50 rounded-full dark:bg-gray-800 text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* 页签 */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6 dark:bg-gray-800 shrink-0">
              <button onClick={() => setActiveBindingTab('info')} className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeBindingTab === 'info' ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-400'}`}>基本档案</button>
              <button onClick={() => setActiveBindingTab('nfc')} className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeBindingTab === 'nfc' ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-400'}`}>NFC 管理</button>
              <button onClick={() => setActiveBindingTab('qr')} className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeBindingTab === 'qr' ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-400'}`}>二维码管理</button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {activeBindingTab === 'info' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid gap-4">
                    <div className="space-y-1 px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">地点名称</label>
                      <input 
                        className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm dark:bg-gray-800 dark:text-white"
                        placeholder="例如: 中央泵房..."
                        value={editingLoc.name || ''}
                        onChange={(e) => setEditingLoc({ ...editingLoc, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">点位编码</label>
                        <input 
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm dark:bg-gray-800 dark:text-white"
                          placeholder="S-01-A"
                          value={editingLoc.code || ''}
                          onChange={(e) => setEditingLoc({ ...editingLoc, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1 px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属区域</label>
                        <select 
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm dark:bg-gray-800 dark:text-white appearance-none"
                          value={editingLoc.area || ''}
                          onChange={(e) => setEditingLoc({ ...editingLoc, area: e.target.value })}
                        >
                          <option value="采煤区">采煤区</option>
                          <option value="变电所">变电所</option>
                          <option value="运输线">运输线</option>
                          <option value="通风部">通风部</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {editingLoc.id && (
                    <button 
                      onClick={() => { handleDelete(editingLoc.id!); setShowEditModal(false); }}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-red-500 font-black text-[10px] uppercase opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} /> 彻底删除点位档案
                    </button>
                  )}
                </div>
              )}

              {activeBindingTab === 'nfc' && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center transition-all ${editingLoc.hasNFC ? 'bg-indigo-600 border-indigo-200 shadow-xl shadow-indigo-200 text-white' : 'bg-gray-50 border-gray-100 text-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                      {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Smartphone size={32} />}
                    </div>
                    <div className="text-center mt-4 space-y-1">
                      <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">
                        {editingLoc.hasNFC ? '已建立物理映射' : '暂未绑定物理卡'}
                      </h4>
                      {editingLoc.hasNFC && (
                        <div className="flex flex-col items-center gap-1">
                           <p className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">UID: {editingLoc.nfcTagId}</p>
                           <p className="text-[8px] text-gray-400 font-bold uppercase">绑定时间: {new Date(editingLoc.nfcBindDate!).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {editingLoc.hasNFC ? (
                      <>
                        <button 
                          onClick={() => handleNfcAction('replace')}
                          className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs active:bg-indigo-100 transition-all dark:bg-indigo-500/10"
                        >
                          <RefreshCw size={14} /> 更换新标签
                        </button>
                        <button 
                          onClick={handleUnbindNfc}
                          className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs active:bg-red-100 transition-all dark:bg-red-500/10"
                        >
                          <Link2Off size={14} /> 强制解绑
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleNfcAction('bind')}
                        disabled={isProcessing}
                        className="col-span-2 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Link size={18} />
                        {isProcessing ? '正在感应写入...' : '开始绑定物理标签'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeBindingTab === 'qr' && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                   <div className="bg-gray-50 rounded-3xl p-6 dark:bg-gray-800/50 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">模式选择</h4>
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${editingLoc.qrTagId ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {editingLoc.qrTagId ? '外部资产绑定' : '系统内置二维码'}
                         </span>
                      </div>
                      
                      {editingLoc.qrTagId ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center dark:bg-orange-500/20">
                            <QrCode size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black text-gray-800 dark:text-white">已绑定资产码: {editingLoc.qrTagId}</p>
                            <p className="text-[8px] text-gray-400 font-bold mt-1">此模式下，巡检员扫描任意资产贴纸即可进入工单</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 bg-white border-4 border-gray-800 rounded-2xl shadow-sm">
                             <div className="w-20 h-20 bg-gray-50 flex flex-wrap gap-[1px] p-1">
                               {Array.from({ length: 144 }).map((_, i) => (
                                 <div key={i} className={`w-[5px] h-[5px] ${Math.random() > 0.6 ? 'bg-gray-800' : 'bg-transparent'}`}></div>
                               ))}
                             </div>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">ID: {editingLoc.code || 'PENDING'}</p>
                        </div>
                      )}
                   </div>

                   <div className="grid gap-3">
                      {!editingLoc.qrTagId ? (
                        <div className="grid grid-cols-2 gap-3">
                           <button className="flex items-center justify-center gap-2 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs active:bg-blue-100 dark:bg-blue-500/10">
                              <Printer size={14} /> 重印/下载
                           </button>
                           <button 
                              onClick={() => setShowExternalQrScanner(true)}
                              className="flex items-center justify-center gap-2 py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-xs active:bg-orange-100 dark:bg-orange-500/10"
                           >
                              <ScanLine size={14} /> 绑定外部资产
                           </button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleUnbindQr}
                          className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:bg-red-100 dark:bg-red-500/10"
                        >
                          <Link2Off size={14} /> 解除外部资产绑定
                        </button>
                      )}
                   </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-4">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm active:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveLocation}
                className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
              >
                <Check size={18} strokeWidth={3} />
                保存并生效
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 扫码绑定外部 QR 模态框 */}
      {showExternalQrScanner && (
        <ScannerModal 
          onScanSuccess={(loc, code) => handleExternalQrBind(code)}
          onClose={() => setShowExternalQrScanner(false)}
        />
      )}

      {/* 底部策略提示 */}
      <div className="bg-indigo-50/50 p-4 rounded-[1.5rem] border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20">
        <div className="flex gap-3">
          <Info size={18} className="text-indigo-600 shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest dark:text-indigo-400">硬件更换策略须知</p>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
              1. NFC 标签具备唯一硬编码，损坏后必须执行“更换”流程来建立新映射。<br/>
              2. 外部资产二维码（如设备名牌）支持“一码一地”绑定。<br/>
              3. 支持 CSV 批量导入预设编码，实现硬件与点位的一键自动化关联。
            </p>
          </div>
        </div>
      </div>
      
      {/* 处理遮罩 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
          <p className="text-xs font-black text-white tracking-[0.2em] uppercase">正在同步批量数据...</p>
        </div>
      )}
    </div>
  );
};

export default LocationManagementScreen;
