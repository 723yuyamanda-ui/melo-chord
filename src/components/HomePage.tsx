// src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderHeart, Music, Play, Trash2, X, Edit2, Check, 
  HelpCircle, MessageSquare, Sparkles, Bell, ArrowRight, Rocket, Mic
} from 'lucide-react';
import { SavedMelodyItem } from '../types';
import { NEWS_ITEMS } from '../constants/news';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListOpen, setIsListOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const latestMajorNews = NEWS_ITEMS.find(item => item.isMajor);

  useEffect(() => {
    if (location.state?.openSavedList) {
      setIsListOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); }
    }

    const hasVisited = localStorage.getItem('easyComposer_has_visited');
    if (!hasVisited) {
      setIsGuideOpen(true);
      localStorage.setItem('easyComposer_has_visited', 'true');
    } else {
      const lastSeenId = localStorage.getItem('easyComposer_last_seen_news_id');
      if (latestMajorNews && lastSeenId !== latestMajorNews.id) {
        setIsNewsOpen(true);
      }
    }
  }, [isListOpen]);

  const handleCloseNewsModal = () => {
    if (latestMajorNews) {
      localStorage.setItem('easyComposer_last_seen_news_id', latestMajorNews.id);
    }
    setIsNewsOpen(false);
  };

  const handleLoadMelody = (item: SavedMelodyItem) => {
    navigate('/suggest', {
      replace: location.pathname === '/suggest',
      state: {
        melodyGrid: item.melodyGrid,
        currentMelodyId: item.id,
        bpm: item.bpm || 110,
        bars: 4,
        audioUrl: item.audioUrl,
        keyTimestamp: Date.now(),
        isFromSaved: true
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
    <div className="h-full w-full bg-gradient-to-b from-gray-950 via-gray-950 to-indigo-950/30 text-white flex flex-col items-center justify-center p-6 lg:p-12 select-none relative overflow-y-auto lg:overflow-hidden">
      
      {/* ─── 右上のサポート・お知らせUI ─── */}
      <div className="absolute top-4 right-4 lg:top-6 lg:right-6 flex items-center gap-2 lg:gap-3 z-50">
        <button 
          onClick={() => setIsNewsOpen(true)}
          className="p-2 lg:px-3.5 lg:py-2 bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/80 border border-white/10 rounded-2xl text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg relative active:scale-95"
        >
          <Bell size={15} className="text-amber-400" />
          <span>お知らせ</span>
          {latestMajorNews && localStorage.getItem('easyComposer_last_seen_news_id') !== latestMajorNews.id && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        <button 
          onClick={() => setIsGuideOpen(true)}
          className="p-2 lg:px-3.5 lg:py-2 bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/80 border border-white/10 rounded-2xl text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg active:scale-95"
        >
          <HelpCircle size={15} className="text-blue-400" />
          <span>使い方</span>
        </button>
        
        <a 
          href="https://forms.gle/AD5RBqjKNUmbkw2z6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 lg:px-3.5 lg:py-2 bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/80 border border-white/10 rounded-2xl text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg active:scale-95"
        >
          <MessageSquare size={15} className="text-teal-400" />
          <span>ご意見箱</span>
        </a>
      </div>

      {/* ─── メインカードコンテナ ─── */}
      <div className="w-full max-w-sm lg:max-w-md bg-transparent lg:bg-gray-900/40 lg:backdrop-blur-2xl lg:border lg:border-white/10 lg:p-10 lg:rounded-3xl lg:shadow-2xl flex flex-col items-center my-auto">
        
        {/* メインロゴ・キャッチコピー */}
        <div className="text-center flex flex-col gap-3 mb-8 lg:mb-10 animate-in fade-in zoom-in-95 duration-300">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 italic">
            Melo Chord
            <span className="text-sm lg:text-base ml-1.5 font-bold not-italic inline-block align-middle">
              (ベータ版)
            </span>
          </h1>
          <p className="text-xs lg:text-sm font-bold text-gray-400 tracking-widest uppercase">
            鼻歌や演奏から<br />コード進行を自動提案
          </p>
        </div>

        {/* メインメニューボタン群 */}
        <div className="w-full flex flex-col gap-3.5 z-10">
          <button 
            onClick={() => navigate('/audio-input')} 
            className="w-full py-4 lg:py-4.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-2xl font-black text-sm lg:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-red-600/20 text-white border border-red-400/20"
          >
            <Mic size={18} strokeWidth={2.5} />
            <span>新しく作る（鼻歌・生音録音）</span>
          </button>

          <button 
            onClick={() => navigate('/preset-list')} 
            className="w-full py-4 lg:py-4.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-2xl font-black text-sm lg:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-teal-600/20 text-white border border-teal-400/20"
          >
            <Sparkles size={18} />
            <span>デモ曲で試す</span>
          </button>

          <button 
            onClick={() => setIsListOpen(true)} 
            className="w-full py-4 lg:py-4.5 bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/80 border border-white/10 rounded-2xl font-bold text-sm lg:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
          >
            <FolderHeart size={16} className="text-teal-400" />
            <span>保存した曲 ({savedMelodies.length})</span>
          </button>
        </div>
      </div>

      {/* ─── お知らせモーダル ─── */}
      {isNewsOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[390px] lg:max-w-md bg-gray-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-5 lg:p-6 flex flex-col shadow-2xl relative max-h-[85vh]">
            <button 
              onClick={handleCloseNewsModal} 
              className="absolute top-4 right-4 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-amber-400" />
              <h3 className="font-black text-base text-white">お知らせ・アップデート情報</h3>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-none my-1 pr-1">
              {NEWS_ITEMS.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 bg-gray-950/80 border border-white/5 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gray-500">{item.date}</span>
                    {item.isMajor && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                        MAJOR UPDATE
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs lg:text-sm font-black text-white leading-snug">{item.title}</h4>
                  <p className="text-[11px] lg:text-xs text-gray-400 leading-relaxed font-medium">{item.summary}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2 mt-2">
              <button 
                onClick={() => {
                  handleCloseNewsModal();
                  navigate('/landing');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-2xl font-black text-xs lg:text-sm text-gray-950 flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-[0.98]"
              >
                <span>公式ノート</span>
                <ArrowRight size={14} />
              </button>

              <button 
                onClick={handleCloseNewsModal}
                className="w-full py-2 text-gray-500 hover:text-gray-300 text-[11px] lg:text-xs font-bold text-center"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 使い方ガイドモーダル ─── */}
      {isGuideOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] lg:max-w-md bg-gray-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 flex flex-col shadow-2xl relative">
            <button 
              onClick={() => setIsGuideOpen(false)} 
              className="absolute top-4 right-4 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            <div className="text-center mb-6">
              <span className="text-xs font-bold px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">Beta Release</span>
              <h3 className="font-black text-lg lg:text-xl text-white mt-2.5 flex items-center justify-center gap-2">
                <Rocket size={20} className="text-teal-400" />
                <span>3ステップ作曲ガイド</span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white shadow-md">1</div>
                <div>
                  <h4 className="font-bold text-gray-200">鼻歌や生音をマイクで録音</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">頭に浮かんだフレーズをテンポに合わせてマイクに向かって歌うだけ！</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white shadow-md">2</div>
                <div>
                  <h4 className="font-bold text-gray-200">AIが音階＆キーを自動解析</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">あなたの歌声からキー（調）や音の構成を自動判定し、最適なコード進行を一覧表示。</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white shadow-md">3</div>
                <div>
                  <h4 className="font-bold text-gray-200">自分の声と一緒にコード試聴！</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">提案されたコードと一緒に自分の録音音声が鳴ります。Keyシフト（移調）にも声がリアルタイム追従！</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsGuideOpen(false)}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black text-sm text-white shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              作曲をはじめる！
            </button>
          </div>
        </div>
      )}

      {/* ─── 保存した曲一覧モーダル ─── */}
      {isListOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] lg:max-w-md h-[85vh] lg:h-[70vh] my-auto mx-auto bg-gray-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-5 lg:p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-teal-400">
                <FolderHeart size={18} />
                <h3 className="font-black text-sm tracking-tight text-white">保存したメロディ ({savedMelodies.length})</h3>
              </div>
              <button onClick={() => setIsListOpen(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <Music size={40} className="text-gray-700 mb-2" />
                  <p className="text-xs font-bold">保存されたメロディがありません</p>
                </div>
              ) : (
                savedMelodies.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadMelody(item)} 
                    className="p-3.5 bg-gray-950/80 border border-white/5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-teal-500/40"
                  >
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e)=>e.stopPropagation()}>
                          <input type="text" value={editingName} onChange={(e)=>setEditingName(e.target.value.slice(0,10))} className="bg-gray-900 border border-teal-500 rounded-lg px-2 py-0.5 text-xs text-white max-w-[140px] focus:outline-none" />
                          <button onClick={(e)=>handleSaveRename(item.id, e)} className="p-1 bg-teal-600 rounded-lg text-white"><Check size={10}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <h4 className="text-sm font-black text-gray-100 truncate">{item.title}</h4>
                          <button onClick={(e) => handleStartRename(item.id, item.title, e)} className="p-1 text-gray-500 hover:text-teal-400 transition-colors"><Edit2 size={10}/></button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <span>音符数: {item.melodyGrid.filter(n=>n.midiNote!==0).length}音</span>
                        <span>•</span>
                        <span className="text-teal-400 font-bold font-mono">BPM {item.bpm || 110}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e)=>e.stopPropagation()}>
                      <button onClick={() => handleLoadMelody(item)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 border border-white/10 text-amber-400 hover:bg-gray-800 transition-colors"><Play size={12} fill="currentColor" /></button>
                      <button onClick={(e) => handleDeleteMelody(item.id, e)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 border border-white/10 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
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