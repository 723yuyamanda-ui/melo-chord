// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderHeart, BookOpen, Music, Trash2, Edit2, Check, Play, 
  Rocket, History, HelpCircle
} from 'lucide-react';

import HomePage from './components/HomePage';
import InputSelectPage from './components/InputSelectPage';
import SimpleKeyboardInput from './components/SimpleKeyboardInput';
import ChordSuggestionPage from './components/ChordSuggestionPage';
import PresetListPage from './components/PresetListPage';
import LandingPage from './components/LandingPage';

import { SavedMelodyItem } from './types';
import { NEWS_ITEMS, ROADMAP_ITEMS } from './constants/news';

// ─── PC表示用：左サイドバー（保存メロディ資産） ───
function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const currentMelodyId = location.state?.currentMelodyId || null;

  const loadSavedData = () => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    loadSavedData();
    window.addEventListener('storage', loadSavedData);
    const interval = setInterval(loadSavedData, 1500);
    return () => {
      window.removeEventListener('storage', loadSavedData);
      clearInterval(interval);
    };
  }, []);

  const handleLoadMelody = (item: SavedMelodyItem) => {
    navigate('/suggest', {
      replace: location.pathname === '/suggest',
      state: {
        melodyGrid: item.melodyGrid,
        currentMelodyId: item.id,
        bpm: item.bpm || 110,
        bars: 4,
        keyTimestamp: Date.now()
      }
    });
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
    setSavedMelodies(nextList);
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList));
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 h-full bg-gray-900/60 backdrop-blur-2xl border-r border-white/10 p-4 shrink-0 overflow-hidden">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10 shrink-0 text-teal-400">
        <FolderHeart size={20} />
        <h3 className="font-black text-base tracking-tight text-white">保存したメロディ資産</h3>
        <span className="ml-auto text-xs font-mono font-bold bg-teal-950/80 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30">
          {savedMelodies.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-2.5 scrollbar-none pr-1">
        {savedMelodies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 gap-2">
            <Music size={36} className="text-gray-700" />
            <p className="text-xs font-bold">保存された資産がありません</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">鍵盤画面で作成したメロディを保存するとここに常時表示されます</p>
          </div>
        ) : (
          savedMelodies.map((item) => {
            const isActive = currentMelodyId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleLoadMelody(item)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all group border ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-950/80 to-gray-900/90 border-teal-400/80 shadow-[0_0_20px_rgba(45,212,191,0.25)] scale-[1.02] z-10'
                    : 'bg-gray-950/60 hover:bg-gray-900/80 border-white/5 hover:border-teal-500/40 shadow-sm'
                }`}
              >
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-1 py-0.5" onClick={(e)=>e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e)=>setEditingName(e.target.value.slice(0,10))}
                        className="bg-gray-900 border border-teal-500 rounded-lg px-2 py-0.5 text-xs text-white w-full focus:outline-none"
                      />
                      <button onClick={(e)=>handleSaveRename(item.id, e)} className="p-1 bg-teal-600 rounded-lg text-white shrink-0"><Check size={12}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-black truncate transition-colors ${isActive ? 'text-teal-300' : 'text-gray-200 group-hover:text-teal-300'}`}>
                        {item.title}
                      </h4>
                      {isActive && (
                        <span className="text-[9px] font-mono font-black text-teal-950 bg-teal-400 px-1.5 py-0.2 rounded font-bold animate-pulse">
                          ACTIVE
                        </span>
                      )}
                      {!isActive && (
                        <button onClick={(e) => handleStartRename(item.id, item.title, e)} className="p-1 text-gray-500 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={12}/></button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <span>{item.melodyGrid.filter(n=>n.midiNote!==0).length}音</span>
                    <span>•</span>
                    <span className="text-teal-400 font-bold font-mono">BPM {item.bpm || 110}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e)=>e.stopPropagation()}>
                  <button
                    onClick={() => handleLoadMelody(item)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors ${
                      isActive 
                        ? 'bg-teal-500 text-gray-950 border-teal-400 shadow-md' 
                        : 'bg-white/10 border-white/10 text-amber-400 hover:bg-white/20'
                    }`}
                    title="コード提案画面で聴く"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteMelody(item.id, e)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-gray-500 hover:text-red-400 transition-colors"
                    title="削除"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

// ─── PC表示用：右サイドバー（公式ノート & 使い方ガイド） ───
function RightSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-96 h-full bg-gray-900/60 backdrop-blur-2xl border-l border-white/10 p-4 shrink-0 overflow-y-auto scrollbar-none gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-400" size={20} />
          <h3 className="font-black text-base text-white">Melo Chord ガイド</h3>
        </div>
        <button
          onClick={() => navigate('/landing')}
          className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
        >
          公式ノート全ページへ →
        </button>
      </div>

      <div className="bg-gray-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <h4 className="text-xs lg:text-sm font-black text-teal-300 flex items-center gap-1.5">
          <HelpCircle size={15} /> 3ステップクイックガイド
        </h4>
        <div className="flex flex-col gap-2.5 text-xs lg:text-sm">
          <div className="flex gap-2.5 items-start">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">1</span>
            <p className="text-xs lg:text-sm text-gray-300 leading-snug">「ドレミ」でメロディを入力</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">2</span>
            <p className="text-xs lg:text-sm text-gray-300 leading-snug">全34パターンのコード進行を自動判定</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">3</span>
            <p className="text-xs lg:text-sm text-gray-300 leading-snug">リアルタイム試聴＆キー・テンポ調整</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <History size={14} className="text-purple-400" /> 最新アップデート & 開発ログ
        </h4>
        {NEWS_ITEMS.slice(0, 2).map((item) => (
          <div key={item.id} className="p-3.5 bg-gray-950/60 border border-white/5 rounded-2xl flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gray-500">{item.date}</span>
              {item.isMajor && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  MAJOR
                </span>
              )}
            </div>
            <h5 className="text-xs lg:text-sm font-black text-gray-200">{item.title}</h5>
            <p className="text-xs text-gray-400 leading-relaxed">{item.summary}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Rocket size={14} className="text-amber-400" /> 今後の追加予定機能
        </h4>
        {ROADMAP_ITEMS.slice(0, 3).map((item, idx) => (
          <div key={idx} className="p-3.5 bg-gray-950/40 border border-white/5 rounded-2xl flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                {item.tag || '開発中'}
              </span>
            </div>
            <h5 className="text-xs lg:text-sm font-black text-gray-300">{item.title}</h5>
            <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function MusicApp() {
  return (
    <BrowserRouter>
      <div className="h-[100dvh] lg:h-screen w-full bg-gray-950 flex justify-center items-center overflow-hidden font-sans select-none relative pt-[env(safe-area-inset-top)]">
        <div className="w-full max-w-[430px] lg:max-w-[1400px] h-full lg:h-[95vh] bg-gray-950/80 backdrop-blur-2xl shadow-2xl relative text-white overflow-hidden lg:rounded-3xl lg:border lg:border-white/10 lg:shadow-teal-950/30 flex">
          
          <LeftSidebar />

          <main className="flex-1 h-full overflow-hidden relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/input-select" element={<InputSelectPage />} />
              <Route path="/keyboard" element={<SimpleKeyboardInput />} />
              <Route path="/preset-list" element={<PresetListPage />} />
              <Route path="/suggest" element={<ChordSuggestionPage />} />
              <Route path="/landing" element={<LandingPage />} />
            </Routes>
          </main>

          <RightSidebar />

        </div>
      </div>
    </BrowserRouter>
  );
}