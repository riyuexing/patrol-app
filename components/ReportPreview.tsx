
import React from 'react';
import { InspectionRecord, InspectionStatus } from '../types';
import { X, FileText, Download, Printer, ShieldCheck, AlertCircle } from 'lucide-react';

interface ReportPreviewProps {
  record: InspectionRecord;
  onClose: () => void;
  onConfirmExport: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ record, onClose, onConfirmExport }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
      {/* 工具栏 */}
      <div className="w-full max-w-2xl bg-gray-800 text-white p-4 rounded-t-3xl flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-400" />
          <div>
            <h3 className="text-sm font-black tracking-tight">导出预览: 安全巡检报告</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Format: Microsoft Word (.docx)</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* 报表主体 (模拟 A4) */}
      <div className="w-full max-w-2xl flex-1 bg-white overflow-y-auto p-8 shadow-inner custom-scrollbar select-none">
        <div className="max-w-[100%] mx-auto bg-white min-h-full">
          {/* 报表页眉 */}
          <div className="border-b-4 border-double border-gray-800 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter">智慧矿山安全检查记录表</h1>
              <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Smart Mine Safety Inspection Report</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400">报表编号: <span className="text-gray-900">{record.id}</span></p>
              <div className={`mt-2 px-3 py-1 rounded text-[10px] font-black border-2 inline-block ${record.overallStatus === InspectionStatus.NORMAL ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                {record.overallStatus === InspectionStatus.NORMAL ? '安全级别: 良好' : '风险级别: 预警'}
              </div>
            </div>
          </div>

          {/* 基础信息表格 */}
          <div className="grid grid-cols-4 border-2 border-gray-800 text-xs mb-6">
            <div className="bg-gray-100 p-2 font-black border-r border-b border-gray-800">巡检地点</div>
            <div className="p-2 border-r border-b border-gray-800 col-span-3">{record.location} ({record.locationCode})</div>
            
            <div className="bg-gray-100 p-2 font-black border-r border-b border-gray-800">巡检人员</div>
            <div className="p-2 border-r border-b border-gray-800">{record.inspector}</div>
            <div className="bg-gray-100 p-2 font-black border-r border-b border-gray-800">所属班组</div>
            <div className="p-2 border-b border-gray-800">{record.team}</div>

            <div className="bg-gray-100 p-2 font-black border-r border-gray-800">时间/班次</div>
            <div className="p-2 border-r border-gray-800 col-span-3">
              {new Date(record.timestamp).toLocaleString()} | {record.shift}
            </div>
          </div>

          {/* 检查项明细 */}
          <div className="mb-6">
            <h4 className="bg-gray-800 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-3">检查项明细清单 / Inspection Items</h4>
            <table className="w-full border-collapse border border-gray-200 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left w-10">序号</th>
                  <th className="border border-gray-200 p-2 text-left">检查项目</th>
                  <th className="border border-gray-200 p-2 text-center w-20">结论</th>
                  <th className="border border-gray-200 p-2 text-left">备注/详情</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-gray-200 p-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-200 p-2 font-bold">{item.name}</td>
                    <td className={`border border-gray-200 p-2 text-center font-black ${item.result === 'ABNORMAL' ? 'text-red-600' : 'text-green-600'}`}>
                      {item.result === 'NORMAL' ? '正常' : '异常'}
                    </td>
                    <td className="border border-gray-200 p-2 text-gray-500 italic">{item.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 整改轨迹 */}
          {record.rectifyLogs && record.rectifyLogs.length > 0 && (
            <div className="mb-6">
              <h4 className="bg-gray-800 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-3">整改与复查记录 / Rectification History</h4>
              <div className="space-y-4 border-l-2 border-gray-800 ml-2 pl-6">
                {record.rectifyLogs.map((log, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[1.85rem] top-1 w-3 h-3 bg-gray-800 rounded-full"></div>
                    <p className="text-[10px] font-black text-gray-400 mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="text-xs font-bold text-gray-800">{log.remark}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 图片附件 */}
          <div>
            <h4 className="bg-gray-800 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-3">现场取证照片 / Photo Evidence</h4>
            <div className="grid grid-cols-3 gap-2">
              {record.items.flatMap(item => item.photos).concat(record.rectifyLogs?.flatMap(l => l.photos || []) || []).map((photo, pIdx) => (
                <div key={pIdx} className="aspect-video bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                   <img src={photo} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* 签字区 */}
          <div className="mt-12 pt-8 border-t border-dashed border-gray-300 grid grid-cols-2 gap-8 text-xs font-black">
            <div className="flex items-center gap-4">
               <span>巡检员签字:</span>
               <div className="flex-1 border-b border-gray-800 h-8 flex items-end px-2 italic text-blue-800">
                  {record.inspector} (已存电子签名)
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span>复查确认:</span>
               <div className="flex-1 border-b border-gray-800 h-8 flex items-end px-2">
                  {record.overallStatus === InspectionStatus.REVIEWED ? '系统自动复核' : ''}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-b-[2.5rem] flex gap-4 border-t border-gray-100 shadow-2xl">
        <button 
          onClick={onClose}
          className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm active:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button 
          onClick={onConfirmExport}
          className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-95 transition-all"
        >
          <Download size={18} />
          确认生成 Word 报告
        </button>
      </div>
    </div>
  );
};

export default ReportPreview;
