
import React, { useState, useEffect } from 'react';
import { X, Radio, Loader2, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NFCScannerModalProps {
  onScanSuccess: (location: string, code: string) => void;
  onClose: () => void;
}

const NFCScannerModal: React.FC<NFCScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ndef: any = null;
    const startNFC = async () => {
      if (!('NDEFReader' in window)) {
        setErrorMessage('当前设备或浏览器不支持 NFC 功能');
        return;
      }

      try {
        // @ts-ignore
        ndef = new NDEFReader();
        await ndef.scan();
        
        ndef.onreadingerror = () => {
          setStatus('error');
          setErrorMessage('无法读取标签，请靠近重试');
        };

        ndef.onreading = ({ message, serialNumber }: any) => {
          // 模拟成功震动
          if (navigator.vibrate) navigator.vibrate(100);
          
          // 解析 NDEF 消息
          let location = "未知地点";
          let code = "NFC-TAG";

          for (const record of message.records) {
            if (record.recordType === "text") {
              const textDecoder = new TextDecoder(record.encoding);
              const text = textDecoder.decode(record.data);
              // 假设格式为 "地点|编码"
              if (text.includes('|')) {
                [location, code] = text.split('|');
              } else {
                location = text;
              }
            }
          }

          handleSuccess(location, code);
        };
      } catch (error) {
        setErrorMessage('NFC 权限被拒绝或硬件未开启');
        console.error(error);
      }
    };

    startNFC();
    return () => {
      // 扫码组件销毁时无法显式停止，但 ndef 引用会被回收
    };
  }, []);

  const handleSuccess = (loc: string, code: string) => {
    setStatus('success');
    setTimeout(() => {
      onScanSuccess(loc, code);
    }, 1000);
  };

  const handleMockNFC = () => {
    // 模拟真实的物理感应
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    handleSuccess("皮带转点 3#", "B-03-TRANS");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex flex-col items-center justify-between text-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-black tracking-[0.2em] uppercase">NFC 现场感应</h3>
          <p className="text-[8px] text-blue-400 font-bold tracking-tighter">NEAR FIELD COMMUNICATION</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-12">
        <div className="relative">
          {/* 波纹动画 */}
          {status === 'scanning' && (
            <>
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[2] [animation-delay:0.5s]"></div>
            </>
          )}
          
          {/* 中心图标 */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
            status === 'success' ? 'bg-green-600 border-green-400' : 
            status === 'error' ? 'bg-red-600 border-red-400' : 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-500/50'
          }`}>
            {status === 'scanning' && <Radio size={48} className="animate-pulse" />}
            {status === 'success' && <CheckCircle2 size={48} />}
            {status === 'error' && <AlertTriangle size={48} />}
          </div>
        </div>

        <div className="text-center space-y-2 max-w-[240px]">
          <h4 className="text-lg font-black italic">
            {status === 'scanning' && '正在感应...'}
            {status === 'success' && '识别成功'}
            {status === 'error' && '识别失败'}
          </h4>
          <p className="text-[10px] font-bold text-white/50 leading-relaxed tracking-wider uppercase">
            {status === 'scanning' && '请将手机背面靠近贴有 NFC 标签的设备或位置点'}
            {status === 'success' && '地点数据已同步，正在进入巡检...'}
            {status === 'error' && (errorMessage || '请重新靠近标签')}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full p-10 flex flex-col items-center gap-6">
        <button 
          onClick={handleMockNFC}
          className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group"
        >
          <Smartphone size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black">模拟标签感应</span>
        </button>
        
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">智能巡检终端安全加密通讯</p>
      </div>
    </div>
  );
};

export default NFCScannerModal;
