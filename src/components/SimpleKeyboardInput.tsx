// src/components/SimpleKeyboardInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Trash2, Play, Square, Save, FolderHeart, X, 
  Music, ChevronLeft, ChevronRight, FastForward, Clock, Volume2 
} from 'lucide-react';
import { NoteData, SavedMelodyItem } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getNoteNameFromMidi, ALL_NOTES } from '../constants/music';
import { detectBestKey } from '../lib/chordEngine';
import * as Tone from 'tone';

const SLIDABLE_PIANO_KEYS = [
  { label: 'ド', octave: 3, offset: 0, type: '低', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 3, offset: 2, type: '低', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 3, offset: 4, type: '低', hasBlack: false },
  { label: 'ファ', octave: 3, offset: 5, type: '低', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 3, offset: 7, type: '低', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 3, offset: 9, type: '低', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 3, offset: 11, type: '低', hasBlack: false },

  { label: 'ド', octave: 4, offset: 0, type: '主', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 4, offset: 2, type: '主', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 4, offset: 4, type: '主', hasBlack: false },
  { label: 'ファ', octave: 4, offset: 5, type: '主', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 4, offset: 7, type: '主', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 4, offset: 9, type: '主', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 4, offset: 11, type: '主', hasBlack: false },

  { label: 'ド', octave: 5, offset: 0, type: '高', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 5, offset: 2, type: '高', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 5, offset: 4, type: '高', hasBlack: false },
  { label: 'ファ', octave: 5, offset: 5, type: '高', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 5, offset: 7, type: '高', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 5, offset: 9, type: '高', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 5, offset: 11, type: '高', hasBlack: false },
  
  { label: 'ド', octave: 6, offset: 0, type: '高', hasBlack: false }
];

const convertMidiToDoremi = (midi: number): string => {
  if (midi === 0) return '休';
  const noteNames = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ファ', 'ファ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'];
  const octaveNum = Math.floor(midi / 12) - 1;
  let prefix = '';
  if (octaveNum === 3) prefix = '低';
  if (octaveNum === 5) prefix = '高';
  if (octaveNum === 6) prefix = '最高';
  return `${prefix}${noteNames[midi % 12]}`;
};

