
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onResult, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // 井下短语音为主，自动结束更适合单手操作
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        onResult(transcript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleListening(); }}
      className={`relative flex items-center justify-center p-3 rounded-xl transition-all active:scale-90 ${
        isListening 
        ? 'bg-red-500 text-white shadow-lg shadow-red-200 ring-4 ring-red-100' 
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${className}`}
      title={isListening ? "停止录音" : "语音输入"}
    >
      {isListening ? (
        <div className="flex items-center gap-1">
          <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      ) : (
        <Mic size={18} />
      )}
      
      {isListening && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          正在倾听... 请说话
        </div>
      )}
    </button>
  );
};

export default VoiceInputButton;
