// src/components/SimpleKeyboardInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Trash2, Play, Square, Disc, Music, Save, FolderHeart, X, Edit2, Check } from 'lucide-react';
import { NoteData, SavedMelodyItem } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getNoteNameFromMidi } from '../constants/music';

// 真ん中のド（C4）を基準とした、上下1オクターブずつの完全3オクターブ白鍵ベース配列
const SLIDABLE_PIANO_KEYS = [
  // --- 低音域 (オクターブ3) ---
  { label: 'ド', octave: 3, offset: 0, type: '低', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 3, offset: 2, type: '低', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 3, offset: 4, type: '低', hasBlack: false },
  { label: 'ファ', octave: 3, offset: 5, type: '低', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 3, offset: 7, type: '低', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 3, offset: 9, type: '低', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 3, offset: 11, type: '低', hasBlack: false },

  // --- 真ん中の音域 (オクターブ4) ---
  { label: 'ド', octave: 4, offset: 0, type: '主', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 4, offset: 2, type: '主', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 4, offset: 4, type: '主', hasBlack: false },
  { label: 'ファ', octave: 4, offset: 5, type: '主', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 4, offset: 7, type: '主', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 4, offset: 9, type: '主', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 4, offset: 11, type: '主', hasBlack: false },

  // --- 高音域 (オクターブ5) ---
  { label: 'ド', octave: 5, offset: 0, type: '高', hasBlack: true,  bLabel: 'ド#', bOffset: 1 },
  { label: 'レ', octave: 5, offset: 2, type: '高', hasBlack: true,  bLabel: 'レ#', bOffset: 3 },
  { label: 'ミ', octave: 5, offset: 4, type: '高', hasBlack: false },
  { label: 'ファ', octave: 5, offset: 5, type: '高', hasBlack: true,  bLabel: 'ファ#', bOffset: 6 },
  { label: 'ソ', octave: 5, offset: 7, type: '高', hasBlack: true,  bLabel: 'ソ#', bOffset: 8 },
  { label: 'ラ', octave: 5, offset: 9, type: '高', hasBlack: true,  bLabel: 'ラ#', bOffset: 10 },
  { label: 'シ', octave: 5, offset: 11, type: '高', hasBlack: false },
  
  // 最高音のド
  { label: 'ド', octave: 6, offset: 0, type: '高', hasBlack: false }
];