export default function SimpleKeyboardInput() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { playSingleNote, startMelodyPreview, stopPlayback, isPlaying, initAudio, isReady, isLoading } = useAudioPlayer();
  
  const [selectedBars, setSelectedBars] = useState<4 | 8>(() => location.state?.bars || 4);
  const maxAllowedStep = selectedBars === 4 ? 80 : 144; 

  const [gridMode, setGridMode] = useState<'8n' | '16n'>('8n');
  const stepIncrement = gridMode === '8n' ? 2 : 1;

  const [melodyGrid, setMelodyGrid] = useState<NoteData[]>(() => location.state?.melodyGrid || []);
  const [manualTranspose, setManualTranspose] = useState<number>(() => location.state?.manualTranspose || 0);

  const hasPickupNotes = React.useMemo(() => {
    return melodyGrid.some(note => note.col < 16 && note.midiNote !== 0);
  }, [melodyGrid]);

  const [startBarSelection, setStartBarSelection] = useState<number>(() => hasPickupNotes ? 0 : 16);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (melodyGrid.length === 0) return 16; 
    const lastNote = melodyGrid.reduce((max, note) => note.col > max.col ? note : max, melodyGrid[0]);
    return Math.min(maxAllowedStep - 1, lastNote.col + lastNote.duration);
  });

  const [bpm, setBpm] = useState<number>(() => location.state?.bpm || 110);
  const [activePlayStep, setActivePlayStep] = useState<number | null>(null);
  const [isRecordMode, setIsRecordMode] = useState<boolean>(true); 

  const [currentMelodyId, setCurrentMelodyId] = useState<string | null>(() => location.state?.currentMelodyId || null);
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const monitorRef = useRef<HTMLDivElement>(null);

  const currentDisplayKeyName = React.useMemo(() => {
    const rawNotes = melodyGrid.filter(n => n.midiNote !== 0);
    if (rawNotes.length === 0) return 'C';
    const baseKeyIdx = detectBestKey(rawNotes);
    let finalKeyIdx = (baseKeyIdx + manualTranspose) % 12;
    if (finalKeyIdx < 0) finalKeyIdx += 12;
    return ALL_NOTES[finalKeyIdx];
  }, [melodyGrid, manualTranspose]);

  useEffect(() => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); }
    }
    if (!isReady && !isLoading) initAudio();
    return () => { stopPlayback(); };
  }, [isReady, isLoading]);

  useEffect(() => {
    if (currentStep >= maxAllowedStep) {
      setCurrentStep(maxAllowedStep - 1);
    }
  }, [selectedBars, maxAllowedStep]);

  useEffect(() => {
    if (monitorRef.current) {
      const targetStep = isPlaying && activePlayStep !== null ? activePlayStep : currentStep;
      const cellWidth = 36; 
      const scrollPosition = targetStep * (cellWidth + 4); 
      const containerWidth = monitorRef.current.clientWidth;
      
      monitorRef.current.scrollTo({
        left: scrollPosition - (containerWidth / 2) + (cellWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [currentStep, activePlayStep, isPlaying]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // 1. スライド機能（ナッジ：全体を1マスずつ動かす）
  const handleNudge = (direction: 'left' | 'right') => {
    if (isPlaying || melodyGrid.length === 0) return;
    const offset = direction === 'left' ? -1 : 1;
    if (direction === 'left' && melodyGrid.some(n => n.col === 0)) return;
    if (direction === 'right' && melodyGrid.some(n => n.col + n.duration >= maxAllowedStep)) return;

    setMelodyGrid(prev => prev.map(n => ({ ...n, col: n.col + offset })));
    setCurrentStep(prev => Math.max(0, Math.min(maxAllowedStep - 1, prev + offset)));
    showToast(`全体を${direction === 'left' ? '前' : '後ろ'}にシフトしました`);
  };

  // 2. スマート・スキップ（休符挿入）
  const handleSkip = () => {
    if (isPlaying || !isRecordMode) return;

    const step = stepIncrement;
    const noteAtCursor = melodyGrid.find(n => n.col === currentStep);
    const insertionPoint = noteAtCursor 
      ? noteAtCursor.col + noteAtCursor.duration 
      : currentStep;

    setMelodyGrid(prev => {
      const nextGrid = prev.map(n => {
        if (n.col >= insertionPoint) {
          return { ...n, col: n.col + step };
        }
        return n;
      });
      return nextGrid.filter(n => n.col < maxAllowedStep).sort((a, b) => a.col - b.col);
    });

    setCurrentStep(insertionPoint + step);
    showToast(`休符を挿入しました`);
  };

  // 3. タイムラインクリック
  const handleTimelineGridClick = (targetStep: number) => {
    if (isPlaying || targetStep >= maxAllowedStep) return;
    setCurrentStep(targetStep);
  };

  // 4. 鍵盤入力
  const handleInputNote = async (offset: number, keyOctave: number) => {
    if (isPlaying) return;
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }
    const midiNote = (keyOctave + 1) * 12 + offset;
    await playSingleNote(getNoteNameFromMidi(midiNote));
    if (!isRecordMode || currentStep >= maxAllowedStep) return;

    const step = stepIncrement;
    setMelodyGrid(prev => {
      const shiftedGrid = prev.map(n => {
        if (n.col >= currentStep) return { ...n, col: n.col + step };
        return n;
      });
      return [...shiftedGrid, { midiNote, col: currentStep, duration: step }]
        .filter(n => n.col < maxAllowedStep)
        .sort((a,b) => a.col - b.col);
    });
    setCurrentStep(prev => Math.min(maxAllowedStep - 1, prev + step));
  };

  // 5. 消去/戻る機能
  const handleClearLast = () => {
    if (isPlaying || !isRecordMode) return;
    
    const existingNote = melodyGrid.find(n => n.col === currentStep);

    if (existingNote) {
      const durationToShift = existingNote.duration;
      setMelodyGrid(prev => {
        const filtered = prev.filter(n => n.col !== currentStep);
        return filtered.map(n => {
          if (n.col > currentStep) return { ...n, col: n.col - durationToShift };
          return n;
        }).sort((a, b) => a.col - b.col);
      });
      showToast("音を削除しました");
    } else {
      setMelodyGrid(prev => {
        const nextGrid = prev.map(n => {
          if (n.col > currentStep) {
            return { ...n, col: n.col - 1 };
          }
          return n;
        });
        return nextGrid.filter(n => n.col >= 0).sort((a, b) => a.col - b.col);
      });
      showToast("隙間を詰めました");
    }
  };

  const toggleBpm = () => {
    setBpm(prev => {
      if (prev === 85) return 110;
      if (prev === 110) return 135;
      if (prev === 135) return 160;
      return 85;
    });
  };

  const handleTogglePreview = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }
    if (isPlaying) { stopPlayback(); setActivePlayStep(null); } 
    else { await startMelodyPreview(melodyGrid, maxAllowedStep, bpm, (step) => { setActivePlayStep(step); }, startBarSelection); }
  };

  const handleNavigateToSuggest = () => {
    stopPlayback();
    navigate('/suggest', { 
      state: { 
        melodyGrid, 
        currentMelodyId, 
        bpm, 
        bars: selectedBars, 
        manualTranspose: 0
      } 
    });
  };

  const executeSave = (type: 'overwrite' | 'new') => {
    const nameToSave = inputName.trim().slice(0, 10) || `メロディ #${savedMelodies.length + 1}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let nextList = [...savedMelodies];
    if (type === 'overwrite' && currentMelodyId) {
      nextList = nextList.map(item => item.id === currentMelodyId ? { ...item, title: nameToSave, melodyGrid, bpm, savedAt: formattedDate } : item);
      showToast(`「${nameToSave}」を上書き保存しました`);
    } else {
      const newId = `melo-${Date.now()}`;
      const newItem: SavedMelodyItem = { id: newId, title: nameToSave, melodyGrid, bpm, savedAt: formattedDate };
      nextList = [newItem, ...nextList];
      setCurrentMelodyId(newId);
      showToast(`「${nameToSave}」を新規保存しました`);
    }

    setSavedMelodies(nextList);
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList));
    setIsSaveModalOpen(false);
  };

  const handleLoadMelody = (item: SavedMelodyItem) => {
    stopPlayback();
    setMelodyGrid(item.melodyGrid);
    setCurrentMelodyId(item.id);
    if (item.bpm) setBpm(item.bpm);
    const lastNote = item.melodyGrid.reduce((max, note) => note.col > max.col ? note : max, item.melodyGrid[0] || { col: 16, duration: 2 });
    setCurrentStep(Math.min(maxAllowedStep - 1, lastNote.col + lastNote.duration));
    setIsListOpen(false);
  };

  const activeSoundNoteCount = melodyGrid.filter(n => n.midiNote !== 0).length;

  return (
    <div className="h-full w-full flex flex-col bg-gray-950 text-white select-none relative overflow-hidden px-4">
      {toast && <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[110] bg-teal-500 text-gray-950 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">{toast}</div>}

      {/* ヘッダー */}
      <div className="border-b border-gray-900 flex items-center justify-between py-2 shrink-0">
        <button onClick={() => { stopPlayback(); navigate('/'); }} className="text-gray-400 hover:text-white"><ArrowLeft size={18} /></button>
        
        <div className="flex bg-gray-900 p-0.5 rounded-xl border border-gray-800">
          <button onClick={() => setSelectedBars(4)} className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${selectedBars === 4 ? 'bg-teal-500 text-gray-950 shadow-md' : 'text-gray-400 hover:text-white'}`}>4小節</button>
          <button onClick={() => setSelectedBars(8)} className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${selectedBars === 8 ? 'bg-teal-500 text-gray-950 shadow-md' : 'text-gray-400 hover:text-white'}`}>8小節</button>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => { if (melodyGrid.length === 0) return; setInputName(savedMelodies.find(m => m.id === currentMelodyId)?.title || `メロディ #${savedMelodies.length + 1}`); setIsSaveModalOpen(true); }} className="flex flex-col items-center justify-center gap-0.5 text-blue-400 active:scale-95">
            <div className="w-7 h-7 flex items-center justify-center bg-gray-900 rounded-xl"><Save size={13} /></div>
            <span className="text-[8px] font-black uppercase">保存</span>
          </button>
          <button onClick={() => setIsListOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-teal-400 active:scale-95 relative">
            <div className="w-7 h-7 flex items-center justify-center bg-gray-900 rounded-xl"><FolderHeart size={13} /></div>
            <span className="text-[8px] font-black uppercase">一覧</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-start gap-3 overflow-hidden pt-2">
        
        {/* タイムライン */}
        <div className="w-full bg-gray-900 border border-gray-800 p-3 rounded-xl h-[142px] flex flex-col relative shrink-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-[10px] text-gray-500 font-bold truncate uppercase tracking-widest">
                {currentMelodyId ? savedMelodies.find(m=>m.id===currentMelodyId)?.title : 'Timeline'}
              </span>
              <span className="text-[9px] font-mono font-black text-teal-400 bg-gray-950 px-1.5 py-0.5 rounded border border-teal-500/30">
                Key: {currentDisplayKeyName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 全体ずらし（ナッジ） */}
              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
                <button onClick={() => handleNudge('left')} className="p-1 text-gray-400 hover:text-white"><ChevronLeft size={14}/></button>
                <span className="text-[8px] font-black text-gray-500">全体ずらし</span>
                <button onClick={() => handleNudge('right')} className="p-1 text-gray-400 hover:text-white"><ChevronRight size={14}/></button>
              </div>

              <select value={startBarSelection} onChange={(e) => setStartBarSelection(Number(e.target.value))} className="bg-gray-900 text-teal-400 font-mono font-black text-xs py-1 px-1 rounded border border-gray-800">
                <option value={0}>Pickup</option>
                <option value={16}>1小節</option>
                <option value={48}>3小節</option>
                {selectedBars === 8 && <option value={80}>5小節</option>}
              </select>
            </div>
          </div>

          <div ref={monitorRef} className="flex-1 flex items-center gap-1 overflow-x-auto w-full px-1 scrollbar-none relative scroll-smooth pt-6 pb-1">
            {Array.from({ length: 144 }).map((_, stepCol) => {
              const found = melodyGrid.find(n => n.col === stepCol);
              const isNowPlaying = activePlayStep === stepCol && isPlaying;
              const isSelectedStep = stepCol === currentStep && isRecordMode;
              const isPickupArea = stepCol < 16;
              const isMeasureStart = stepCol % 16 === 0;
              const isDisabledStep = stepCol >= maxAllowedStep;

              return (
                <div key={stepCol} className={`flex-shrink-0 relative ${isMeasureStart ? 'ml-1.5 border-l-2 border-dashed border-gray-700 pl-1' : ''}`}>
                  {isMeasureStart && (
                    <span className={`absolute -top-5.5 left-0.5 text-[8px] font-mono font-bold ${isDisabledStep ? 'text-gray-800' : isPickupArea ? 'text-purple-500' : 'text-gray-500'}`}>
                      {isPickupArea ? 'P' : `${Math.floor((stepCol-16)/16)+1}`}
                    </span>
                  )}
                  <div 
                    onClick={() => handleTimelineGridClick(stepCol)}
                    className={`w-9 h-11 rounded-lg flex items-center justify-center font-black text-[12px] transition-all duration-75 ${
                    isDisabledStep ? 'bg-gray-950 opacity-20' 
                    : isNowPlaying ? 'bg-yellow-400 text-black scale-110 z-20 shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
                    : isSelectedStep ? 'bg-gray-950 border-2 border-teal-400 text-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.4)]' 
                    : found ? (isPickupArea ? 'bg-purple-600/30 border border-purple-500 text-purple-200' : 'bg-blue-600/30 border border-blue-500 text-blue-200')
                    : 'bg-gray-950 border border-gray-900 text-gray-800 hover:border-gray-700'
                  }`}>
                    {isDisabledStep ? '' : found ? convertMidiToDoremi(found.midiNote) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ステップ操作バー（4列レイアウト：歩幅 / 休符 / 消去 / BPM） */}
        <div className="w-full shrink-0 grid grid-cols-4 gap-2 p-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
          {/* 1. 歩幅切り替え */}
          <div className="flex bg-gray-950 p-0.5 rounded-lg border border-gray-800">
            <button onClick={() => setGridMode('8n')} className={`flex-1 py-1 text-[9px] font-black rounded ${gridMode === '8n' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>8分</button>
            <button onClick={() => setGridMode('16n')} className={`flex-1 py-1 text-[9px] font-black rounded ${gridMode === '16n' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>16分</button>
          </div>

          {/* 2. 休符 */}
          <button onClick={handleSkip} disabled={isPlaying || !isRecordMode} className="flex flex-col items-center justify-center bg-gray-950 hover:bg-gray-800/80 border border-gray-800 rounded-lg py-1.5 text-blue-400 active:scale-95 disabled:opacity-20 transition-all">
            <FastForward size={14} />
            <span className="text-[8px] font-black mt-0.5 text-gray-300">休符</span>
          </button>

          {/* 3. 消去/戻る */}
          <button onClick={handleClearLast} disabled={isPlaying || melodyGrid.length === 0} className="flex flex-col items-center justify-center bg-gray-950 hover:bg-gray-800/80 border border-gray-800 rounded-lg py-1.5 text-red-400 active:scale-95 disabled:opacity-20 transition-all">
            <Trash2 size={14} />
            <span className="text-[8px] font-black mt-0.5 text-gray-300">消去/戻る</span>
          </button>

          {/* 4. BPM（テンポ） */}
          <button onClick={toggleBpm} className="flex flex-col items-center justify-center bg-gray-950 hover:bg-gray-800/80 border border-gray-800 rounded-lg py-1.5 text-yellow-400 active:scale-95 transition-all">
            <Clock size={14} />
            <span className="text-[8px] font-mono font-black mt-0.5 text-yellow-400">{bpm}</span>
          </button>
        </div>

        {/* 鍵盤・コントロールエリア */}
        <div className="flex-1 flex flex-col justify-center my-1">
          {/* 上部再生・練習/入力切り替えバー */}
          <div className="flex justify-between items-center px-1 mb-2">
            <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
               <button onClick={() => setIsRecordMode(false)} className={`px-3 py-1 rounded-md text-[10px] font-black flex items-center gap-1 ${!isRecordMode ? 'bg-gray-800 text-teal-400' : 'text-gray-500'}`}>
                 <Volume2 size={12} />
                 <span>練習</span>
               </button>
               <button onClick={() => setIsRecordMode(true)} className={`px-3 py-1 rounded-md text-[10px] font-black flex items-center gap-1 ${isRecordMode ? 'bg-red-600 text-white' : 'text-gray-500'}`}>
                 <div className="w-2 h-2 rounded-full bg-current" />
                 <span>入力</span>
               </button>
            </div>

            <button onClick={handleTogglePreview} className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
              {isPlaying ? <Square size={10} fill="currentColor"/> : <Play size={10} fill="currentColor"/>}
              <span>{isPlaying ? '停止' : '再生'}</span>
            </button>
          </div>

          {/* スライド鍵盤 */}
          <div ref={(el) => { if (el && el.scrollLeft === 0) el.scrollLeft = 448; }} className="w-full relative h-[166px] bg-gray-950 flex overflow-x-auto rounded-xl border border-gray-800 scrollbar-none px-2 shadow-2xl">
            <div className="flex relative h-full" style={{ width: '1408px' }}>
              {SLIDABLE_PIANO_KEYS.map((key, index) => (
                <div key={index} className="w-[64px] h-full relative shrink-0">
                  <button onClick={() => handleInputNote(key.offset, key.octave)} disabled={isPlaying} className="w-full h-[96%] bg-gray-100 active:bg-blue-100 border-r border-gray-300 rounded-b-xl flex flex-col items-center justify-end pb-5 text-gray-950 font-black text-xs border-t-4 border-blue-400/40">
                    <span className={`text-[7px] mb-0.5 ${key.type === '主' ? 'text-teal-500 font-bold' : 'text-gray-400'}`}>{key.type === '主' ? 'CENTER' : key.type === '低' ? 'LOW' : 'HIGH'}</span>{key.label}
                  </button>
                  {key.hasBlack && (
                    <button onClick={() => handleInputNote(key.bOffset!, key.octave)} disabled={isPlaying} className="absolute top-0 right-[-16px] w-[32px] h-[55%] bg-gray-900 active:bg-blue-600 rounded-b-lg text-white font-bold text-[9px] flex items-end justify-center pb-2 border border-black z-10 shadow-md">{key.bLabel}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 提案ボタン */}
        <div className="shrink-0 mb-4 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
            <Sparkles size={11} className="text-teal-400" /> 最適なコード進行をAIがランキング提案します
          </span>
          <button onClick={handleNavigateToSuggest} disabled={melodyGrid.length === 0 || isPlaying} className="w-full h-14 bg-gradient-to-r from-teal-500 to-blue-600 disabled:opacity-20 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            コードを探す ({activeSoundNoteCount}音)
          </button>
        </div>
      </div>

      {/* モーダル群 (保存/一覧) */}
      {isSaveModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4 shadow-2xl">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5"><Save size={16} className="text-blue-400" />メロディを保存</h4>
            <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value.slice(0, 10))} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white text-center focus:outline-none" />
            <div className="flex flex-col gap-2">
              <button onClick={() => executeSave(currentMelodyId ? 'overwrite' : 'new')} className="w-full py-3 bg-blue-600 text-xs font-black rounded-xl text-white">保存する</button>
              <button onClick={() => setIsSaveModalOpen(false)} className="w-full py-2 text-gray-500 text-[10px] font-bold mt-1">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {isListOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col">
          <div className="w-full max-w-[430px] h-[80vh] mt-auto mx-auto bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-black text-sm text-teal-400 tracking-tighter uppercase">Saved Melodies ({savedMelodies.length})</h3>
              <button onClick={() => setIsListOpen(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600"><Music size={40} className="mb-2 opacity-20" /><p className="text-xs font-bold">まだ保存されたデータがありません</p></div>
              ) : (
                savedMelodies.map((item) => (
                  <div key={item.id} onClick={() => handleLoadMelody(item)} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-black text-white">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase">{item.savedAt}</p>
                    </div>
                    <Trash2 size={16} className="text-gray-700 hover:text-red-500" onClick={(e) => { e.stopPropagation(); const next = savedMelodies.filter(m => m.id !== item.id); setSavedMelodies(next); localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(next)); }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}