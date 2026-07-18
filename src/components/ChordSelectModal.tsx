import React from 'react';
import { transposeString } from '../constants/music';

interface Props {
  showIndex: number | null;
  onClose: () => void;
  chords: string[];
  setChords: (chords: string[]) => void;
  transpose: number;
}

const CHORD_OPTIONS = ['C', 'C/E', 'Dm', 'Em', 'F', 'G', 'G/B', 'Am', 'Am7', 'FM7', 'CM7', 'E7', 'Csus4', 'Cadd9', '-'];

export default function ChordSelectModal({ showIndex, onClose, chords, setChords, transpose }: Props) {
  if (showIndex === null) return null;

  const handleSelect = (opt: string) => {
    const next = [...chords];
    next[showIndex] = opt;
    setChords(next);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-600 p-4 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="text-center text-gray-300 text-sm font-bold mb-4">コードを選択</div>
        <div className="grid grid-cols-3 gap-2">
          {CHORD_OPTIONS.map(opt => (
            <button 
              key={opt} 
              className={`px-1 py-2 text-xs font-bold rounded-lg transition-colors active:scale-95 ${chords[showIndex] === opt ? 'bg-blue-600 text-white shadow-inner' : 'bg-gray-700 text-gray-200 hover:bg-gray-600 shadow'}`}
              onClick={() => handleSelect(opt)}
            >
              {opt === '-' ? 'タイ(-)' : transposeString(opt, transpose)}
            </button>
          ))}
        </div>
        <button className="w-full mt-4 text-xs font-bold bg-red-900/50 hover:bg-red-900/80 text-red-300 py-2.5 rounded-lg transition-colors" onClick={onClose}>キャンセルして閉じる</button>
      </div>
    </div>
  );
}