// src/components/AutoChordModal.tsx
import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { NoteData } from '../types';
import { PREDEFINED_PATTERNS, generateAutoChords } from '../utils/harmonizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  melodyGrid: NoteData[];
  bars: number;
  chords: string[];
  setChords: (chords: string[]) => void;
}

export default function AutoChordModal({ isOpen, onClose, melodyGrid, bars, chords, setChords }: Props) {
  const [generatedPatterns, setGeneratedPatterns] = useState<string[][]>([]);
  const [selectedGenreLabel, setSelectedGenreLabel] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = (genreKey: string) => {
    // 選択したジャンルの5パターンを取得
    const result = generateAutoChords(melodyGrid, genreKey, bars);
    setGeneratedPatterns(result.patterns);
    setSelectedGenreLabel(result.label);
    
    // パターン1をデフォルトとして即座に反映（試聴の開始）
    if (result.patterns.length > 0) {
      setChords(result.patterns[0]);
    }
  };

  const handleClose = () => {
    setGeneratedPatterns([]);
    setSelectedGenreLabel('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-gray-800 border border-gray-600 p-5 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {generatedPatterns.length === 0 ? (
          <>
            <div className="text-center text-white font-bold text-lg mb-1 flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-teal-400" /> コード進行を提案
            </div>
            <p className="text-center text-gray-400 text-xs mb-5">
              作りたい曲の雰囲気（ジャンル）を選ぶと、<br/>最適化された5つのパターンを提案します。
            </p>
            
            <div className="grid gap-3">
              {Object.entries(PREDEFINED_PATTERNS).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => handleGenerate(key)}
                  className="flex flex-col items-start px-4 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  <span className="font-bold text-blue-300 text-sm">{config.label}</span>
                  <span className="text-[10px] text-gray-400 mt-1">{config.desc}</span>
                </button>
              ))}
            </div>
            
            <button 
              className="w-full mt-5 text-xs font-bold bg-gray-900/50 hover:bg-red-900/50 text-gray-400 hover:text-red-300 py-3 rounded-xl transition-colors"
              onClick={handleClose}
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <div className="text-center text-white font-bold mb-4 flex flex-col items-center justify-center gap-1">
              <span>{selectedGenreLabel}</span>
              <span className="text-[10px] text-teal-400 font-normal">
                タップして響きを聴き比べてみましょう
              </span>
            </div>
            
            <div className="grid gap-2 mb-5 max-h-[45vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-transparent">
              {generatedPatterns.map((pattern, idx) => {
                const isSelected = JSON.stringify(pattern) === JSON.stringify(chords);
                return (
                  <button 
                    key={idx}
                    // タップした瞬間に state の chords を書き換え、即座に試聴可能にする
                    onClick={() => setChords(pattern)}
                    className={`flex items-center justify-between px-4 py-3 border rounded-xl transition-all active:scale-95 ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-bold text-sm mb-1.5">パターン {idx + 1}</span>
                      <div className="flex flex-wrap gap-1">
                        {pattern.map((c, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c === '-' ? 'text-gray-500' : 'bg-gray-800 text-gray-200'}`}>
                            {c === '-' ? 'ー' : c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isSelected && <Check size={20} className="text-blue-400 shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 text-xs font-bold bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl transition-colors"
                onClick={() => setGeneratedPatterns([])} 
              >
                選び直す
              </button>
              <button 
                className="flex-[2] text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors shadow-lg"
                onClick={handleClose} 
              >
                この進行に決定
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}