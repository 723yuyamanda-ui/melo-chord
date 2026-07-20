// src/components/ChordCard.tsx
import React, { useState } from 'react';
import { Play, Pause, Sparkles } from 'lucide-react';
import { AI_REVIEWS_MASTER } from '../constants/aiReviews';

interface ChordCardProps {
  pattern: {
    id: string;
    title: string;
    genre: string;
    rawScore: number;
    tags: string[];
    description: string;
    chords: string[];
  };
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentKeyName: string;
  currentPlayback16th: number;
  startBarSelection: number;
}

export default function ChordCard({ 
  pattern, isPlaying, onTogglePlay, currentKeyName, currentPlayback16th, startBarSelection 
}: ChordCardProps) {
  const [showAiReview, setShowAiReview] = useState<boolean>(false);

  const matchPercentage = React.useMemo(() => {
    const minScore = 60;   
    const maxScore = 100;
    const clamped = Math.max(minScore, Math.min(maxScore, pattern.rawScore));
    return Math.floor(minScore + ((clamped - minScore) / (maxScore - minScore)) * 40);
  }, [pattern.rawScore]);

  const currentChordSlot = Math.floor(currentPlayback16th / 8);

  const handleToggleReview = () => {
    setShowAiReview(prev => !prev);
  };

  const reviewText = React.useMemo(() => {
    const pureKeyRoot = currentKeyName.replace(" Major", "");
    const generator = AI_REVIEWS_MASTER[pattern.id];
    if (generator) return generator(pureKeyRoot);
    return `${currentKeyName}の響きが共鳴しています。`;
  }, [pattern.id, currentKeyName]);

  return (
    <div className={`bg-gray-900/80 border rounded-xl p-4 shadow-md transition-all duration-300 ${
      isPlaying ? 'border-amber-500/50 bg-gradient-to-b from-gray-950 to-gray-900' : 'border-gray-800/80 hover:border-gray-700/80'
    } animate-in fade-in slide-in-from-bottom-3 duration-300`}>
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-400 tracking-wider">{pattern.genre}</span>
        <span className="text-[11px] font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 bg-gray-950 px-2 py-0.5 rounded-md border border-teal-500/20">
          マッチ度 {matchPercentage}%
        </span>
      </div>

      <h3 className="text-base font-black text-white mb-1.5 tracking-tight flex items-center justify-between gap-2">
        <span className="truncate">{pattern.title}</span>
        {/* ★ 「AIに世界観を聞く」ボタンをコンパクト化してコード表示の横スペースを確保 */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleToggleReview(); }}
          className={`px-1.5 py-1 rounded-md text-[9px] font-black flex items-center gap-1 border transition-all shrink-0 ${
            showAiReview 
              ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' 
              : 'bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-purple-400'
          }`}
        >
          <Sparkles size={9} />
          <span>{showAiReview ? '閉じる' : '世界観'}</span>
        </button>
      </h3>

      <div className="flex flex-wrap gap-1 mb-3">
        {pattern.tags.map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 font-medium rounded bg-gray-800/60 text-gray-400">#{tag}</span>
        ))}
      </div>

      {showAiReview && (
        <div className="mb-3 p-3 rounded-lg bg-gradient-to-b from-purple-950/30 to-indigo-950/20 border border-purple-500/30 text-[11px] leading-relaxed text-purple-200/90 font-medium animate-in zoom-in-95 duration-200 shadow-inner">
          <p className="font-bold text-purple-400 mb-1 text-[9px] flex items-center gap-1 tracking-wider">
            <Sparkles size={10} /> GEMINI AI ANALYZER:
          </p>
          {reviewText}
        </div>
      )}

      {/* 4列×2段のグリッドレイアウト */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {pattern.chords.map((chord, i) => {
          const isNotePlaying = isPlaying && currentChordSlot === i;
          return (
            <div 
              key={i} 
              className={`h-11 flex flex-col items-center justify-center rounded-lg font-mono font-black text-xs transition-all duration-150 border ${
                chord === '-' 
                  ? 'bg-gray-950/20 border-transparent text-gray-700' 
                  : isNotePlaying
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-300 text-gray-950 scale-[1.03] shadow-[0_0_10px_rgba(245,158,11,0.6)] z-10'
                    : 'bg-gray-800/90 border-gray-700/60 text-yellow-400'
              }`}
            >
              {/* ★ コードネーム自体を一回り大きく（text-xs → text-[15px]）表示調整 */}
              <span className={`tracking-tight ${chord !== '-' ? 'text-[15px]' : 'text-xs'}`}>
                {chord === '-' ? 'ー' : chord}
              </span>
              <span className={`text-[7px] font-sans font-medium mt-0.5 ${isNotePlaying ? 'text-gray-900/80' : 'text-gray-500'}`}>
                {i + 1}m
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