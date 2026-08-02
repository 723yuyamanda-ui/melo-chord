// src/components/ChordSuggestionPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowLeft, ChevronDown, Music, Minus, Plus, FolderHeart, 
  Trash2, X, Save, Edit2, Check, Play, Pause, Volume2, VolumeX, Lightbulb, Mic
} from 'lucide-react';
import { generateAndScoreChords, ScoredChordResult } from '../lib/chordEngine';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { NoteData, SavedMelodyItem } from '../types';
import * as Tone from 'tone';

import ChordCard from './ChordCard';

const CATEGORIES = [
  { key: 'all', label: '全部みる' },
  { key: 'Chorus', label: 'サビ：感動' },
  { key: 'Verse', label: 'A/Bメロ：語り' },
  { key: 'Chill', label: 'Chill：洗練' }
];

export default function ChordSuggestionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { startSyncPlayback, stopPlayback, isPlaying, setDynamicDetune, isMelodyMuted, setIsMelodyMuted } = useAudioPlayer();

  const bars: number = location.state?.bars || 4;
  const maxStep = bars === 4 ? 80 : 144;
  const audioUrl: string | undefined = location.state?.audioUrl;

  const [playingId, setPlayingId] = useState<string | null>(() => location.state?.playingId || null);
  const [manualTranspose, setManualTranspose] = useState<number>(() => location.state?.manualTranspose || 0);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const displayMelodyTitle = useMemo(() => {
    if (location.state?.presetTitle) {
      return location.state.presetTitle;
    }
    if (currentMelodyId) {
      const found = savedMelodies.find(m => m.id === currentMelodyId);
      if (found) return found.title;
    }
    return '録音メロディ';
  }, [location.state?.presetTitle, currentMelodyId, savedMelodies]);

  useEffect(() => {
    if (location.state?.melodyGrid) {
      stopPlayback();
      setPlayingId(null);
      setMelodyGrid(location.state.melodyGrid);
      setCurrentMelodyId(location.state.currentMelodyId || null);
      if (location.state.bpm) setBpm(location.state.bpm);
      setManualTranspose(0);
      showToast(`メロディを切り替えました`);
    }
  }, [location.state?.keyTimestamp, location.state?.currentMelodyId]);

  // ★ 録音時の解析キー（detectedKeyName）があればそれを最優先採用！
  const { currentKeyName, allScoredSuggestions } = useMemo(() => {
    const adjustedGridForEngine = melodyGrid
      .filter(n => n.col >= 16)
      .map(n => ({ ...n, col: n.col - 16 }));

    const result = generateAndScoreChords(adjustedGridForEngine, manualTranspose);

    // 録音解析からのキー指定がある場合は優先表示
    const finalKeyName = location.state?.detectedKeyName
      ? location.state.detectedKeyName
      : result.currentKeyName;

    return {
      detectedKeyName: result.detectedKeyName,
      currentKeyName: finalKeyName,
      allScoredSuggestions: result.suggestions
    };
  }, [melodyGrid, manualTranspose, location.state?.detectedKeyName]);

  const visibleSuggestions = useMemo(() => {
    let result = [...allScoredSuggestions];
    if (selectedCategory !== 'all') {
      return result.filter(item => item.category === selectedCategory);
    } else {
      return isExpanded ? result : result.slice(0, 12);
    }
  }, [allScoredSuggestions, selectedCategory, isExpanded]);

  const currentActivePattern = useMemo(() => {
    if (!playingId) return null;
    return allScoredSuggestions.find(item => item.templateId === playingId) || null;
  }, [playingId, allScoredSuggestions]);

  const handleToggleCardPlay = async (id: string, resultItem: ScoredChordResult) => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }

    if (playingId === id && isPlaying) {
      stopPlayback();
      setPlayingId(null);
      setPlayback16th(startBarSelection);
    } else {
      setPlayingId(id);
      const targetChords = resultItem.chordsMap.Standard;
      const safeStartStep = hasPickupNotes ? startBarSelection : 16;

      await startSyncPlayback(
        melodyGrid, 
        targetChords, 
        (current16th) => { setPlayback16th(current16th); }, 
        manualTranspose, 
        bpm, 
        safeStartStep, 
        maxStep,
        audioUrl
      );

      setDynamicDetune(manualTranspose);
    }
  };

  const handleGlobalPlayerToggle = () => {
    if (!playingId || !currentActivePattern) return;
    handleToggleCardPlay(playingId, currentActivePattern);
  };

  const handleOpenSaveDialog = () => {
    if (melodyGrid.length === 0) { showToast("メロディが空です"); return; }
    setInputName(savedMelodies.find(m => m.id === currentMelodyId)?.title || `メロディ #${savedMelodies.length + 1}`);
    setIsSaveModalOpen(true);
  };

  const executeSave = (type: 'overwrite' | 'new') => {
    const nameToSave = inputName.trim().slice(0, 10) || `メロディ #${savedMelodies.length + 1}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let nextList = [...savedMelodies];
    if (type === 'overwrite' && currentMelodyId) {
      nextList = nextList.map(item => item.id === currentMelodyId ? { ...item, title: nameToSave, melodyGrid, bpm, audioUrl, savedAt: formattedDate } : item);
      showToast(`「${nameToSave}」を上書き保存しました`);
    } else {
      const newId = `melo-${Date.now()}`;
      const newItem: SavedMelodyItem = { id: newId, title: nameToSave, melodyGrid, bpm, audioUrl, savedAt: formattedDate };
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
    setPlayingId(null);
    const grid = item.melodyGrid;
    setMelodyGrid(grid);
    setCurrentMelodyId(item.id);
    if (item.bpm) setBpm(item.bpm);

    setIsListOpen(false);
    showToast(`「${item.title}」を読み込みました！`);
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

  const toggleBpm = () => {
    setBpm(prev => {
      let nextBpm = 110;
      if (prev === 85) nextBpm = 110;
      else if (prev === 110) nextBpm = 135;
      else if (prev === 135) nextBpm = 160;
      else nextBpm = 85;

      if (isPlaying) {
        Tone.Transport.bpm.value = nextBpm;
      }
      return nextBpm;
    });
    showToast("テンポを変更しました");
  };

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setIsExpanded(false);
  };

  const handleBack = () => {
    stopPlayback();
    if (location.state?.isFromPreset) {
      navigate('/preset-list');
    } else if (location.state?.isFromSaved) {
      navigate('/', { state: { openSavedList: true } });
    } else {
      navigate(-1);
    }
  };

  const handleGoToRecordPage = () => {
    stopPlayback();
    navigate('/audio-input');
  };

  useEffect(() => { return () => { stopPlayback(); }; }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gray-950 text-white select-none relative overflow-hidden">
      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[110] bg-teal-500/90 backdrop-blur-xl border border-teal-400/50 text-gray-950 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {toast}
        </div>
      )}

      {/* ─── 固定トップエリア ─── */}
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-2xl border-b border-white/10 z-30 flex flex-col shrink-0">
        
        {/* ヘッダー */}
        <header className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-white max-w-[160px] sm:max-w-[240px] truncate">
              {displayMelodyTitle}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold">
              <Sparkles size={10} />
              <span>コード進行一覧</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleGoToRecordPage}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Mic size={11} />
              <span className="hidden sm:inline">再録音</span>
            </button>

            <button onClick={handleOpenSaveDialog} className="flex flex-col items-center justify-center gap-0.5 text-blue-400 active:scale-95 transition-transform">
              <div className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><Save size={13} /></div>
              <span className="text-[8px] font-black tracking-tighter">保存</span>
            </button>
            
            <button onClick={() => setIsListOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-teal-400 active:scale-95 transition-transform relative lg:hidden">
              <div className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <FolderHeart size={13} />
              </div>
              <span className="text-[8px] font-black tracking-tighter">一覧</span>
              {savedMelodies.length > 0 && (
                <span className="absolute top-[-2px] right-[-2px] bg-red-500 rounded-full text-[7px] text-white font-black px-1 min-w-[11px] h-2.5 flex items-center justify-center border border-gray-950">
                  {savedMelodies.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ガイドバッジ */}
        <div className="px-4 py-1.5 bg-gradient-to-r from-teal-950/40 via-blue-950/40 to-teal-950/40 border-b border-teal-500/20 text-[10px] font-bold text-teal-300 text-center flex items-center justify-center gap-1.5 shrink-0">
          <Lightbulb size={12} className="text-amber-400" />
          <span>気になるコード進行を選んで「試聴」を押してみよう！</span>
        </div>

        {/* 移調・BPM コントロールパネル */}
        <div className="px-4 pt-2.5 pb-2.5 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-2 flex-1 max-w-[240px]">
            <Music size={12} className="text-gray-400 shrink-0" />
            <div className="flex items-center bg-gray-950/80 rounded-2xl border border-white/10 p-1 w-full h-10 justify-between shadow-inner">
              <button
                onClick={() => handleKeyShift(-1)}
                disabled={manualTranspose <= -12}
                className="w-8 h-full bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 disabled:opacity-20 rounded-xl font-black text-xs flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-mono font-black text-teal-400 text-center flex-1">
                {currentKeyName.replace(" Major", "")}
              </span>
              <button
                onClick={() => handleKeyShift(1)}
                disabled={manualTranspose >= 12}
                className="w-8 h-full bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 disabled:opacity-20 rounded-xl font-black text-xs flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <button
            onClick={toggleBpm}
            className="flex items-center bg-gray-950/80 hover:bg-white/5 px-3 rounded-2xl border border-white/10 h-10 min-w-[95px] justify-between shadow-md active:scale-95 transition-all"
          >
            <span className="text-[9px] font-mono font-black text-gray-500 tracking-wider uppercase">BPM</span>
            <span className="text-sm font-mono font-black text-amber-400 tracking-tight">{bpm}</span>
          </button>
        </div>

        {/* カテゴリセレクター */}
        <div className="py-2 flex flex-col bg-gray-950">
          <div className="flex gap-2 overflow-x-auto px-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-black border transition-all active:scale-95 ${
                  selectedCategory === cat.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/50 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── メインカードエリア ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 pb-24 scrollbar-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleSuggestions.map((result) => {
            const activeChords = result.chordsMap.Standard;
            return (
              <ChordCard
                key={result.templateId}
                pattern={{
                  id: result.templateId,
                  title: result.title,
                  description: result.description,
                  categoryLabel: result.categoryLabel,
                  rawScore: result.score,
                  tags: result.tags,
                  chords: activeChords
                }}
                isPlaying={playingId === result.templateId && isPlaying}
                onTogglePlay={() => handleToggleCardPlay(result.templateId, result)}
                currentKeyName={currentKeyName}
                currentPlayback16th={playingId === result.templateId ? playback16th : 0}
                bars={bars}
              />
            );
          })}
        </div>

        {selectedCategory === 'all' && !isExpanded && allScoredSuggestions.length > 12 && (
          <button onClick={() => setIsExpanded(true)} className="my-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 transition-all active:scale-[0.99]">
            <span>残りの進行もすべて表示する（全34パターン）</span><ChevronDown size={12} />
          </button>
        )}
      </div>

      {/* 固定ボトムコントローラー */}
      {playingId && currentActivePattern && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-md bg-gray-900/80 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl z-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-gray-950 shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                <Music size={14} fill="currentColor" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-black text-white truncate">{currentActivePattern.title}</span>
                <span className="text-[8px] font-bold text-amber-400/90 tracking-wider truncate uppercase mt-0.5">{currentActivePattern.categoryLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleGoToRecordPage} className="h-8 px-2.5 rounded-xl border border-white/10 bg-gray-950/80 text-[9px] font-black text-red-400 hover:text-red-300 transition-all flex items-center gap-1 active:scale-95">
                <Mic size={11} />
                <span>再録音</span>
              </button>

              <button onClick={() => setIsMelodyMuted(!isMelodyMuted)} className={`h-8 px-2.5 rounded-xl border text-[9px] font-black transition-all flex items-center gap-1 active:scale-95 ${isMelodyMuted ? 'bg-red-950/40 border-red-800/40 text-red-400' : 'bg-gray-950/80 border-white/10 text-teal-400'}`}>
                {isMelodyMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isMelodyMuted ? 'OFF' : 'ON'}</span>
              </button>
              
              <button onClick={handleGlobalPlayerToggle} className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-950 transition-all active:scale-95 shadow-md ${isPlaying ? 'bg-amber-400' : 'bg-white'}`}>
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保存モーダル */}
      {isSaveModalOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-5 w-full max-w-xs flex flex-col gap-4 shadow-2xl">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5"><Save size={16} className="text-blue-400" />メロディを資産保存</h4>
            <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value.slice(0, 10))} className="w-full bg-gray-950/80 border border-white/10 rounded-2xl px-3 py-2.5 text-xs font-bold text-white text-center focus:outline-none focus:border-blue-500" />
            <div className="flex flex-col gap-2">
              {currentMelodyId ? (
                <>
                  <button onClick={() => executeSave('overwrite')} className="w-full py-2.5 bg-blue-600 text-xs font-black rounded-2xl text-white shadow-lg active:scale-95 transition-all">上書き保存</button>
                  <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-white/10 text-xs font-bold rounded-2xl text-gray-200 border border-white/10 active:scale-95 transition-all">別名で新しく保存</button>
                </>
              ) : (
                <button onClick={() => executeSave('new')} className="w-full py-2.5 bg-blue-600 text-xs font-black rounded-2xl text-white shadow-lg active:scale-95 transition-all">保存する</button>
              )}
              <button onClick={() => setIsSaveModalOpen(false)} className="w-full py-2 text-gray-400 hover:text-gray-200 text-[10px] font-bold mt-1">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 一覧モーダル（スマホ用） */}
      {isListOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex flex-col animate-in fade-in duration-200 lg:hidden">
          <div className="w-full max-w-[430px] h-[85vh] mt-auto mx-auto bg-gray-900/90 border-t border-white/10 backdrop-blur-2xl rounded-t-3xl p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-teal-400"><FolderHeart size={18} /><h3 className="font-black text-sm tracking-tight text-white">保存したメロディ資産 ({savedMelodies.length})</h3></div>
              <button onClick={() => setIsListOpen(false)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500"><Music size={40} className="text-gray-700 mb-2" /><p className="text-xs font-bold">保存された資産がありません</p></div>
              ) : (
                savedMelodies.map((item) => (
                  <div key={item.id} onClick={() => handleLoadMelody(item)} className={`p-3.5 bg-gray-950/80 border rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${currentMelodyId === item.id ? 'border-teal-500/50' : 'border-white/5 hover:border-white/20'}`}>
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e)=>e.stopPropagation()}>
                          <input type="text" value={editingName} onChange={(e)=>setEditingName(e.target.value.slice(0,10))} className="bg-gray-900 border border-teal-500 rounded-lg px-2 py-0.5 text-xs text-white max-w-[140px] focus:outline-none" />
                          <button onClick={(e)=>handleSaveRename(item.id, e)} className="p-1 bg-teal-600 rounded-lg text-white"><Check size={10}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <h4 className="text-sm font-black text-gray-100 truncate">{item.title}</h4>
                          <button onClick={(e)=>handleStartRename(item.id, item.title, e)} className="p-1 text-gray-500 hover:text-teal-400 transition-colors"><Edit2 size={10}/></button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <span>音符数: {item.melodyGrid.filter(n=>n.midiNote!==0).length}音</span>
                        <span>•</span>
                        <span className="text-teal-400 font-bold font-mono">BPM {item.bpm || 110}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteMelody(item.id, e)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-gray-400 hover:text-red-400 shrink-0 transition-colors"><Trash2 size={14} /></button>
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