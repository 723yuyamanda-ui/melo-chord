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
  bars: number;
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

  const activeSlotIndex = React.useMemo(() => {
    if (!isPlaying || currentPlayback16th < 16) return -1;
    const adjustedStep = currentPlayback16th - 16;
    const slot = Math.floor(adjustedStep / 8);
    const maxSlots = bars === 4 ? 8 : 16;
    return slot >= 0 && slot < maxSlots ? slot : -1;
  }, [isPlaying, currentPlayback16th, bars]);

  const displaySlots = React.useMemo(() => {
    const targetLength = bars === 4 ? 8 : 16;
    return pattern.chords.slice(0, targetLength);
  }, [pattern.chords, bars]);

  return (
    <div className={`bg-gray-900/90 border rounded-2xl p-4 lg:p-5 shadow-md transition-all duration-300 flex flex-col justify-between min-w-0 ${
      isPlaying ? 'border-amber-500/60 bg-gradient-to-b from-gray-950 to-gray-900 shadow-amber-500/10' : 'border-gray-800/80 hover:border-gray-700/80'
    } animate-in fade-in duration-200`}>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-400 tracking-wider whitespace-nowrap">{pattern.categoryLabel} ({bars}小節)</span>
          <span className="text-xs lg:text-sm font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 bg-gray-950 px-2.5 py-0.5 rounded-md border border-teal-500/20 whitespace-nowrap">
            マッチ度 {matchPercentage}%
          </span>
        </div>

        {/* 1. タイトル文字サイズ拡大 */}
        <h3 className="text-base lg:text-lg font-black text-white mb-1.5 tracking-tight truncate">
          {pattern.title}
        </h3>

        {/* 2. 説明文文字サイズ拡大 (text-[11px] -> text-xs lg:text-sm) */}
        <p className="text-xs lg:text-sm text-gray-300 font-medium mb-3.5 leading-relaxed line-clamp-2">
          {pattern.description}
        </p>

        {/* 3. ハッシュタグ文字サイズ拡大 */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {pattern.tags.map(tag => (
            <span key={tag} className="text-[10px] lg:text-xs px-2 py-0.5 font-medium rounded bg-gray-800/80 text-gray-300 whitespace-nowrap">#{tag}</span>
          ))}
        </div>

        {/* 4. コード表示スロット（フォントサイズ拡大） */}
        <div className={`grid gap-1 mb-4 ${bars === 4 ? 'grid-cols-4' : 'grid-cols-8'}`}>
          {displaySlots.map((chord, i) => {
            const isSlotActive = activeSlotIndex === i;

            return (
              <div
                key={i}
                className={`h-10 flex items-center justify-center rounded-md font-mono font-black text-xs lg:text-sm transition-all duration-150 border px-0.5 ${
                  isSlotActive
                    ? chord === '-'
                      ? 'bg-amber-500/30 border-amber-400/60 text-amber-300 scale-[1.03] shadow-[0_0_8px_rgba(245,158,11,0.4)] z-10'
                      : 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-300 text-gray-950 scale-[1.05] shadow-[0_0_10px_rgba(245,158,11,0.6)] z-10'
                    : chord === '-'
                      ? 'bg-gray-950/20 border-transparent text-gray-600'
                      : 'bg-gray-800/90 border-gray-700/60 text-yellow-400'
                }`}
              >
                <span className="tracking-tighter truncate w-full text-center">
                  {chord === '-' ? 'ー' : chord}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 試聴ボタン文字サイズ拡大 */}
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
        className={`w-full py-3 rounded-xl font-bold text-xs lg:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border whitespace-nowrap ${
          isPlaying
            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400 font-black shadow-[0_0_12px_rgba(245,158,11,0.05)]'
            : 'bg-gray-800/60 border border-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        <span>{isPlaying ? '演奏を停止' : 'メロディと演奏を試聴'}</span>
      </button>
    </div>
  );
}