
import React, { useState, useEffect } from 'react';
import { X, Zap, Scan, Type, Loader2 } from 'lucide-react';

interface ScannerModalProps {
  onScanSuccess: (location: string, code: string) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 模拟扫描过程
  useEffect(() => {
    const timer = setTimeout(() => {
      // 模拟 2秒后自动识别成功
      handleMockScan();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleMockScan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // 模拟解析出的数据
      const mockData = {
        loc: "中央变电所",
        code: "P-08-MAIN"
      };
      onScanSuccess(mockData.loc, mockData.code);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between text-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X size={24} />
        </button>
        <h3 className="text-sm font-black tracking-widest uppercase">扫描地点二维码</h3>
        <button className="p-2 bg-white/10 rounded-full">
          <Zap size={20} />
        </button>
      </div>

      {/* Scanner Body */}
      <div className="relative w-full flex-1 flex items-center justify-center p-10">
        {/* 背景辅助线 */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* 取景框 */}
        <div className="relative w-full aspect-square max-w-[280px]">
          {/* 四角边框 */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
          
          {/* 扫描动画线 */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]"></div>
          
          {/* 分析遮罩 */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-xs font-black tracking-widest text-blue-400">正在解析编码...</p>
            </div>
          )}
        </div>

        <p className="absolute bottom-20 text-center text-[10px] font-bold text-white/50 px-10 leading-relaxed uppercase tracking-widest">
          请将二维码置于框内<br/>系统将自动识别地点并开始巡检
        </p>
      </div>

      {/* Footer Actions */}
      <div className="w-full p-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-8">
        <button onClick={onClose} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
            <Type size={20} />
          </div>
          <span className="text-[10px] font-black text-white/60">手动输入</span>
        </button>
        <button onClick={handleMockScan} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center group-active:scale-90 transition-transform shadow-xl shadow-blue-500/20">
            <Scan size={24} />
          </div>
          <span className="text-[10px] font-black text-blue-400">模拟扫码</span>
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScannerModal;
