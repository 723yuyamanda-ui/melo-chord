// src/components/ChordSuggestionPage.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ChevronDown, Music, Undo2, Minus, Plus, FolderHeart, Trash2, X, Save, Edit2, Check, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { generateAndScoreChords, ScoredChordResult } from '../lib/chordEngine';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { NoteData, SavedMelodyItem } from '../types';

import ChordCard from './ChordCard';

const GENRES = [
  { key: 'all', label: '全部みる' },
  { key: 'pop', label: '👑 王道・J-POP' },
  { key: 'positive', label: '☀️ ポジティブ' },
  { key: 'emotional', label: '🌃 切ない・エモ' },
  { key: 'anime', label: '✨ アニソン劇的' },
  { key: 'urban', label: '🍸 アーバンお洒落' }
];

export default function ChordSuggestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { startSyncPlayback, stopPlayback, isPlaying, setDynamicDetune, isMelodyMuted, setIsMelodyMuted } = useAudioPlayer();

  const [playingId, setPlayingId] = useState<string | null>(() => location.state?.playingId || null);
  const [manualTranspose, setManualTranspose] = useState<number>(() => location.state?.manualTranspose || 0);
  const [complexity, setComplexity] = useState<'Simple' | 'Standard' | 'Rich'>(() => location.state?.complexity || 'Standard');

  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitialGrid = (): NoteData[] => {
    return location.state?.melodyGrid || [];
  };

  const [melodyGrid, setMelodyGrid] = useState<NoteData[]>(getInitialGrid);

  const hasPickupNotes = useMemo(() => {
    return melodyGrid.some(note => note.col < 16 && note.midiNote !== 0);
  }, [melodyGrid]);

  const [startBarSelection] = useState<number>(() => {
    const grid = getInitialGrid();
    return grid.some(note => note.col < 16 && note.midiNote !== 0) ? 0 : 16;
  });

  const [playback16th, setPlayback16th] = useState<number>(() => {
    const grid = getInitialGrid();
    return grid.some(note => note.col < 16 && note.midiNote !== 0) ? 0 : 16;
  });

  const [currentMelodyId, setCurrentMelodyId] = useState<string | null>(() => location.state?.currentMelodyId || null);
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [inputName, setInputName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [bpm, setBpm] = useState<number>(() => location.state?.bpm || 110);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); }
    }
  }, [isListOpen, isSaveModalOpen]);

  const { detectedKeyName, currentKeyName, allScoredSuggestions } = useMemo(() => {
    const adjustedGridForEngine = melodyGrid
      .filter(n => n.col >= 16)
      .map(n => ({ ...n, col: n.col - 16 })); 

    const result = generateAndScoreChords(adjustedGridForEngine, manualTranspose);
    return {
      detectedKeyName: result.detectedKeyName,
      currentKeyName: result.currentKeyName,
      allScoredSuggestions: result.suggestions
    };
  }, [melodyGrid, manualTranspose]);

  const transposedMelodyGrid = useMemo(() => {
    if (manualTranspose === 0) return melodyGrid;
    return melodyGrid.map(note => {
      if (note.midiNote === 0) return note;
      return { ...note, midiNote: note.midiNote + manualTranspose };
    });
  }, [melodyGrid, manualTranspose]);

  const visibleSuggestions = useMemo(() => {
    let result = [...allScoredSuggestions];
    if (selectedGenre !== 'all') {
      return result.filter(item => item.genre === selectedGenre);
    } else {
      return isExpanded ? result : result.slice(0, 12);
    }
  }, [allScoredSuggestions, selectedGenre, isExpanded]);

  const currentActivePattern = useMemo(() => {
    if (!playingId) return null;
    return allScoredSuggestions.find(item => item.templateId === playingId) || null;
  }, [playingId, allScoredSuggestions]);

  const handleToggleCardPlay = async (id: string, resultItem: ScoredChordResult) => {
    if (playingId === id && isPlaying) {
      stopPlayback();
      setPlayingId(null);
      setPlayback16th(startBarSelection);
    } else {
      setPlayingId(id);
      const targetChords = resultItem.chordsMap[complexity];
      const safeStartStep = hasPickupNotes ? startBarSelection : 16;
      
      await startSyncPlayback(transposedMelodyGrid, targetChords, (current16th) => {
        setPlayback16th(current16th);
      }, manualTranspose, bpm, safeStartStep);
      
      setDynamicDetune(manualTranspose);
    }
  };

  const handleGlobalPlayerToggle = () => {
    if (!playingId || !currentActivePattern) return;
    handleToggleCardPlay(playingId, currentActivePattern);
  };

  const handleOpenSaveDialog = () => {
    if (melodyGrid.length === 0) { showToast("⚠️ メロディが空です"); return; }
    setInputName(savedMelodies.find(m => m.id === currentMelodyId)?.title || `メロディ #${savedMelodies.length + 1}`);
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
    setPlayingId(null);
    const grid = item.melodyGrid;
    setMelodyGrid(grid);
    setCurrentMelodyId(item.id);
    if (item.bpm) setBpm(item.bpm);
    
    setIsListOpen(false);
    showToast(`📂 「${item.title}」を読み込みました！`);
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); setEditingItemId(id); setEditingName(currentTitle);
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

  const handleKeyShift = (amount: number) => {
    setManualTranspose(prev => {
      let next = prev + amount;
      if (next > 12) next = 12;
      if (next < -12) next = -12;
      if (isPlaying) setDynamicDetune(next);
      return next;
    });
  };

  // ★ 進行ハンティング画面用：4速トグル循環＆安全な再生リセットロジック
  const toggleBpm = () => {
    if (isPlaying) {
      stopPlayback();
      setPlayingId(null);
      setPlayback16th(startBarSelection);
    }
    setBpm(prev => {
      if (prev === 85) return 110;
      if (prev === 110) return 135;
      if (prev === 135) return 160;
      return 85;
    });
    showToast("🕒 テンポを変更しました");
  };

  const handleGenreChange = (genreKey: string) => {
    stopPlayback(); setPlayingId(null); setPlayback16th(startBarSelection); setSelectedGenre(genreKey); setIsExpanded(false); 
  };

  useEffect(() => { return () => { stopPlayback(); }; }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-950 text-white select-none relative overflow-hidden">
      {toast && <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[110] bg-teal-500 border border-teal-400 text-gray-950 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl">{toast}</div>}

      <div className="sticky top-0 bg-gray-950/95 backdrop-blur-md border-b border-gray-900 z-30 flex flex-col shrink-0">
        <header className="px-4 py-2 border-b border-gray-900/50 flex items-center justify-between">
          <button onClick={() => { stopPlayback(); navigate('/keyboard', { state: { melodyGrid, currentMelodyId, bpm, manualTranspose, complexity } }); }} className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full text-gray-400"><ArrowLeft size={16} /></button>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-teal-400" />
            <span className="font-black text-xs bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">進行ハンティング</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleOpenSaveDialog} className="flex flex-col items-center justify-center gap-0.5 text-blue-400 active:scale-95 transition-transform">
              <div className="w-7 h-7 flex items-center justify-center bg-gray-900 rounded-xl"><Save size={13} /></div>
              <span className="text-[8px] font-black tracking-tighter">保存</span>
            </button>
            <button onClick={() => setIsListOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-teal-400 active:scale-95 transition-transform relative">
              <div className="w-7 h-7 flex items-center justify-center bg-gray-900 rounded-xl">
                <FolderHeart size={13} />
              </div>
              <span className="text-[8px] font-black tracking-tighter">一覧</span>
              {savedMelodies.length > 0 && <span className="absolute top-[-2px] right-[-2px] bg-red-500 rounded-full text-[7px] text-white font-black px-1 min-w-[11px] h-2.5 flex items-center justify-center border border-gray-950">{savedMelodies.length}</span>}
            </button>
          </div>
        </header>

        {/* 左右対称の大型「コントロールパネル」 */}
        <div className="px-4 pt-3 pb-3 border-b border-gray-900/50 flex items-center justify-between bg-gray-900/10 gap-3">
          
          {/* 左：大型化したチャンキー型キー移調パネル */}
          <div className="flex items-center gap-2 flex-1 max-w-[210px]">
            <Music size={12} className="text-gray-500 shrink-0" />
            <div className="flex items-center bg-gray-950 rounded-xl border border-gray-800/80 p-1 w-full h-11 justify-between shadow-inner">
              <button 
                onClick={() => handleKeyShift(-1)} 
                disabled={manualTranspose <= -12} 
                className="w-9 h-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 disabled:opacity-20 rounded-lg font-black text-sm flex items-center justify-center transition-colors active:scale-95 shadow-sm"
              >
                <Minus size={13} />
              </button>
              <span className="text-[15px] font-mono font-black text-teal-400 text-center flex-1">
                {currentKeyName.replace(" Major", "")}
              </span>
              <button 
                onClick={() => handleKeyShift(1)} 
                disabled={manualTranspose >= 12} 
                className="w-9 h-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 disabled:opacity-20 rounded-lg font-black text-sm flex items-center justify-center transition-colors active:scale-95 shadow-sm"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* ★ 右：タップしてその場で変更できる、インタラクティブ・トグル型BPMパネルへ換装 */}
          <button 
            onClick={toggleBpm}
            className="flex items-center bg-gray-950 hover:bg-gray-900/60 px-3 rounded-xl border border-gray-800/80 h-11 min-w-[105px] justify-between shadow-md active:scale-95 transition-all"
          >
            <span className="text-[9px] font-mono font-black text-gray-500 tracking-wider uppercase">BPM</span>
            <span className="text-base font-mono font-black text-yellow-400 tracking-tight">{bpm}</span>
          </button>

        </div>

        {/* ジャンル・属性セレクター */}
        <div className="py-2.5 flex flex-col gap-2.5 bg-gray-950">
          <div className="flex gap-2 overflow-x-auto px-3 scrollbar-none">
            {GENRES.map((genre) => (
              <button 
                key={genre.key} 
                onClick={() => handleGenreChange(genre.key)} 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-black border transition-all active:scale-95 ${
                  selectedGenre === genre.key 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md shadow-blue-600/10' 
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>
          
          <div className="px-3">
            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900 gap-1 shadow-inner">
              {(['Simple', 'Standard', 'Rich'] as const).map((mode) => (
                <button 
                  key={mode} 
                  onClick={() => setComplexity(mode)} 
                  className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all active:scale-[0.99] ${
                    complexity === mode 
                      ? 'bg-gray-900 text-yellow-400 border border-gray-800/80 shadow-md shadow-black/40' 
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {mode === 'Simple' ? '三和音' : mode === 'Standard' ? 'セブンス' : '豪華(オンコード)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* メインリスト */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2.5 pb-24 scrollbar-none">
        {visibleSuggestions.map((result) => {
          const activeChords = result.chordsMap[complexity];
          return (
            <ChordCard 
              key={result.templateId} 
              pattern={{ id: result.templateId, title: result.title, genre: result.genreLabel, rawScore: result.score, tags: result.tags, description: '', chords: activeChords }} 
              isPlaying={playingId === result.templateId && isPlaying}
              onTogglePlay={() => handleToggleCardPlay(result.templateId, result)}
              currentKeyName={currentKeyName}
              currentPlayback16th={playingId === result.templateId ? (playback16th < 16 ? -1 : playback16th - 16) : 0} 
              startBarSelection={startBarSelection}
            />
          );
        })}

        {selectedGenre === 'all' && !isExpanded && allScoredSuggestions.length > 12 && (
          <button onClick={() => setIsExpanded(true)} className="my-1 py-2.5 bg-gray-900/40 border border-gray-800/60 rounded-xl text-[10px] font-bold text-blue-400 flex items-center justify-center gap-1">
            <span>残りの進行もすべて表示する（全25パターン）</span><ChevronDown size={12} />
          </button>
        )}
      </div>

      {/* 固定ボトムコントローラー */}
      {playingId && currentActivePattern && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] bg-gray-900/90 backdrop-blur-lg border border-amber-500/40 rounded-xl p-2.5 shadow-2xl z-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-gray-950 shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}><Music size={14} fill="currentColor" /></div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-black text-white truncate">{currentActivePattern.title}</span>
                <span className="text-[8px] font-bold text-amber-400/80 tracking-wider truncate uppercase mt-0.5">{currentActivePattern.genreLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setIsMelodyMuted(!isMelodyMuted)} className={`h-8 px-2 rounded-lg border text-[9px] font-black transition-all flex items-center gap-1 ${isMelodyMuted ? 'bg-red-950/30 border-red-900/40 text-red-400' : 'bg-gray-950 border-gray-800 text-teal-400'}`}>
                {isMelodyMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isMelodyMuted ? 'メロディOFF' : 'メロディON'}</span>
              </button>
              <button onClick={handleGlobalPlayerToggle} className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-950 transition-all active:scale-95 ${isPlaying ? 'bg-amber-400' : 'bg-white'}`}>
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保存モーダル */}
      {isSaveModalOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5"><Save size={16} className="text-blue-400" />メロディを資産保存</h4>
            <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value.slice(0, 10))} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white text-center focus:outline-none focus:border-blue-500" />
            <div className="flex flex-col gap-2">
              {currentMelodyId ? (
                <>
                  <button onClick={() => executeSave('overwrite')} className="w-full py-2.5 bg-blue-600 text-xs font-black rounded-xl text-white">✨ 上書き保存</button>
                  <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-gray-800 text-xs font-bold rounded-xl text-gray-300 border border-gray-700">別名で新しく保存</button>
                </>
              ) : (
                <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-blue-600 text-xs font-black rounded-xl text-white">💾 保存する</button>
              )}
              <button onClick={() => setIsSaveModalOpen(false)} className="w-full py-2 text-gray-500 text-[10px] font-bold mt-1">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 一覧モーダル */}
      {isListOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] h-[85vh] mt-auto mx-auto bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2 text-teal-400"><FolderHeart size={18} /><h3 className="font-black text-sm tracking-tight text-white">保存したメロディ資産 ({savedMelodies.length})</h3></div>
              <button onClick={() => setIsListOpen(false)} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500"><Music size={40} className="text-gray-700 mb-2" /><p className="text-xs font-bold">保存された資産がありません</p></div>
              ) : (
                savedMelodies.map((item) => (
                  <div key={item.id} onClick={() => handleLoadMelody(item)} className={`p-3 bg-gray-950 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${currentMelodyId === item.id ? 'border-teal-500/50' : 'border-gray-800/80'}`}>
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