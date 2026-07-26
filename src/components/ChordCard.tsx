// src/components/ChordCard.tsx
import React from 'react';
import { Play, Pause, Crown, BookOpen, GlassWater, Sparkles } from 'lucide-react';

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

  // マッチ度（スコア）計算
  const matchPercentage = React.useMemo(() => {
    const minScore = 60;
    const maxScore = 100;
    const clamped = Math.max(minScore, Math.min(maxScore, pattern.rawScore));
    return Math.floor(minScore + ((clamped - minScore) / (maxScore - minScore)) * 40);
  }, [pattern.rawScore]);

  // 現在再生中のコードスロット位置
  const activeSlotIndex = React.useMemo(() => {
    if (!isPlaying || currentPlayback16th < 16) return -1;
    const adjustedStep = currentPlayback16th - 16;
    const slot = Math.floor(adjustedStep / 8);
    const maxSlots = bars === 4 ? 8 : 16;
    return slot >= 0 && slot < maxSlots ? slot : -1;
  }, [isPlaying, currentPlayback16th, bars]);

  // 小節数に応じたスロット抽出
  const displaySlots = React.useMemo(() => {
    const targetLength = bars === 4 ? 8 : 16;
    return pattern.chords.slice(0, targetLength);
  }, [pattern.chords, bars]);

  // カテゴリに応じたLucideアイコンの判定
  const CategoryIcon = React.useMemo(() => {
    if (pattern.categoryLabel.includes('サビ')) return Crown;
    if (pattern.categoryLabel.includes('A/Bメロ')) return BookOpen;
    if (pattern.categoryLabel.includes('Chill')) return GlassWater;
    return Sparkles;
  }, [pattern.categoryLabel]);

  return (
    <div
      className={`bg-gray-900/60 backdrop-blur-xl border rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-xl transition-all duration-300 flex flex-col justify-between min-w-0 ${
        isPlaying
          ? 'border-amber-500/60 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-amber-950/20 shadow-amber-500/10 shadow-2xl ring-1 ring-amber-500/30'
          : 'border-white/10 hover:border-gray-700/80 hover:bg-gray-900/80'
      } animate-in fade-in duration-200`}
    >
      <div>
        {/* ヘッダー情報（カテゴリラベル ＆ マッチ度バッジ） */}
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide whitespace-nowrap">
            <CategoryIcon size={14} className={isPlaying ? 'text-amber-400' : 'text-teal-400'} />
            <span>{pattern.categoryLabel} ({bars}小節)</span>
          </div>

          <span className="text-xs lg:text-sm font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 bg-gray-950/80 px-2.5 py-0.5 rounded-full border border-teal-500/30 whitespace-nowrap shadow-inner">
            マッチ度 {matchPercentage}%
          </span>
        </div>

        {/* 1. タイトル */}
        <h3 className="text-base lg:text-lg font-black text-white mb-1.5 tracking-tight truncate">
          {pattern.title}
        </h3>

        {/* 2. 説明文 */}
        <p className="text-xs lg:text-sm text-gray-300 font-medium mb-3.5 leading-relaxed line-clamp-2">
          {pattern.description}
        </p>

        {/* 3. ハッシュタグ */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pattern.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] lg:text-xs px-2.5 py-0.5 font-medium rounded-full bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 4. コード表示スロット */}
        <div className={`grid gap-1.5 mb-4 ${bars === 4 ? 'grid-cols-4' : 'grid-cols-8'}`}>
          {displaySlots.map((chord, i) => {
            const isSlotActive = activeSlotIndex === i;

            return (
              <div
                key={i}
                className={`h-10 lg:h-11 flex items-center justify-center rounded-xl font-mono font-black text-xs lg:text-sm transition-all duration-150 border px-0.5 ${
                  isSlotActive
                    ? chord === '-'
                      ? 'bg-amber-500/30 border-amber-400/60 text-amber-300 scale-[1.03] shadow-[0_0_10px_rgba(245,158,11,0.4)] z-10'
                      : 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-300 text-gray-950 scale-[1.05] shadow-[0_0_12px_rgba(245,158,11,0.6)] z-10'
                    : chord === '-'
                      ? 'bg-gray-950/30 border-transparent text-gray-600'
                      : 'bg-gray-800/80 border-gray-700/50 text-amber-300'
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

      {/* 5. 試聴ボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
        className={`w-full py-3 rounded-xl lg:rounded-2xl font-bold text-xs lg:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border whitespace-nowrap ${
          isPlaying
            ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-amber-500/50 text-amber-300 font-black shadow-lg shadow-amber-500/10'
            : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white hover:border-white/20'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause size={15} fill="currentColor" className="animate-pulse text-amber-400" />
            <span>演奏を停止</span>
          </>
        ) : (
          <>
            <Play size={15} fill="currentColor" className="text-teal-400" />
            <span>メロディと演奏を試聴</span>
          </>
        )}
      </button>
    </div>
  );
}