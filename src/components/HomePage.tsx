// src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderHeart, Music, Play, Trash2, X, Edit2, Check, HelpCircle, MessageSquare } from 'lucide-react';
import { SavedMelodyItem } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [isListOpen, setIsListOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false); // 使い方ガイドの開閉
  const [savedMelodies, setSavedMelodies] = useState<SavedMelodyItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // ローカルストレージから保存されたメロディ一覧を読み込む[cite: 2]
  useEffect(() => {
    const localData = localStorage.getItem('easyComposer_saved_melodies');
    if (localData) {
      try { setSavedMelodies(JSON.parse(localData)); } catch (e) { console.error(e); } //[cite: 2]
    }

    // ★ 初回訪問時のみ自動で使い方ガイドを開くロジック
    const hasVisited = localStorage.getItem('easyComposer_has_visited');
    if (!hasVisited) {
      setIsGuideOpen(true);
      localStorage.setItem('easyComposer_has_visited', 'true');
    }
  }, [isListOpen]); // モーダルが開くたびに最新状態を同期[cite: 2]

  // 保存したメロディをロードして直接「進行ハンティング」画面へジャンプする処理[cite: 2]
  const handleLoadMelody = (item: SavedMelodyItem) => {
    setIsListOpen(false); //[cite: 2]
    navigate('/suggest', {  //[cite: 2]
      state: {  //[cite: 2]
        melodyGrid: item.melodyGrid,  //[cite: 2]
        currentMelodyId: item.id,  //[cite: 2]
        bpm: item.bpm || 110  //[cite: 2]
      }  //[cite: 2]
    }); //[cite: 2]
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); //[cite: 2]
    setEditingItemId(id); //[cite: 2]
    setEditingName(currentTitle); //[cite: 2]
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); //[cite: 2]
    const cleanName = editingName.trim().slice(0, 10) || "無題"; //[cite: 2]
    const nextList = savedMelodies.map(item => item.id === id ? { ...item, title: cleanName } : item); //[cite: 2]
    setSavedMelodies(nextList); //[cite: 2]
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList)); //[cite: 2]
    setEditingItemId(null); //[cite: 2]
  };

  const handleDeleteMelody = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); //[cite: 2]
    const nextList = savedMelodies.filter(item => item.id !== id); //[cite: 2]
    setSavedMelodies(nextList); //[cite: 2]
    localStorage.setItem('easyComposer_saved_melodies', JSON.stringify(nextList)); //[cite: 2]
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-gray-950 to-indigo-950/30 text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      
      {/* ─── 右上のサポート・フィードバックUI ─── */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="p-2 bg-gray-900/80 border border-gray-800 rounded-xl text-gray-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
        >
          <HelpCircle size={15} className="text-blue-400" />
          <span>使い方</span>
        </button>
        
        {/* フィードバック用外部リンク */}
        <a 
          href="https://forms.gle/AD5RBqjKNUmbkw2z6" // ※実際のフォームURL等へ差し替えてください
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-gray-900/80 border border-gray-800 rounded-xl text-gray-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
        >
          <MessageSquare size={15} className="text-teal-400" />
          <span>ご意見箱</span>
        </a>
      </div>

      {/* ─── メインロゴ・キャッチコピー ─── */}
      <div className="text-center flex flex-col gap-3 mb-12 animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 italic">
          Melo Chord
          <span className="text-base ml-1 font-bold not-italic inline-block align-middle">
            (ベータ版)
        </span>
        </h1>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
          メロディから<br />コード進行を提案
        </p>
      </div>

      {/* ─── メインメニューボタン群 ─── */}
      <div className="w-full max-w-xs flex flex-col gap-3.5 z-10">
        <button 
          onClick={() => navigate('/keyboard')} 
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/10"
        >
          <Plus size={16} strokeWidth={3} />
          <span>新しく作る</span>
        </button>

        <button 
          onClick={() => setIsListOpen(true)} 
          className="w-full py-4 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <FolderHeart size={16} className="text-teal-400" />
          <span>保存した曲</span>
        </button>
      </div>

      {/* ─── 使い方ガイドモーダル（ポップアップ） ─── */}
      {isGuideOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col shadow-2xl relative">
            
            <button 
              onClick={() => setIsGuideOpen(false)} 
              className="absolute top-4 right-4 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>

            <div className="text-center mb-6">
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">Beta Release</span>
              <h3 className="font-black text-lg text-white mt-2">🚀 3ステップ作曲ガイド</h3>
            </div>
            
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white">1</div>
                <div>
                  <h4 className="font-bold text-gray-200">「ドレミ」でメロディを入力</h4>
                  <p className="text-xs text-gray-400 mt-0.5">鍵盤画面で、あなたの思いついたメロディを直感的に並べてみましょう！</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white">2</div>
                <div>
                  <h4 className="font-bold text-gray-200">メロディからコード進行を自動生成</h4>
                  <p className="text-xs text-gray-400 mt-0.5">AIがキー（調）を自動検知。ポップ、エモ、アニソンなどから世界観を選びます。</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-white">3</div>
                <div>
                  <h4 className="font-bold text-gray-200">伴奏を聴いて楽しむ！</h4>
                  <p className="text-xs text-gray-400 mt-0.5">提案されたいろんなパターンの進行を再生。キーやテンポも変更できます。</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsGuideOpen(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-[0.98]"
            >
              作曲をはじめる！
            </button>
          </div>
        </div>
      )}

      {/* ─── 保存した曲一覧モーダル（既存） ─── */}
      {isListOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] h-[85vh] mt-auto mx-auto bg-gray-900 border-t border-gray-800 rounded-t-3xl p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2 text-teal-400">
                <FolderHeart size={18} />
                <h3 className="font-black text-sm tracking-tight text-white">保存したメロディ資産 ({savedMelodies.length})</h3>
              </div>
              <button onClick={() => setIsListOpen(false)} className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none">
              {savedMelodies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <Music size={40} className="text-gray-700 mb-2" />
                  <p className="text-xs font-bold">保存された資産がありません</p>
                </div>
              ) : (
                savedMelodies.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadMelody(item)} 
                    className="p-3 bg-gray-950 border border-gray-800/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-teal-500/30"
                  >
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e)=>e.stopPropagation()}>
                          <input type="text" value={editingName} onChange={(e)=>setEditingName(e.target.value.slice(0,10))} className="bg-gray-900 border border-teal-500 rounded px-2 py-0.5 text-xs text-white max-w-[140px] focus:outline-none" />
                          <button onClick={(e)=>handleSaveRename(item.id, e)} className="p-1 bg-teal-600 rounded text-white"><Check size={10}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <h4 className="text-sm font-black text-gray-100 truncate">{item.title}</h4>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/keyboard', { state: { melodyGrid: item.melodyGrid, currentMelodyId: item.id, bpm: item.bpm } });
                            }} 
                            className="p-1 text-[10px] text-gray-500 hover:text-blue-400 font-bold ml-1 flex items-center gap-0.5"
                          >
                            <Edit2 size={9}/>鍵盤で修正
                          </button>

                          <button onClick={(e) => handleStartRename(item.id, item.title, e)} className="p-1 text-gray-500 hover:text-teal-400 transition-colors"><Edit2 size={10}/></button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <span>音符数: {item.melodyGrid.filter(n=>n.midiNote!==0).length}音</span>
                        <span>•</span>
                        <span className="text-teal-400 font-bold font-mono">BPM {item.bpm || 110}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e)=>e.stopPropagation()}>
                      <button onClick={() => handleLoadMelody(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-amber-400 hover:bg-gray-800"><Play size={12} fill="currentColor" /></button>
                      <button onClick={(e) => handleDeleteMelody(item.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
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