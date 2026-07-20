// src/components/InputSelectPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function InputSelectPage() {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full flex flex-col p-6 bg-gray-950 text-white">
      <button onClick={() => navigate('/')} className="self-start mb-6 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={18} />
      </button>
      <h2 className="text-lg font-bold mb-6 text-center tracking-tight">メロディはどう入力しますか？</h2>
      
      <div className="flex flex-col gap-3.5">
        <button onClick={() => navigate('/input-simple')} className="p-4 bg-gradient-to-r from-blue-950 to-indigo-950 rounded-xl border border-blue-800 text-left active:scale-95 transition-all">
          <div className="font-bold text-blue-300 text-sm">🎹 かんたん鍵盤入力 (おすすめ)</div>
          <div className="text-[11px] text-gray-400 mt-1">大きな鍵盤を押して直感的に入力します。</div>
        </button>
        <button onClick={() => navigate('/input-simple')} className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left active:scale-95 transition-all">
          <div className="font-bold text-gray-200 text-sm">🎼 ドレミ入力</div>
          <div className="text-[11px] text-gray-400 mt-1">ド・レ・ミの文字を押して入力します。（初心者向け）</div>
        </button>
        <button onClick={() => navigate('/editor')} className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left active:scale-95 transition-all">
          <div className="font-bold text-gray-300 text-sm">🎵 MIDI編集</div>
          <div className="text-[11px] text-gray-500 mt-1">ピアノロールで細かくグリッド入力・修正をしたい方向け</div>
        </button>
      </div>
    </div>
  );
}