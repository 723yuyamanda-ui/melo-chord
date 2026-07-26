// src/components/PresetListPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronRight, Music } from 'lucide-react';
import { PRESET_MELODIES, PresetMelody } from '../constants/presets';
import * as Tone from 'tone';

export default function PresetListPage() {
  const navigate = useNavigate();

  const handleSelectPreset = async (preset: PresetMelody) => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        await Tone.context.resume();
      }
    } catch (e) {
      console.error(e);
    }

    navigate('/suggest', {
      state: {
        melodyGrid: preset.notes,
        currentMelodyId: null,
        presetTitle: preset.title,
        bpm: preset.bpm,
        bars: preset.bars,
        manualTranspose: 0,
        isFromPreset: true
      }
    });
  };

  return (
    <div className="h-[100dvh] lg:h-full w-full flex flex-col bg-gray-950 text-white select-none relative overflow-hidden">
      
      {/* ヘッダー */}
      <header className="px-4 lg:px-8 py-3.5 border-b border-gray-900 bg-gray-950/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <button 
          onClick={() => navigate('/')} 
          className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" />
          <span className="font-black text-sm lg:text-base bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
            デモ曲で試す
          </span>
        </div>
        <div className="w-8" />
      </header>

      {/* サブリード文章 */}
      <div className="p-4 lg:p-6 bg-gray-900/30 border-b border-gray-900/50 shrink-0">
        <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed text-center">
          管理人が作ったフレーズを選んで、<br className="hidden lg:inline" />いろんなコード進行の響きを聴き比べてみましょう！
        </p>
      </div>

      {/* デモ曲リスト (PC時: 2〜3列のレスポンシブグリッド) */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-3 scrollbar-none pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 lg:gap-4">
          {PRESET_MELODIES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="p-5 bg-gray-900/80 border border-gray-800/80 hover:border-teal-500/50 rounded-2xl cursor-pointer transition-all active:scale-[0.98] shadow-md hover:shadow-teal-500/10 group flex flex-col gap-3 justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-400 tracking-wider uppercase bg-teal-950/50 px-2.5 py-0.5 rounded border border-teal-500/20">
                    {preset.category === 'Chorus' ? 'サビ向け' : preset.category === 'Chill' ? 'アーバン・チル' : 'A/Bメロ向け'} ({preset.bars}小節)
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-mono font-bold">
                    <Music size={12} className="text-gray-600" />
                    <span>BPM {preset.bpm}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white group-hover:text-teal-300 transition-colors">
                    {preset.title}
                  </h3>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>

                <p className="text-xs text-gray-400 font-medium leading-normal line-clamp-2">
                  {preset.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}