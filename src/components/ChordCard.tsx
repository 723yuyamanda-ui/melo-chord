// src/components/ChordCard.tsx
import React from 'react';
import { Play, Pause } from 'lucide-react';

interface ChordCardProps {
  pattern: {
    id: string;
    title: string;
    description: string;
    categoryLabel: string;
    rawScore: number;
    tags: string[];
    chords: string[];
  };
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentKeyName: string;
  currentPlayback16th: number;
  bars: number; // ★ ここに bars を明示的に追加して型エラーを完全解消
}

export default function ChordCard({
  pattern, isPlaying, onTogglePlay, currentPlayback16th, bars
}: ChordCardProps) {

  const matchPercentage = React.useMemo(() => {
    const minScore = 60;
    const maxScore = 100;
    const clamped = Math.max(minScore, Math.min(maxScore, pattern.rawScore));
    return Math.floor(minScore + ((clamped - minScore) / (maxScore - minScore)) * 40);
  }, [pattern.rawScore]);

  // 現在再生中のスロット (0〜15) を計算
  const activeSlotIndex = React.useMemo(() => {
    if (!isPlaying || currentPlayback16th < 16) return -1;
    const adjustedStep = currentPlayback16th - 16;
    const slot = Math.floor(adjustedStep / 8);
    const maxSlots = bars === 4 ? 8 : 16;
    return slot >= 0 && slot < maxSlots ? slot : -1;
  }, [isPlaying, currentPlayback16th, bars]);

  // 4小節選択時は先頭8スロット、8小節選択時は全16スロットを表示
  const displaySlots = React.useMemo(() => {
    const targetLength = bars === 4 ? 8 : 16;
    return pattern.chords.slice(0, targetLength);
  }, [pattern.chords, bars]);

  return (
    <div className={`bg-gray-900/80 border rounded-xl p-4 shadow-md transition-all duration-300 ${
      isPlaying ? 'border-amber-500/50 bg-gradient-to-b from-gray-950 to-gray-900' : 'border-gray-800/80 hover:border-gray-700/80'
    } animate-in fade-in slide-in-from-bottom-3 duration-300`}>

      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-400 tracking-wider">{pattern.categoryLabel} ({bars}小節)</span>
        <span className="text-[11px] font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 bg-gray-950 px-2 py-0.5 rounded-md border border-teal-500/20">
          マッチ度 {matchPercentage}%
        </span>
      </div>

      <h3 className="text-base font-black text-white mb-1 tracking-tight truncate">
        {pattern.title}
      </h3>

      <p className="text-[11px] text-gray-300 font-medium mb-2.5 leading-snug">
        {pattern.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {pattern.tags.map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 font-medium rounded bg-gray-800/60 text-gray-400">#{tag}</span>
        ))}
      </div>

      {/* 4小節（4列×2段＝8スロット）/ 8小節（8列×2段＝16スロット）レスポンシブ・グリッド */}
      <div className={`grid gap-1 mb-3 ${bars === 4 ? 'grid-cols-4' : 'grid-cols-8'}`}>
        {displaySlots.map((chord, i) => {
          const isSlotActive = activeSlotIndex === i;

          return (
            <div
              key={i}
              className={`h-10 flex flex-col items-center justify-center rounded-md font-mono font-black text-[11px] transition-all duration-150 border ${
                isSlotActive
                  ? chord === '-'
                    ? 'bg-amber-500/30 border-amber-400/60 text-amber-300 scale-[1.03] shadow-[0_0_8px_rgba(245,158,11,0.4)] z-10'
                    : 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-300 text-gray-950 scale-[1.05] shadow-[0_0_10px_rgba(245,158,11,0.6)] z-10'
                  : chord === '-'
                    ? 'bg-gray-950/20 border-transparent text-gray-600'
                    : 'bg-gray-800/90 border-gray-700/60 text-yellow-400'
              }`}
            >
              <span className="tracking-tighter truncate w-full text-center px-0.5">
                {chord === '-' ? 'ー' : chord}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border ${
            isPlaying
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.05)]'
              : 'bg-gray-800/60 border border-gray-800/60 text-gray-300 hover:bg-gray-800'
          }`}
        >
          {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          <span>{isPlaying ? 'バンド演奏を停止' : 'メロディとバンド演奏を試聴'}</span>
        </button>
      </div>
    </div>
  );
}