
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, MapPin, Check, X, Loader2, CheckCircle, AlertCircle, 
  MessageSquare, Trash2, Wrench, ShieldCheck, QrCode, Radio,
  Sparkles, PenTool, Eraser, BrainCircuit
} from 'lucide-react';
import { db } from '../db';
import { 
  InspectionRecord, InspectionStatus, ShiftType, User, 
  InspectionItem, RectifyLog 
} from '../types';
import { SHIFTS, MOCK_TEMPLATES } from '../constants';
import VoiceInputButton from '../components/VoiceInputButton';
import ScannerModal from '../components/ScannerModal';
import NFCScannerModal from '../components/NFCScannerModal';
import { GoogleGenAI } from "@google/genai";

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
  const [showNFC, setShowNFC] = useState(false);
  
  // AI 诊断状态
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  
  // 签名相关
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [items, setItems] = useState<InspectionItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // AI 诊断逻辑
  const handleAiDiagnose = async (imageUrl: string) => {
    setIsAiAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // 去掉 data:image/png;base64, 前缀
      const base64Data = imageUrl.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "作为煤矿安全专家，请简要分析这张巡检现场照片。如果发现隐患（如漏液、损坏、违规存放等），请给出具体的隐患描述。如果没有发现明显问题，请回复'未发现明显异常'。字数在50字以内。" }
          ]
        }
      });
      
      const aiText = response.text || "AI 诊断未能返回结果";
      setRemark(prev => prev ? `${prev}\n[AI辅助诊断]: ${aiText}` : `[AI辅助诊断]: ${aiText}`);
      if (!aiText.includes("未发现明显异常")) {
        setOverallStatus(InspectionStatus.ABNORMAL);
      }
    } catch (error) {
      console.error("AI Diagnose error:", error);
      alert("AI 诊断暂时不可用，请手动输入。");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // 签名画布逻辑
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      canvasRef.current.getContext('2d')?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignatureData(null);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    setSignatureData(data);
    setShowSignaturePad(false);
  };

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

  const handleSave = async () => {
    if (!location.trim()) return alert('请输入巡检地点');
    if (!signatureData) return alert('请完成巡检员手写签名以符合合规要求');
    
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      location: location.trim(),
      locationCode: locationCode || ('LOC-' + Math.floor(Math.random() * 1000)),
      team: user.team,
      shift,
      inspector: user.username,
      timestamp: Date.now(),
      overallStatus,
      remark,
      items: mode === 'quick' ? [{ id: 'q1', name: '全项检查', result: overallStatus as any, photos: [], remark }] : items,
      signature: signatureData
    };

    db.saveInspection(newRecord);
    onSave();
    setIsSaving(false);
  };

  return (
    <div className="p-4 pb-48 space-y-6">
      {/* 模式切换 */}
      <div className="flex bg-gray-200 p-1 rounded-2xl shadow-inner dark:bg-gray-800">
        <button onClick={() => setMode('quick')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'quick' ? 'bg-white shadow-lg text-primary dark:bg-gray-700' : 'text-gray-500'}`}>快速模式</button>
        <button onClick={() => setMode('advanced')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === 'advanced' ? 'bg-white shadow-lg text-primary dark:bg-gray-700' : 'text-gray-500'}`}>高级模板</button>
      </div>

      {/* 地点信息 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-primary/10 transition-all dark:bg-gray-800 dark:text-white"
            placeholder="地点感应或手动输入..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* 快速模式内容 */}
      {mode === 'quick' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
             <div className="flex gap-4">
                <button onClick={() => setOverallStatus(InspectionStatus.NORMAL)} className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.NORMAL ? 'bg-green-50 border-green-500 dark:bg-green-500/10' : 'bg-gray-50 border-transparent opacity-40'}`}>
                  <CheckCircle size={32} className="text-green-600" />
                  <span className="font-black text-xs">正常</span>
                </button>
                <button onClick={() => setOverallStatus(InspectionStatus.ABNORMAL)} className={`flex-1 py-6 rounded-[1.5rem] flex flex-col items-center gap-2 border-4 transition-all ${overallStatus === InspectionStatus.ABNORMAL ? 'bg-red-50 border-red-500 dark:bg-red-500/10' : 'bg-gray-50 border-transparent opacity-40'}`}>
                  <AlertCircle size={32} className="text-red-600" />
                  <span className="font-black text-xs">异常</span>
                </button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">现场情况说明</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAiDiagnose(`https://picsum.photos/800/600?sig=${Math.random()}`)}
                  disabled={isAiAnalyzing}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  {isAiAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={12} />}
                  AI 智能诊断
                </button>
                <VoiceInputButton onResult={(t) => setRemark(p => p ? `${p}，${t}` : t)} />
              </div>
            </div>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none min-h-[120px] font-bold text-sm dark:bg-gray-800 dark:text-white border border-transparent focus:border-indigo-100 transition-all"
              placeholder="请输入或使用AI诊断、语音输入..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* 合规手写签名区 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <PenTool size={18} className="text-gray-400" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">巡检员手写电子签名 (合规项)</p>
          </div>
          {signatureData && (
            <button onClick={() => setShowSignaturePad(true)} className="text-[10px] font-black text-primary">重签</button>
          )}
        </div>
        
        {signatureData ? (
          <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center p-4 border border-dashed border-gray-200">
            <img src={signatureData} className="max-h-full max-w-full object-contain mix-blend-multiply dark:invert" alt="signature" />
          </div>
        ) : (
          <button 
            onClick={() => setShowSignaturePad(true)}
            className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary transition-colors"
          >
            <PenTool size={24} />
            <span className="text-xs font-bold">点击此处完成手写签名</span>
          </button>
        )}
      </div>

      {/* 签名模态框 */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-black text-gray-800">巡检责任确认签名</h4>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Electronic Signature Verification</p>
              </div>
              <button onClick={() => setShowSignaturePad(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            
            <div className="flex-1 bg-white relative">
              <canvas 
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full h-[300px] touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                <PenTool size={100} className="text-gray-400 rotate-12" />
              </div>
            </div>

            <div className="p-6 flex gap-4">
              <button onClick={clearCanvas} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                <Eraser size={16} /> 清除重写
              </button>
              <button onClick={saveSignature} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                <Check size={16} /> 确认并应用签名
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex flex-col gap-3 z-40 dark:bg-gray-900/80 dark:border-gray-800">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} strokeWidth={3} />}
          提交并完成合规存证
        </button>
        <button onClick={onCancel} className="w-full py-4 text-gray-400 font-black text-sm">取消返回</button>
      </div>
    </div>
  );
};

export default CreateInspectionScreen;