const convertMidiToDoremi = (midi: number): string => {
  if (midi === 0) return 'ー';
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
  const { playSingleNote, startMelodyPreview, stopPlayback, isPlaying } = useAudioPlayer();
  
  const [melodyGrid, setMelodyGrid] = useState<NoteData[]>(() => location.state?.melodyGrid || []);
  
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const grid = location.state?.melodyGrid || [];
    if (grid.length === 0) return 0;
    const lastNote = grid.reduce((max, note) => note.col > max.col ? note : max, grid[0]);
    const nextStep = lastNote.col + lastNote.duration;
    return nextStep >= 128 ? 128 : nextStep;
  });

  const [bpm, setBpm] = useState<number>(() => location.state?.bpm || 110);
  const [activePlayStep, setActivePlayStep] = useState<number | null>(null);
  const [isRecordMode, setIsRecordMode] = useState<boolean>(true); 

  const [currentMelodyId, setCurrentMelodyId] = useState<string | null>(() => location.state?.currentMelodyId || null);
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const monitorRef = useRef<HTMLDivElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); }
    }
    return () => {
      stopPlayback();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (monitorRef.current) {
      const scrollPosition = (currentStep / 2) * 44;
      monitorRef.current.scrollTo({ left: scrollPosition - 100, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleScrollDetect = () => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => { isScrollingRef.current = false; }, 150);
  };

  const handleInputNote = async (offset: number, keyOctave: number) => {
    if (isScrollingRef.current || isPlaying) return;
    const midiNote = (keyOctave + 1) * 12 + offset;
    await playSingleNote(getNoteNameFromMidi(midiNote));
    if (!isRecordMode) return;
    if (currentStep >= 128) return;
    setMelodyGrid(prev => [...prev, { midiNote, col: currentStep, duration: 2 }]);
    setCurrentStep(prev => prev + 2);
  };

  const handleRest = () => {
    if (currentStep >= 128 || isPlaying || !isRecordMode) return;
    setMelodyGrid(prev => [...prev, { midiNote: 0, col: currentStep, duration: 2 }]);
    setCurrentStep(prev => prev + 2);
  };

  const handleClearLast = () => {
    if (isPlaying || melodyGrid.length === 0) return;
    const lastNote = melodyGrid[melodyGrid.length - 1];
    setMelodyGrid(prev => prev.slice(0, -1));
    setCurrentStep(lastNote.col);
  };

  const handleTogglePreview = async () => {
    if (isPlaying) { stopPlayback(); setActivePlayStep(null); } 
    else { await startMelodyPreview(melodyGrid, currentStep, bpm, (step) => { setActivePlayStep(step); }); }
  };

  const handleOpenSaveDialog = () => {
    if (melodyGrid.length === 0) { showToast("⚠️ メロディが空です"); return; }
    const currentItem = savedMelodies.find(m => m.id === currentMelodyId);
    setInputName(currentItem ? currentItem.title : `記憶したメロディ #${savedMelodies.length + 1}`);
    setIsSaveModalOpen(true);
  };

  const executeSave = (type: 'overwrite' | 'new') => {
    const nameToSave = inputName.trim().slice(0, 10) || `メロディ #${savedMelodies.length + 1}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let nextList = [...savedMelodies];
    if (type === 'overwrite' && currentMelodyId) {
      nextList = nextList.map(item => item.id === currentMelodyId ? { ...item, title: nameToSave, melodyGrid, bpm, savedAt: formattedDate } : item);
      showToast(`💾 「${nameToSave}」を上書き保存しました`);
    } else {
      const newId = `melo-${Date.now()}`;
      const newItem: SavedMelodyItem = { id: newId, title: nameToSave, melodyGrid, bpm, savedAt: formattedDate };
      nextList = [newItem, ...nextList];
      setCurrentMelodyId(newId);
      showToast(`💾 「${nameToSave}」を新規保存しました`);
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
    const lastNote = item.melodyGrid.reduce((max, note) => note.col > max.col ? note : max, item.melodyGrid[0] || { col: 0, duration: 2 });
    setCurrentStep(item.melodyGrid.length === 0 ? 0 : Math.min(128, lastNote.col + lastNote.duration));
    setIsListOpen(false);
    showToast(`📂 「${item.title}」を展開しました`);
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(id);
    setEditingName(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanName = editingName.trim().slice(0, 10) || "無題";
    const nextList = savedMelodies.map(item => item.id === id ? { ...item, title: cleanName } : item);
    setSavedMelodies(nextList);
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList));
    setEditingItemId(null);
  };

  const handleDeleteMelody = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = savedMelodies.filter(item => item.id !== id);
    if (currentMelodyId === id) setCurrentMelodyId(null);
    setSavedMelodies(nextList);
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList));
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-950 text-white select-none relative overflow-hidden">
      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[110] bg-teal-500 border border-teal-400 text-gray-950 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">{toast}</div>
      )}

      {/* ヘッダーパネル (縦に絶対に縮まない固定) */}
      <div className="p-4 border-b border-gray-900 flex items-center justify-between py-2 shrink-0">
        <button onClick={() => navigate('/input-select')} className="text-gray-400 hover:text-white"><ArrowLeft size={18} /></button>
        <span className="font-bold text-sm tracking-tight">自由なドレミ入力</span>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenSaveDialog} className="flex flex-col items-center group">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-xl text-blue-400 group-hover:text-blue-300 transition-all shadow-sm">
              <Save size={15} />
            </div>
            <span className="text-[8px] font-bold text-gray-500 group-hover:text-blue-400 scale-90 mt-0.5 transition-colors">保存</span>
          </button>
          
          <button onClick={() => setIsListOpen(true)} className="flex flex-col items-center group relative">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-xl text-teal-400 group-hover:text-teal-300 transition-all shadow-sm">
              <FolderHeart size={15} />
            </div>
            <span className="text-[8px] font-bold text-gray-500 group-hover:text-teal-400 scale-90 mt-0.5 transition-colors">一覧</span>
            {savedMelodies.length > 0 && <span className="absolute top-[-3px] right-[-3px] bg-red-500 rounded-full text-[8px] text-white font-black px-1 min-w-[14px] h-3.5 flex items-center justify-center border border-gray-950 shadow-md">{savedMelodies.length}</span>}
          </button>
        </div>
      </div>
      
      {/* 
        ★ここが最大の変更ポイント！
        justify-betweenを撤廃し、各パーツを上から綺麗に敷き詰めます。
        はみ出してボタンを押し出す原因になっていた隙間をタイトに制御します。
      */}
      <div className="flex-1 p-4 flex flex-col justify-start gap-3 overflow-hidden h-full">
        
        {/* タイムラインモニター (縦に絶対に縮まない固定) */}
        <div className="w-full bg-gray-900 border border-gray-800 p-3 rounded-xl h-[115px] flex flex-col relative shrink-0">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {currentMelodyId ? `📝 編集中の資産: ${savedMelodies.find(m=>m.id===currentMelodyId)?.title}` : 'メロディタイムライン'}
            </div>
            <button onClick={handleTogglePreview} disabled={melodyGrid.length === 0} className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
              {isPlaying ? <Square size={8} fill="currentColor"/> : <Play size={8} fill="currentColor"/>}
              <span>{isPlaying ? 'ストップ' : '再生'}</span>
            </button>
          </div>

          <div ref={monitorRef} className="flex-1 flex items-center gap-1 overflow-x-auto w-full px-1 scrollbar-none relative">
            {Array.from({ length: Math.max(16, Math.ceil((currentStep + 2) / 8) * 8) }).map((_, i) => {
              const stepCol = i * 2;
              const found = melodyGrid.find(n => n.col === stepCol);
              const isNowPlaying = stepCol === activePlayStep && isPlaying;
              const isMeasureStart = stepCol % 16 === 0;
              return (
                <div key={i} className={`flex-shrink-0 relative ${isMeasureStart ? 'ml-2 border-l-2 border-dashed border-gray-700 pl-1' : ''}`}>
                  {isMeasureStart && <span className="absolute -top-4 left-1 text-[8px] text-gray-500 font-mono font-bold">小節 {stepCol / 16 + 1}</span>}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${isNowPlaying ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-black scale-105 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black' : found ? (found.midiNote === 0 ? 'bg-gray-800 border border-dashed border-gray-600 text-gray-500' : 'bg-blue-600/30 border border-blue-500/40 text-blue-300') : stepCol === currentStep && isRecordMode ? 'bg-gray-950 border-2 border-dashed border-teal-400 animate-pulse text-teal-400' : 'bg-gray-950 border border-gray-900 text-gray-800'}`}>
                    {found ? convertMidiToDoremi(found.midiNote) : (stepCol === currentStep && isRecordMode ? '✏️' : 'ー')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* モード切替 (縦に絶対に縮まない固定) */}
        <div className="w-full shrink-0 flex p-1 bg-gray-950 rounded-xl border border-gray-800 gap-1">
          <button onClick={() => setIsRecordMode(false)} className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${!isRecordMode ? 'bg-gradient-to-r from-teal-600 to-emerald-600 border border-teal-400/30 text-white shadow-md font-black' : 'text-gray-500 hover:text-gray-400'}`}><Music size={12} /><span>練習モード（弾くだけ）</span></button>
          <button onClick={() => setIsRecordMode(true)} className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${isRecordMode ? 'bg-gradient-to-r from-red-600 to-rose-600 border border-red-400/30 text-white shadow-md font-black' : 'text-gray-500 hover:text-gray-400'}`}><Disc size={12} className={isRecordMode ? "animate-pulse" : ""} /><span>入力モード（音を記録）</span></button>
        </div>

        {/* アクションバー (縦に絶対に縮まない固定) */}
        <div className="flex justify-between items-center gap-2 shrink-0">
          <button onClick={handleRest} disabled={isPlaying || currentStep >= 128 || !isRecordMode} className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 disabled:opacity-30 rounded-xl border border-gray-800 font-bold text-[11px] transition-all flex items-center justify-center gap-1"><span>⏳ 1拍休符 (ー)</span></button>
          <button onClick={handleClearLast} disabled={isPlaying || melodyGrid.length === 0} className="flex-1 py-2 bg-gray-900 hover:bg-red-950/30 text-red-400 rounded-xl border border-gray-800 font-bold text-[11px] transition-all flex items-center justify-center gap-1 disabled:opacity-30"><Trash2 size={12} /><span>末尾を1音消す</span></button>
        </div>

        {/* テンポ選択 (縦に絶対に縮まない固定) */}
        <div className="flex flex-col gap-1 bg-gray-900/40 border border-gray-900 p-1.5 rounded-xl shrink-0">
          <div className="grid grid-cols-3 bg-gray-950 p-0.5 rounded-lg border border-gray-800 gap-1">
            {[{ label: 'ゆったり (85)', b: 85 }, { label: 'ふつう (110)', b: 110 }, { label: 'はやめ (135)', b: 135 }].map(t => (
              <button key={t.b} onClick={() => setBpm(t.b)} className={`py-1 rounded text-[10px] font-bold transition-all ${bpm === t.b ? 'bg-blue-600 text-white shadow-md font-black' : 'text-gray-500'}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* 
          ★ここが絶対配置ジャンプの最強Refシステム！
          このスライダブル3オクターブ鍵盤が出現した瞬間に、
          低音域(白鍵7枚分＝448px)の右側（真ん中のド）へブレずに強制ジャンプさせます。
        */}
        <div className="flex flex-col gap-1 shrink-0">
          <div 
            ref={(el) => {
              if (el) {
                // @ts-ignore
                keyboardContainerRef.current = el;
                el.style.scrollSnapType = 'none';
                el.scrollLeft = 448; 
                requestAnimationFrame(() => {
                  el.style.scrollSnapType = 'x mandatory';
                });
              }
            }}
            onScroll={handleScrollDetect}
            className="w-full relative h-[140px] bg-gray-950 flex overflow-x-auto rounded-t-2xl border-t border-gray-800 scrollbar-none snap-x snap-mandatory px-4"
          >
            <div className="flex relative h-full" style={{ width: '1408px' }}>
              {SLIDABLE_PIANO_KEYS.map((key, index) => {
                const topLabel = key.type === '主' ? '真ん中' : key.type === '低' ? '低音' : '高音';
                const labelColor = key.type === '主' ? 'text-teal-400 font-bold' : 'text-gray-400';
                return (
                  <div key={index} className="w-[64px] h-full relative shrink-0 snap-center">
                    <button onClick={() => handleInputNote(key.offset, key.octave)} disabled={isPlaying} className="w-full h-full bg-gray-100 hover:bg-white active:bg-blue-100 border-r border-gray-300 rounded-b-xl flex flex-col items-center justify-end pb-3 text-gray-950 font-black text-xs border-t-4 border-blue-400/40 shadow-inner">
                      <span className={`text-[7px] font-mono mb-0.5 ${labelColor}`}>{topLabel}</span>{key.label}
                    </button>
                    {key.hasBlack && (
                      <button onClick={() => handleInputNote(key.bOffset!, key.octave)} disabled={isPlaying} className="absolute top-0 right-[-16px] w-[32px] h-[55%] bg-gray-900 hover:bg-gray-800 active:bg-blue-600 rounded-b-lg shadow-2xl text-white font-bold text-[9px] flex items-end justify-center pb-1.5 border border-black z-10">{key.bLabel}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 
          ★「ディグる」ボタンを最下部へ自動で張り付かせる (mt-auto)
          これにより、上の要素がどれだけ窮屈でも、絶対に画面最下部にくっきり100%表示されます！
        */}
        <div className="shrink-0 mt-auto mb-2">
          <button 
            onClick={() => { stopPlayback(); navigate('/suggest', { state: { melodyGrid, currentMelodyId, bpm, manualTranspose: location.state?.manualTranspose, complexity: location.state?.complexity, playingId: location.state?.playingId } }); }} 
            disabled={melodyGrid.length === 0 || isPlaying} 
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-blue-500 disabled:from-gray-900 disabled:to-gray-900 disabled:text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-xl transition-all active:scale-[0.99]"
          >
            <Sparkles size={14} />
            <span>AIキー判定 ➔ コード進行をディグる ({melodyGrid.length}音)</span>
          </button>
        </div>
      </div>

      {/* 保存ダイアログモーダル */}
      {isSaveModalOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-xs shadow-2xl flex flex-col gap-4">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5"><Save size={16} className="text-blue-400" />メロディを資産保存</h4>
            <div className="flex flex-col gap-1">
              <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value.slice(0, 10))} placeholder="メロディ名を入力" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 text-center" />
              <div className="text-right text-[9px] text-gray-500 pr-1">{inputName.length}/10文字</div>
            </div>
            <div className="flex flex-col gap-2">
              {currentMelodyId ? (
                <>
                  <button onClick={() => executeSave('overwrite')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black transition-all text-white shadow-md">✨ 上書き保存</button>
                  <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all text-gray-300 border border-gray-700">別名で新しく保存</button>
                </>
              ) : (
                <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black transition-all text-white shadow-md">💾 保存する</button>
              )}
              <button onClick={() => setIsSaveModalOpen(false)} className="w-full py-2 bg-transparent text-gray-500 hover:text-gray-400 text-[10px] font-bold mt-1">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 一覧モーダル */}
      {isListOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] h-[85vh] mt-auto bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2 text-teal-400"><FolderHeart size={18} /><h3 className="font-black text-sm tracking-tight text-white">保存したメロディ資産 ({savedMelodies.length})</h3></div>
              <button onClick={() => setIsListOpen(false)} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500"><Music size={40} className="text-gray-700 mb-2" /><p className="text-xs font-bold">保存された資産がありません</p></div>
              ) : (
                savedMelodies.map((item) => (
                  <div key={item.id} onClick={() => handleLoadMelody(item)} className={`p-3 bg-gray-950 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${currentMelodyId === item.id ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.05)]' : 'border-gray-800/80'}`}>
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e)=>e.stopPropagation()}>
                          <input type="text" value={editingName} onChange={(e)=>setEditingName(e.target.value.slice(0,10))} className="bg-gray-900 border border-teal-500 rounded px-2 py-0.5 text-xs text-white max-w-[140px] focus:outline-none" />
                          <button onClick={(e)=>handleSaveRename(item.id, e)} className="p-1 bg-teal-600 rounded text-white"><Check size={10}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <h4 className="text-sm font-black text-gray-100 truncate">{item.title}</h4>
                          <button onClick={(e)=>handleStartRename(item.id, item.title, e)} className="p-1 text-gray-500 hover:text-teal-400 transition-colors"><Edit2 size={10}/></button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <span>音符数: {item.melodyGrid.filter(n=>n.midiNote!==0).length}音</span>
                        <span>•</span>
                        <span className="text-teal-400 font-bold font-mono">BPM {item.bpm || 110}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteMelody(item.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
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