// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { 
  Play, Pause, Rewind, Music, Guitar, MonitorSpeaker, Drum, 
  Trash2, Sparkles, Keyboard, Settings, Headphones, PenTool, Save, Wand2, ChevronRight, ChevronLeft, Loader2
} from 'lucide-react';

import { NoteData, GridMode, TrackType, AccompPattern } from './types';
import { 
  NOTES_C_MAJOR, KANA_NOTES, transposeString, getChordNotes, ALL_NOTES 
} from './constants/music';
import { PREDEFINED_PATTERNS } from './utils/harmonizer';

import AutoChordModal from './components/AutoChordModal';
import ChordSelectModal from './components/ChordSelectModal';

const BARS = 8;
const TOTAL_STEPS = 128; // 8bars * 16steps
const FIXED_VOLUMES = { melody: 0, piano: -2, guitar: -2, bass: 0, drum: 2 };

type TempoMode = 'slow' | 'medium' | 'fast';
const TEMPO_MAP: Record<TempoMode, number> = { slow: 85, medium: 110, fast: 135 };

const KEYBOARD_NOTES = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5"];
const KEYBOARD_KANA = ["低ド", "低レ", "低ミ", "低ファ", "低ソ", "低ラ", "低シ", "ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "高ド", "高レ", "高ミ", "高ファ", "高ソ", "高ラ", "高シ"];

export default function MusicApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [tempo, setTempo] = useState<TempoMode>('medium');
  const [transpose, setTranspose] = useState(0);
  const [gridMode, setGridMode] = useState<GridMode>(8);
  const [accompPattern, setAccompPattern] = useState<AccompPattern>('whole');
  
  const [zoomWidth, setZoomWidth] = useState(12); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(true);
  const [isStepInputMode, setIsStepInputMode] = useState(true); 

  const [viewHalf, setViewHalf] = useState<1 | 2>(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [showChordPopup, setShowChordPopup] = useState<number | null>(null);
  const [isAutoChordModalOpen, setIsAutoChordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [melodyGrid, setMelodyGrid] = useState<NoteData[]>([]);
  const [chords, setChords] = useState<string[]>(Array(16).fill('C').map((_, i) => i % 2 === 1 ? '-' : 'C'));
  const [mutes, setMutes] = useState<Record<TrackType, boolean>>({
    melody: false, piano: false, guitar: false, bass: false, drum: false
  });

  const synths = useRef<any>({});
  const isInitialized = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null); 
  const currentStepRef = useRef(0);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(24);

  const stateRef = useRef({ melodyGrid, chords, mutes, transpose, accompPattern });
  useEffect(() => { stateRef.current = { melodyGrid, chords, mutes, transpose, accompPattern }; }, [melodyGrid, chords, mutes, transpose, accompPattern]);

  // 再生中のみ、プレイヘッドに合わせてタブの表示を自動更新する
  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= 64 && viewHalf === 1) setViewHalf(2);
      else if (currentStep < 64 && viewHalf === 2) setViewHalf(1);
    }
  }, [currentStep, isPlaying, viewHalf]);

  useEffect(() => {
    const calculateInitialZoom = () => {
      const availableWidth = Math.min(window.innerWidth, 430) - 44; 
      setZoomWidth(Math.max(10, Math.min(Math.floor(availableWidth / 32), 40)));
    };
    calculateInitialZoom();
    window.addEventListener('resize', calculateInitialZoom);

    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 180; 
    return () => window.removeEventListener('resize', calculateInitialZoom);
  }, []);

  useEffect(() => {
    if (isKeyboardOpen && keyboardContainerRef.current) {
      setTimeout(() => { keyboardContainerRef.current?.scrollTo({ left: 350, behavior: 'smooth' }); }, 100);
    }
  }, [isKeyboardOpen]);

  useEffect(() => {
    if (isInitialized.current) Tone.Transport.bpm.value = TEMPO_MAP[tempo];
  }, [tempo]);

  // ★ 修正: 分断をなくし、プレイヘッドに合わせてシンプルに自動スクロール
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const visualX = currentStep * zoomWidth + 44; 
      if (visualX > container.scrollLeft + container.clientWidth * 0.8 || visualX < container.scrollLeft) {
        container.scrollTo({ left: Math.max(0, visualX - container.clientWidth * 0.3), behavior: 'smooth' });
      }
    }
  }, [currentStep, zoomWidth]);

  // ★ 追加: 手動スクロール時に、現在の表示領域に合わせてタブのハイライトを更新
  const handleScroll = () => {
    if (scrollContainerRef.current && !isPlaying) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const midpoint = 64 * zoomWidth / 2;
      if (scrollLeft > midpoint && viewHalf === 1) setViewHalf(2);
      if (scrollLeft <= midpoint && viewHalf === 2) setViewHalf(1);
    }
  };

  const handleSave = () => {
    const data = { melodyGrid, chords, tempo, transpose, gridMode, accompPattern };
    localStorage.setItem('easyComposerData', JSON.stringify(data));
    setToastMessage('💾 メロディを保存しました！');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDistRef.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchStartZoomRef.current = zoomWidth;
    }
  };
  const handlePinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const ratio = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) / pinchStartDistRef.current;
      setZoomWidth(Math.max(10, Math.min(40, Math.round(pinchStartZoomRef.current * ratio))));
    }
  };
  const handlePinchEnd = () => pinchStartDistRef.current = null;

  const initAudio = async () => {
    if (isInitialized.current) return;
    setIsAudioLoading(true);
    try {
      await Tone.start();
      synths.current = {
        melody: new Tone.PolySynth(Tone.Synth, { volume: FIXED_VOLUMES.melody }).toDestination(),
        piano: new Tone.Sampler({ urls: { "C3": "C3.mp3", "C4": "C4.mp3" }, baseUrl: "/samples/piano/", volume: FIXED_VOLUMES.piano }).toDestination(),
        guitar: new Tone.Sampler({ urls: { "C3": "C3.mp3", "C4": "C4.mp3" }, baseUrl: "/samples/guitar/", volume: FIXED_VOLUMES.guitar }).toDestination(),
        bass: new Tone.Sampler({ urls: { "C2": "C2.mp3", "C3": "C3.mp3" }, baseUrl: "/samples/bass/", volume: FIXED_VOLUMES.bass }).toDestination(),
        drums: new Tone.Sampler({ urls: { "C1": "kick.mp3", "D1": "snare.mp3", "E1": "hihat.mp3" }, baseUrl: "/samples/drums/", volume: FIXED_VOLUMES.drum }).toDestination()
      };
      await Tone.loaded();
      Tone.Transport.bpm.value = TEMPO_MAP[tempo];
      isInitialized.current = true;
    } catch (e) {
      console.error(e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    let activeChord = '';
    let isTieSlot = false;
 
    const loop = new Tone.Loop((time) => {
      const { melodyGrid, chords, mutes, transpose, accompPattern } = stateRef.current;
      const step = currentStepRef.current;

      Tone.Draw.schedule(() => setCurrentStep(step >= 0 ? step % TOTAL_STEPS : step), time);

      const current16th = step % TOTAL_STEPS;
      const currentChordSlot = Math.floor(current16th / 8);

      if (!mutes.melody) {
        melodyGrid.forEach(n => {
          if (n.col === current16th) {
            const rawNote = NOTES_C_MAJOR[n.row] || (n as any).customNoteName; 
            if (rawNote) synths.current.melody.triggerAttackRelease(transposeString(rawNote, transpose), n.duration * 0.125, time);
          }
        });
      }

      if (!mutes.drum) {
        if (current16th % 8 === 0 || current16th % 16 === 10) synths.current.drums.triggerAttackRelease('C1', '8n', time, 1.0);
        if (current16th % 8 === 4) synths.current.drums.triggerAttackRelease('D1', '8n', time, 0.9);
        if (current16th % 2 === 0) synths.current.drums.triggerAttackRelease('E1', '16n', time, (current16th % 4 === 0) ? 0.7 : 0.4);
      }

      if (current16th % 8 === 0) {
        isTieSlot = (chords[currentChordSlot] === '-');
        if (!isTieSlot) activeChord = transposeString(chords[currentChordSlot], transpose);
      }

      if (activeChord) {
        const chordData = getChordNotes(activeChord, 4);
        if (chordData) {
          if (accompPattern === 'whole' && current16th % 8 === 0 && !isTieSlot) {
            if (!mutes.piano) synths.current.piano.triggerAttackRelease(chordData.notes, "1m", time);
            if (!mutes.guitar) synths.current.guitar.triggerAttackRelease(chordData.notes, "1m", time);
          } else if (accompPattern === 'fourOnTheFloor' && current16th % 4 === 0) {
            if (!mutes.piano) synths.current.piano.triggerAttackRelease(chordData.notes, "8n", time);
            if (!mutes.guitar) chordData.notes.forEach((note, i) => synths.current.guitar.triggerAttackRelease(note, "8n", time + i * 0.015));
          } else if (accompPattern === 'arpeggio' && current16th % 2 === 0) {
            const targetNote = chordData.notes[(current16th / 2) % chordData.notes.length];
            if (!mutes.piano) synths.current.piano.triggerAttackRelease(targetNote, "8n", time);
            if (!mutes.guitar) synths.current.guitar.triggerAttackRelease(targetNote, "8n", time);
          }
        }
        const bassData = getChordNotes(activeChord, 2);
        if (!mutes.bass && current16th % 2 === 0 && bassData) {
          synths.current.bass.triggerAttackRelease(bassData.bassNote, "8n", time, (current16th % 4 === 0) ? 0.9 : 0.6);
        }
      }
      currentStepRef.current++;
    }, "16n").start(0);
    return () => { loop.dispose(); };
  }, []);

  const togglePlay = async () => {
    if (!isInitialized.current) await initAudio();
    if (isPlaying) { Tone.Transport.pause(); setIsPlaying(false); } 
    else { Tone.Transport.start(); setIsPlaying(true); }
  };
  const rewindToStart = () => { Tone.Transport.stop(); setIsPlaying(false); setCurrentStep(0); currentStepRef.current = 0; setViewHalf(1); };

  const handleKeyboardTouchStart = (e: React.TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }; };
  const handleKeyboardTouchEnd = (e: React.TouchEvent, noteName: string) => {
    if (!touchStartRef.current) return;
    if (Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x) < 8 && Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y) < 8 && Date.now() - touchStartRef.current.time < 300) {
      executeKeyboardPress(noteName);
    }
    touchStartRef.current = null;
  };

  const executeKeyboardPress = async (noteName: string) => {
    if (!isInitialized.current) await initAudio();
    synths.current.melody.triggerAttackRelease(transposeString(noteName, transpose), '8n');

    if (isStepInputMode && !isPlaying) {
      let rowIndex = NOTES_C_MAJOR.indexOf(noteName);
      if (rowIndex === -1) return;
      const stepSize = gridMode === 8 ? 2 : 1;
      setMelodyGrid(prev => [...prev.filter(n => n.col !== currentStep), { row: rowIndex, col: currentStep, duration: stepSize }]);
      setCurrentStep(prev => {
        const next = prev + stepSize;
        const bounded = next >= TOTAL_STEPS ? 0 : next;
        currentStepRef.current = bounded;
        return bounded;
      });
    }
  };

  const handleStepForward = () => {
    const stepSize = gridMode === 8 ? 2 : 1;
    setCurrentStep(prev => {
      const next = prev + stepSize;
      const bounded = next >= TOTAL_STEPS ? 0 : next;
      currentStepRef.current = bounded;
      return bounded;
    });
  };

  const handleStepBackwardDelete = () => {
    const stepSize = gridMode === 8 ? 2 : 1;
    setCurrentStep(prev => {
      const next = prev - stepSize;
      const bounded = next < 0 ? TOTAL_STEPS - stepSize : next;
      currentStepRef.current = bounded;
      setMelodyGrid(grid => grid.filter(n => n.col !== bounded));
      return bounded;
    });
  };

  const toggleMelodyNote = async (row: number, col: number) => {
    if (!isInitialized.current) await initAudio();
    setMelodyGrid(prev => {
      const stepSize = gridMode === 8 ? 2 : 1;
      const startCol = gridMode === 8 ? Math.floor(col / 2) * 2 : col;
      const existingIdx = prev.findIndex(n => n.row === row && n.col === startCol);
      if (existingIdx >= 0) return prev.filter((_, i) => i !== existingIdx);
      return [...prev, { row, col: startCol, duration: stepSize }];
    });
    if (!isPlaying) synths.current.melody.triggerAttackRelease(transposeString(NOTES_C_MAJOR[row], transpose), '8n');
  };

  const applyChordPattern = async (pattern: string[]) => {
    if (!isInitialized.current) await initAudio();
    setChords(pattern);
    if (!isPlaying) { rewindToStart(); togglePlay(); }
  };

  const getCurrentKeyName = () => ALL_NOTES[(ALL_NOTES.indexOf("C") + transpose + 12) % 12];
  const KEYBOARD_WIDTH = 44;

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 flex justify-center items-center overflow-hidden font-sans select-none relative">
      
      {isAudioLoading && (
        <div className="absolute inset-0 z-[200] bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <span className="text-white font-bold text-sm">音源を読み込み中...</span>
        </div>
      )}

      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] bg-teal-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-5">
          {toastMessage}
        </div>
      )}

      <div className="w-full max-w-[430px] h-full bg-gray-950 shadow-2xl flex flex-col relative text-white overflow-hidden sm:h-[90vh] sm:rounded-2xl sm:border sm:border-gray-800">
        
        <header className="px-4 py-2.5 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex justify-between items-center shrink-0 z-30">
          <h1 className="text-lg font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Easy Composer
          </h1>
          <div className="flex gap-2 items-center">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-1.5 rounded-full transition-colors ${isSettingsOpen ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              <Settings size={18} />
            </button>
            <button onClick={handleSave} className="flex items-center space-x-1 bg-indigo-600 px-4 py-1.5 rounded-full shadow-lg text-xs font-bold active:scale-95 border border-indigo-400/30">
              <Save size={14} /> <span>保存</span>
            </button>
          </div>
        </header>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-800/95 border-b border-gray-700 z-20 ${isSettingsOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-transparent'}`}>
          <div className="p-3 grid grid-cols-2 gap-3 text-xs font-bold text-gray-300">
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">テンポ</span>
              <div className="flex bg-gray-900 rounded p-1 gap-1">
                {(['slow', 'medium', 'fast'] as TempoMode[]).map(t => (
                  <button key={t} onClick={() => setTempo(t)} className={`flex-1 py-1 rounded transition-colors ${tempo === t ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>
                    {{ slow: '🚶ゆっくり', medium: '🏃ふつう', fast: '⚡はやい' }[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">キー設定</span>
              <div className="flex items-center justify-between bg-gray-900 rounded px-2 py-1">
                <button onClick={() => setTranspose(p => p - 1)} className="px-2 text-lg active:scale-90">-</button>
                <span className="w-8 text-center text-blue-200">{getCurrentKeyName()}</span>
                <button onClick={() => setTranspose(p => p + 1)} className="px-2 text-lg active:scale-90">+</button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">音符サイズ</span>
              <div className="flex bg-gray-900 rounded p-1 gap-1 h-full">
                <button onClick={() => setGridMode(8)} className={`flex-1 rounded ${gridMode === 8 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>♪ 8分</button>
                <button onClick={() => setGridMode(16)} className={`flex-1 rounded ${gridMode === 16 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>♬ 16分</button>
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400">伴奏スタイル</span>
              <div className="flex bg-gray-900 rounded p-1 gap-1">
                {[ { id: 'whole', l: '全音符' }, { id: 'fourOnTheFloor', l: '4つ打ち' }, { id: 'arpeggio', l: 'アルペジオ' } ].map(p => (
                  <button key={p.id} onClick={() => setAccompPattern(p.id as AccompPattern)} className={`flex-1 py-1 rounded transition ${accompPattern === p.id ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}>
                    {p.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 py-2 bg-gray-800/80 border-b border-gray-700 flex justify-between items-center gap-2 shrink-0 z-10 shadow-sm">
          <div className="flex gap-1 shrink-0">
            <button onClick={rewindToStart} className="w-9 h-9 flex items-center justify-center bg-gray-700 rounded-full active:scale-95 text-white">
              <Rewind size={16} />
            </button>
            <button onClick={togglePlay} className={`w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-all ${isPlaying ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'}`}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1"/>}
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-1 flex-1">
            {(Object.keys(mutes) as TrackType[]).map(track => {
              const icons = { melody: Music, piano: MonitorSpeaker, guitar: Guitar, bass: Guitar, drum: Drum };
              const Icon = icons[track];
              return (
                <button key={track} onClick={() => setMutes(p => ({ ...p, [track]: !p[track] }))} className={`py-1.5 flex flex-col items-center justify-center rounded transition-all active:scale-95 ${mutes[track] ? 'bg-gray-700/50 text-gray-500' : 'bg-blue-600 text-white shadow-sm'}`}>
                  <Icon size={14} className="mb-0.5" />
                  <span className="text-[7px] uppercase tracking-wider">{track}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-1 w-[4.5rem] shrink-0">
            <button onClick={() => window.confirm('作成したメロディをすべて消去しますか？') && setMelodyGrid([])} className="h-full w-full py-2 bg-gray-700 hover:bg-red-900/50 rounded-lg text-[10px] font-bold text-red-300 flex items-center justify-center gap-1 active:scale-95 transition-colors border border-gray-600">
              <Trash2 size={12}/>クリア
            </button>
          </div>
        </div>

        {/* ★ タブは「ジャンプボタン」として機能 */}
        <div className="bg-gray-900 border-b border-gray-800 flex justify-center py-1.5 shrink-0">
          <div className="flex bg-gray-800/80 p-0.5 rounded-lg border border-gray-700/50">
            <button onClick={() => {
              setViewHalf(1);
              scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
            }} className={`px-4 py-1 text-[11px] font-bold rounded-md transition-colors ${viewHalf === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>
              前半 (1〜4小節)
            </button>
            <button onClick={() => {
              setViewHalf(2);
              scrollContainerRef.current?.scrollTo({ left: 64 * zoomWidth, behavior: 'smooth' });
            }} className={`px-4 py-1 text-[11px] font-bold rounded-md transition-colors ${viewHalf === 2 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>
              後半 (5〜8小節)
            </button>
          </div>
        </div>

        {/* --- ピアノロール領域 --- */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-gray-950">
          <div 
            className="flex-1 overflow-auto touch-pan-x touch-pan-y overscroll-none scroll-smooth pb-10"
            ref={scrollContainerRef}
            onTouchStart={handlePinchStart}
            onTouchMove={handlePinchMove}
            onTouchEnd={handlePinchEnd}
            onScroll={handleScroll} // 手動スクロール時にもタブを同期
          >
            {/* ★ 横幅を128ステップ全体に拡張 */}
            <div className="relative" style={{ width: `${TOTAL_STEPS * zoomWidth + KEYBOARD_WIDTH}px` }}>
              
              <div className="flex sticky top-0 z-30 bg-gray-900 border-b border-gray-700 h-5" style={{ paddingLeft: `${KEYBOARD_WIDTH}px` }}>
                <div className="relative w-full h-full cursor-pointer hover:bg-gray-800/80 transition-colors" onClick={(e) => {
                  const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
                  const newStep = Math.max(0, Math.min(Math.floor(x / zoomWidth), TOTAL_STEPS - 1));
                  setCurrentStep(newStep); currentStepRef.current = newStep; 
                }}>
                  {Array.from({ length: 32 }).map((_, i) => {
                    return (
                      <div key={i} className={`absolute h-full border-l ${i % 4 === 0 ? 'border-gray-500' : 'border-gray-700'}`} style={{ left: `${i * 4 * zoomWidth}px` }}>
                        {i % 4 === 0 && <span className="text-[9px] text-gray-400 ml-1 leading-none top-0 absolute">{i / 4 + 1}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex sticky top-5 z-20 bg-gray-900/95 backdrop-blur shadow-md" style={{ paddingLeft: `${KEYBOARD_WIDTH}px` }}>
                {chords.map((chord, i) => {
                  return (
                    <div key={`chord-${i}`} className="p-[2px]" style={{ width: `${8 * zoomWidth}px` }}>
                      <button onClick={() => setShowChordPopup(i)} className={`w-full h-8 flex items-center justify-center transition-all group ${chord === '-' ? 'bg-gray-800/40 border-y border-r border-l-0 border-gray-700 rounded-r-md' : 'bg-gray-800/80 border border-gray-600 rounded-md active:scale-95'}`}>
                        <span className={`text-xs font-bold ${chord === '-' ? 'text-gray-500' : 'text-yellow-400 group-hover:text-yellow-300'}`}>
                          {chord === '-' ? 'ー' : transposeString(chord, transpose)}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="relative border-t border-gray-800/80 mt-[1px]">
                {currentStep >= 0 && (
                  <div className="absolute bottom-0 z-30 pointer-events-none transition-all duration-[30ms] ease-linear"
                    style={{ top: '-52px', left: `${KEYBOARD_WIDTH + currentStep * zoomWidth}px`, width: `${zoomWidth}px`, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderLeft: '2px solid rgba(239, 68, 68, 0.9)', boxShadow: '-2px 0 10px rgba(239, 68, 68, 0.4)' }} />
                )}

                {NOTES_C_MAJOR.map((baseNote, rowIndex) => (
                  <div key={rowIndex} className="flex h-8 border-b border-gray-800/80">
                    <div className={`flex-shrink-0 flex items-center justify-center text-[10px] sticky left-0 z-10 font-bold border-r border-gray-700 shadow-sm ${KANA_NOTES[rowIndex].includes("ド") ? 'bg-blue-900/90 text-blue-200' : 'bg-gray-800/90 text-gray-400'}`} style={{ width: `${KEYBOARD_WIDTH}px` }}>
                      {KANA_NOTES[rowIndex]}
                    </div>
                    <div className="flex relative">
                      {Array.from({ length: TOTAL_STEPS }).map((_, colIndex) => {
                        if (gridMode === 8 && colIndex % 2 !== 0) return null;
                        const isActive = melodyGrid.some(n => n.row === rowIndex && n.col === colIndex);
                        return (
                          <div key={colIndex} onClick={() => toggleMelodyNote(rowIndex, colIndex)}
                            className={`h-8 border-r cursor-pointer flex items-center p-[1px] ${colIndex % 16 === 0 ? 'border-r-gray-600 bg-gray-900/30' : colIndex % 4 === 0 ? 'border-r-gray-700' : 'border-r-gray-800/50'}`} style={{ width: `${gridMode === 8 ? zoomWidth * 2 : zoomWidth}px` }}>
                            {isActive && <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-500 rounded-sm shadow-[0_0_6px_rgba(59,130,246,0.6)]"></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-gray-900 border-t border-gray-800 flex flex-col pointer-events-auto shadow-[0_-10px_20px_rgba(0,0,0,0.4)] z-50">
          
          <div className="flex relative">
            <button onClick={() => setIsKeyboardOpen(true)} className={`flex-1 py-2.5 text-[11px] font-bold flex justify-center items-center gap-1.5 transition-colors ${isKeyboardOpen ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              <Keyboard size={14} /> メロディを入力
            </button>
            <button onClick={() => setIsKeyboardOpen(false)} className={`flex-1 py-2.5 text-[11px] font-bold flex justify-center items-center gap-1.5 transition-colors ${!isKeyboardOpen ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              <Sparkles size={14} /> コード進行を提案
            </button>
          </div>

          <div className="h-[145px] overflow-hidden bg-gray-950 pb-[env(safe-area-inset-bottom)] relative flex flex-col">
            {isKeyboardOpen ? (
              <>
                <div className="flex justify-between items-center px-2 pt-2 pb-1 bg-gray-900 shrink-0 border-b border-gray-800">
                  <button onClick={handleStepBackwardDelete} disabled={!isStepInputMode} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all ${isStepInputMode ? 'bg-gray-800 text-red-300 border border-gray-700 shadow-sm' : 'opacity-50 text-gray-600'}`}>
                    <ChevronLeft size={14}/> 戻る・消す
                  </button>

                  <div className="bg-gray-800 rounded-full p-1 flex gap-1 shadow-inner border border-gray-700">
                    <button onClick={() => setIsStepInputMode(false)} className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${!isStepInputMode ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400'}`}>
                      <Headphones size={12}/> 試聴
                    </button>
                    <button onClick={() => setIsStepInputMode(true)} className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${isStepInputMode ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400'}`}>
                      <PenTool size={12}/> 入力
                    </button>
                  </div>

                  <button onClick={handleStepForward} disabled={!isStepInputMode} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all ${isStepInputMode ? 'bg-gray-800 text-blue-300 border border-gray-700 shadow-sm' : 'opacity-50 text-gray-600'}`}>
                    休む・進む <ChevronRight size={14}/>
                  </button>
                </div>

                <div ref={keyboardContainerRef} className="flex-1 flex overflow-x-auto gap-1 py-2 px-2 touch-pan-x [&::-webkit-scrollbar]:hidden items-end">
                  {KEYBOARD_NOTES.map((note, i) => (
                    <button key={note} onTouchStart={handleKeyboardTouchStart} onTouchEnd={(e) => handleKeyboardTouchEnd(e, note)}     
                      className={`shrink-0 bg-white text-gray-950 font-bold text-[10px] h-full rounded-b-xl flex flex-col items-center justify-end pb-3 shadow-md active:bg-gray-300 transition-colors border-t-2 ${isStepInputMode ? 'border-blue-400' : 'border-amber-400'}`} style={{ width: '54px' }}>
                      <span className="text-gray-400 text-[8px] font-mono leading-none mb-1">{note}</span>
                      <span className="leading-none text-xs">{KEYBOARD_KANA[i]}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 overflow-y-auto p-2 grid grid-cols-2 gap-2 content-start">
                <button onClick={() => setIsAutoChordModalOpen(true)} className="col-span-2 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 border border-blue-400/30">
                  <Wand2 size={18} /> ✨ 8小節のコード進行を選ぶ
                </button>
                {Object.entries(PREDEFINED_PATTERNS).map(([name, config]) => (
                  <button key={name} onClick={() => applyChordPattern(config.patterns[0])} className="py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-200 font-bold text-[11px] active:scale-95 border border-gray-700 shadow-sm">
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <AutoChordModal 
          isOpen={isAutoChordModalOpen} 
          onClose={() => setIsAutoChordModalOpen(false)} 
          melodyGrid={melodyGrid} 
          bars={BARS} 
          chords={chords} 
          setChords={setChords} 
        />

        <ChordSelectModal 
          showIndex={showChordPopup} 
          onClose={() => setShowChordPopup(null)} 
          chords={chords} 
          setChords={setChords} 
          transpose={transpose} 
        />
      </div>
    </div>
  );
}