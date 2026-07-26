// src/components/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Rocket, History, Plus, Heart } from 'lucide-react';
import { NEWS_ITEMS, ROADMAP_ITEMS, DEV_LOGS } from '../constants/news';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] lg:h-full w-full bg-gray-950 text-gray-100 select-none relative overflow-y-auto scrollbar-none flex flex-col items-center">
      
      {/* ─── ヘッダー ─── */}
      <header className="sticky top-0 w-full max-w-none lg:max-w-5xl bg-gray-950/90 backdrop-blur-md border-b border-gray-900 px-4 lg:px-8 py-3.5 flex items-center justify-between z-50 shrink-0">
        <button 
          onClick={() => navigate('/')} 
          className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-black text-base lg:text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400">
          Melo Chord 公式ノート
        </span>
        <div className="w-8" />
      </header>

      <div className="w-full max-w-[430px] lg:max-w-4xl px-5 lg:px-8 py-8 lg:py-12 flex flex-col gap-10 lg:gap-16 text-left">
        
        {/* ─── 1. メインヒーロー ─── */}
        <section className="flex flex-col gap-4 text-center items-center py-4 lg:py-8">
          <span className="text-xs font-black px-3.5 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-teal-300 border border-teal-500/30 rounded-full tracking-wider uppercase">
            Melo Chord (ベータ版)
          </span>
          <h1 className="text-2xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            あなたのメロディに、<br />最高のコード進行を。
          </h1>
          <p className="text-sm lg:text-base text-gray-300 leading-relaxed font-medium max-w-md">
            「頭の中に良いフレーズが浮かんだのに、コードがつけられない…」<br />
            Melo Chord は、あなたの鼻歌やドレミのフレーズから最適なコード展開をAIと音楽理論が自動提案するアプリです。
          </p>
        </section>

        <hr className="border-gray-900" />

        {/* ─── 2. 使い方の詳細ガイド ─── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} />
            <h2 className="text-lg lg:text-xl font-black text-white">使い方の詳細ガイド</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <h3 className="text-sm lg:text-base font-black text-gray-100">メロディを入力（鍵盤画面）</h3>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed pl-8">
                鍵盤をタップするだけで「ドレミ」を並べられます。「8分/16分」スイッチで入力位置のジャンプ幅を切り替えたり、タイムラインの音符をタップしてピンポイントで削除・移動も可能です。
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <h3 className="text-sm lg:text-base font-black text-gray-100">コード進行をハンティング</h3>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed pl-8">
                「コードを探す」を押すと、メロディの音群からキー（調）を自動判定！サビ（王道）、A/Bメロ（語り）、Chill（洗練）など全34パターンの黄金進行からマッチ度順に提案されます。
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <h3 className="text-sm lg:text-base font-black text-gray-100">試聴とアレンジ</h3>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed pl-8">
                カードの「試聴」ボタンを押すと、メロディと伴奏がリアルタイムで鳴ります。Keyシフト（移調）やBPM変更で歌いやすい高さ・スピードに調整して作品を仕上げましょう。
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-900" />

        {/* ─── 3. 今後のロードマップ ─── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Rocket className="text-amber-400" size={20} />
            <h2 className="text-lg lg:text-xl font-black text-white">今後の追加予定機能 (Roadmap)</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ROADMAP_ITEMS.map((item, idx) => (
              <div key={idx} className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] lg:text-xs font-black px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {item.tag || '開発中'}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    {item.status === 'upcoming' ? '実装予定' : '検討中'}
                  </span>
                </div>
                <h3 className="text-sm lg:text-base font-black text-gray-100">{item.title}</h3>
                <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-900" />

        {/* ─── 4. 開発ログ & 全更新履歴 ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <History className="text-purple-400" size={20} />
            <h2 className="text-lg lg:text-xl font-black text-white">開発ログ & 更新履歴</h2>
          </div>

          {/* 開発ノート */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📝 開発裏話ノート</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {DEV_LOGS.map((log, idx) => (
                <div key={idx} className="bg-purple-950/20 border border-purple-900/30 rounded-2xl p-5 flex flex-col gap-2">
                  <span className="text-xs font-mono text-purple-400">{log.date}</span>
                  <h4 className="text-sm lg:text-base font-black text-purple-200">{log.title}</h4>
                  <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed">{log.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 全バージョン更新履歴 */}
          <div className="flex flex-col gap-3 mt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📜 アップアップデート履歴</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {NEWS_ITEMS.map((news) => (
                <div key={news.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-gray-500">{news.date} ({news.id})</span>
                    {news.isMajor && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                        MAJOR
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm lg:text-base font-black text-white">{news.title}</h4>
                  <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed">{news.detail || news.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-gray-900" />

        {/* ─── 最下部：ホームへ戻る巨大アクションボタン ─── */}
        <section className="flex flex-col gap-4 items-center text-center pt-6 pb-16">
          <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-400 font-bold">
            <Heart size={14} className="text-rose-500 fill-current" />
            <span>Melo Chord で新しい曲に出会おう</span>
          </div>

          <div className="w-full max-w-md bg-gradient-to-b from-gray-900/90 to-gray-950 border border-teal-500/30 p-6 rounded-3xl shadow-2xl flex flex-col gap-4">
            <p className="text-xs lg:text-sm font-bold text-teal-300/90 tracking-wide">
              さあ、あなたのメロディを入力してみましょう！
            </p>

            <button 
              onClick={() => navigate('/')}
              className="w-full py-5 bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black text-base lg:text-lg flex items-center justify-center gap-2.5 text-white shadow-xl shadow-teal-500/25 transition-all active:scale-[0.98] border border-teal-400/30 tracking-tight"
            >
              <Plus size={20} strokeWidth={3} />
              <span>さっそく曲を作る（ホームへ戻る）</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}