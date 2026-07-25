// src/lib/chordEngine.ts
import { NoteData } from '../types';
import { ALL_NOTES } from '../constants/music';

const BASE_DEGREE_INTERVALS: Record<string, number> = {
  "1": 0, "2": 2, "3": 4, "4": 5, "5": 7, "6": 9, "7": 11,
  "b7": 10, "4#": 6
};

export interface ChordTemplate {
  id: string;
  category: 'Chorus' | 'Verse' | 'Chill';
  categoryLabel: string;
  title: string;
  description: string;
  tags: string[];
  // 16スロット(8小節) または 8スロット(4小節) の度数配列
  degrees: string[];
  // 三和音（トライアード：7thやオンコードを一切使わない超シンプル進行）フラグ
  isTriadOnly?: boolean;
}

// ─── 最強の黄金進行マスタ（全34パターン完全版） ───
export const CHORD_TEMPLATES: ChordTemplate[] = [
  // 【サビ（Chorus）：シンプル＋感動王道】
  {
    id: "cho-canon-simple",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "原点にして頂点・ピュアカノン進行",
    description: "セブンスやオンコードを削ぎ落とした超王道カノン。圧倒的な素朴さと安心感。(C-G-Am-Em-F-C-F-G)",
    tags: ["ピュア", "超王道", "カノン", "アコースティック"],
    degrees: ["1", "-", "5", "-", "6", "-", "3", "-", "4", "-", "1", "-", "4", "-", "5", "-"],
    isTriadOnly: true
  },
  {
    id: "cho-1-simple",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "シンプル4536進行 (トライアード)",
    description: "テンション感を抑えた純粋な三和音のみの4536。素朴でストレートなエモーショナルさ。",
    tags: ["シンプル", "ストレート", "4536"],
    degrees: ["4", "-", "5", "-", "3", "-", "6", "-", "4", "-", "5", "-", "1", "-", "-", "-"],
    isTriadOnly: true
  },
  {
    id: "cho-1",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "J-POP最高峰 (4536セブンス進行)",
    description: "日本の音楽史を支える最強の進行。セブンスの切なさと込み上げる情熱を両立。",
    tags: ["王道", "涙腺崩壊", "サビ向け"],
    degrees: ["4", "-", "5", "-", "37", "-", "6", "-", "4", "-", "5", "-", "1", "-", "-", "-"]
  },
  {
    id: "cho-2",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "カノン進行（ベース降下型）",
    description: "ベースラインが階段を滑らかに降りていく、美しく圧倒的な安定感。",
    tags: ["感動", "伝統", "ドラマチック"],
    degrees: ["1", "5/7", "6", "3/5", "4", "1/3", "2", "5"]
  },
  {
    id: "cho-3",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "サブドミナントマイナー・涙の着地",
    description: "サビの終盤で4m(サブドミマイナー)が挟まり、胸がギュッと締め付けられる。",
    tags: ["切ない", "エモい", "サビ締め"],
    degrees: ["4", "-", "5/4", "-", "37", "-", "6", "-", "4", "-", "4m", "-", "1", "-", "-", "-"]
  },
  {
    id: "cho-4-simple",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "ピュア小室リフレイン (6451三和音)",
    description: "三和音だけでドライブする疾走感。ロックやアコースティックに直球で響く。",
    tags: ["シンプル", "ロック", "疾走感"],
    degrees: ["6", "-", "4", "-", "5", "-", "1", "-"],
    isTriadOnly: true
  },
  {
    id: "cho-4",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "小室リフレイン (6451セブンス)",
    description: "疾走感あふれるマイナー発進。90年代から受け継がれるキャッチーの極み。",
    tags: ["疾走感", "アニソン", "キャッチー"],
    degrees: ["6", "-", "4", "-", "5", "-", "1", "-"]
  },
  {
    id: "cho-5",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "パッシング・ディミニッシュ劇的進行",
    description: "4#dimが滑らかに音を繋ぎ、疾走感の中にプロの技術が光る高揚感。",
    tags: ["劇的", "プロ仕様", "J-ROCK"],
    degrees: ["4", "5", "4#dim", "6", "2", "5", "1", "-"]
  },
  {
    id: "cho-6",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "スパークル・ポップ王道",
    description: "明るい光が差し込むような爽快感。ポップスの王道を突き抜ける展開。",
    tags: ["爽快", "明るい", "青春"],
    degrees: ["4", "-", "1", "-", "5", "-", "6", "-", "4", "-", "1", "-", "5", "-", "1", "-"]
  },
  {
    id: "cho-7",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "アニソン限界突破サビ",
    description: "キメと転調感が連続する、アニメ主題歌のクライマックス専用進行。",
    tags: ["熱い", "主題歌風", "限界突破"],
    degrees: ["4", "5", "37", "6", "2", "5", "1", "-", "4", "5", "37", "6", "b7", "-", "5", "37"]
  },
  {
    id: "cho-8",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "ビクトリー・メジャーマーチ",
    description: "前向きなエネルギー全開。達成感と笑顔に包まれるメジャー進行。",
    tags: ["前進", "応援", "達成感"],
    degrees: ["1", "-", "5", "-", "6", "-", "4", "-", "1", "-", "5", "-", "4", "-", "1", "-"]
  },
  {
    id: "cho-9",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "ドラマチック・ロストラブ",
    description: "マイナーからメジャーへ浮き沈みし、失恋や哀愁を情感豊かに描く。",
    tags: ["バラード", "哀愁", "ドラマ"],
    degrees: ["6", "-", "37", "-", "4", "-", "1", "-", "2", "-", "5", "-", "1", "-", "37", "-"]
  },
  {
    id: "cho-10",
    category: "Chorus",
    categoryLabel: "👑 サビ：感動王道",
    title: "エターナル・ボンド (絆)",
    description: "サビの終盤で♭VII(b7)を踏み抜き、世界観が世界へ広がる壮大なスケール。",
    tags: ["壮大", "絆", "クライマックス"],
    degrees: ["4", "-", "5", "-", "37", "-", "6", "-", "2", "-", "37", "-", "6", "-", "b7", "5"]
  },

  // 【Aメロ・Bメロ（Verse）：シンプル＋ストーリー】
  {
    id: "ver-1-simple",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "三和音ポップ・ステイ (C-F-G-C)",
    description: "最もシンプルで親しみやすい基本3和音循環。童謡やポップスの基本。",
    tags: ["超基本", "素朴", "弾き語り"],
    degrees: ["1", "-", "4", "-", "5", "-", "1", "-"],
    isTriadOnly: true
  },
  {
    id: "ver-1",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "ポップ・ステイ・ループ (セブンス)",
    description: "1小節ずつゆったりとストーリーを紡ぐ、親しみやすく安定した進行。",
    tags: ["安定", "日常", "Aメロ向け"],
    degrees: ["1", "-", "4", "-", "5", "-", "1", "-"]
  },
  {
    id: "ver-2",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "トップ固定・クリシェライン",
    description: "メロディのトップ音を保ちつつ、ベースラインだけが静かに降下する優美さ。",
    tags: ["クリシェ", "オシャレ", "Bメロ向け"],
    degrees: ["1", "-", "1/7", "-", "1/6", "-", "1/5", "-", "4", "-", "1/3", "-", "2", "-", "5", "-"]
  },
  {
    id: "ver-3",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "グッドモーニング・アコースティック",
    description: "朝の光を浴びるような爽やかさ。アコギやピアノの語りに最適。",
    tags: ["爽やか", "アコースティック", "カフェ"],
    degrees: ["1", "-", "6", "-", "2", "-", "5", "-"]
  },
  {
    id: "ver-4",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "夕暮れのノスタルジー",
    description: "静かな哀愁から始まり、サビへの期待感をじんわりと高める展開。",
    tags: ["思い出", "夕暮れ", "ノスタルジー"],
    degrees: ["6", "-", "4", "-", "1", "-", "5", "-", "6", "-", "4", "-", "2", "-", "5", "-"]
  },
  {
    id: "ver-5",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "レイニー・イントロダクション",
    description: "ポツポツと降る雨のように静かな情緒。マイナーベースの美しい語り口。",
    tags: ["静寂", "雨", "ボカロ風"],
    degrees: ["6", "-", "3", "-", "4", "-", "1", "-", "2", "-", "5", "-", "37", "-", "6", "-"]
  },
  {
    id: "ver-6",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "サビ前クレッシェンド (Bメロ特化)",
    description: "サビに向かって緊張感を高め、最後の37(E7)で一気に破裂させる。",
    tags: ["ビルドアップ", "Bメロ特化", "高揚感"],
    degrees: ["4", "-", "5", "-", "6", "-", "6", "-", "4", "-", "5", "-", "37", "-", "37", "-"]
  },
  {
    id: "ver-7",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "下北沢サブカル・エモロック",
    description: "バンドサウンドにマッチする、少し歪んだ青春と切なさを帯びた進行。",
    tags: ["エモロック", "下北沢", "青春"],
    degrees: ["6", "-", "2", "-", "5", "-", "1", "-", "6", "-", "2", "-", "4m", "-", "5", "-"]
  },
  {
    id: "ver-8",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "サンシャイン・ドライブ",
    description: "風を切って走るような開放感。明るくポジティブなメロディを引き立てる。",
    tags: ["ドライブ", "開放感", "爽快"],
    degrees: ["1", "-", "5", "-", "4", "-", "5", "-", "1", "-", "5", "-", "4", "-", "1", "-"]
  },
  {
    id: "ver-9",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "シンフォニック・アドベンチャー",
    description: "冒険の始まりを感じさせる広がり。壮大な物語の1ページ目。",
    tags: ["冒険", "RPG", "壮大"],
    degrees: ["6", "-", "4", "-", "5", "-", "3", "-", "6", "-", "4", "-", "2", "37", "6", "-"]
  },
  {
    id: "ver-10",
    category: "Verse",
    categoryLabel: "📖 A/Bメロ：ストーリー",
    title: "ミッドナイト・ウォーク",
    description: "深夜の街を一人歩くような、静かで洗練されたコードアプローチ。",
    tags: ["深夜", "散歩", "静けさ"],
    degrees: ["2", "-", "5", "-", "37", "-", "6", "-", "2", "-", "5", "-", "6", "-", "-", "-"]
  },

  // 【アーバン・チル（Chill）：アーバン洗練】
  {
    id: "chl-1",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "丸サ進行 (Just the Two of Us)",
    description: "世界中で愛されるおしゃれ進行の最高峰。都会的な夜を彩る。",
    tags: ["シティポップ", "定番", "オシャレ"],
    degrees: ["4", "37", "6", "5m7/1"]
  },
  {
    id: "chl-2",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "夜の王道 2-5-1-6 (ツーファイブ)",
    description: "ジャズやR&Bの基本であり至高。スムーズで心地よい浮遊感に浸れる。",
    tags: ["ジャズ風", "R&B", "ナイトライフ"],
    degrees: ["2", "-", "5", "-", "1", "-", "6", "-"]
  },
  {
    id: "chl-3",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "ネオン・シティ・グルーヴ",
    description: "80年代シティポップのダンサブルでお洒落なテンション感。",
    tags: ["80s", "ダンサブル", "ネオン"],
    degrees: ["4", "-", "3", "-", "6", "-", "b7", "-", "4", "-", "3", "-", "6", "-", "2", "5"]
  },
  {
    id: "chl-4",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "サブドミナント・チル・ループ",
    description: "17(セブン)から4M7へ滑らかに落ちる、カフェやLo-Fi Beatに最適な浮遊感。",
    tags: ["Lo-Fi", "チルホップ", "カフェ"],
    degrees: ["1", "-", "b7", "-", "4", "-", "1", "-", "1", "-", "b7", "-", "4", "-", "-", "-"]
  },
  {
    id: "chl-5",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "ベルベット・ナイト・R&B",
    description: "メロウで深い大人な響き。セカンダリードミナントが艶やかに響く。",
    tags: ["R&B", "メロウ", "深夜"],
    degrees: ["4", "-", "37", "-", "6", "-", "b7", "-", "4", "-", "37", "-", "6", "-", "2", "-"]
  },
  {
    id: "chl-6",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "ミッドナイト・チルアウト",
    description: "リラックスしたテンポで深く沈み込める、アーバン・ラウンジ系コード。",
    tags: ["チルアウト", "ラウンジ", "リラックス"],
    degrees: ["4", "-", "5/4", "-", "3", "-", "6", "-", "2", "-", "5", "-", "1", "-", "-", "-"]
  },
  {
    id: "chl-7",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "オンベース・エレガント降下",
    description: "ベースラインが洗練された軌跡を描く、ピアノトリオ風のエレガントさ。",
    tags: ["エレガント", "ピアノ向け", "洗練"],
    degrees: ["1", "5/7", "6", "1/5", "4", "1/3", "2", "5"]
  },
  {
    id: "chl-8",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "ジャジー・ステップ",
    description: "ちょっと背伸びしたい夜に。複雑で豊かな響きが織りなす大人のコードステップ。",
    tags: ["ジャジー", "本格派", "バー"],
    degrees: ["2", "-", "5", "-", "37", "-", "6", "-", "2", "-", "5", "-", "1", "-", "b7", "-"]
  },
  {
    id: "chl-9",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "ムーンライト・シネマ",
    description: "映画のワンシーンのようにドラマチックで静かな余韻を残すコード進行。",
    tags: ["シネマティック", "余韻", "幻想的"],
    degrees: ["6", "-", "4", "-", "1", "-", "5/7", "-", "6", "-", "4m", "-", "1", "-", "-", "-"]
  },
  {
    id: "chl-10",
    category: "Chill",
    categoryLabel: "🍸 Chill：アーバン洗練",
    title: "アーバン・トワイライト",
    description: "黄昏時のグラデーション空を思わせる、甘く切ないハーモニーの連続。",
    tags: ["黄昏", "グラデーション", "甘い"],
    degrees: ["4", "-", "3", "-", "6", "-", "5m7/1", "-", "4", "-", "4m", "-", "1", "-", "-", "-"]
  }
];

export function detectBestKey(melodyGrid: NoteData[]): number {
  if (melodyGrid.length === 0) return 0;
  let bestKey = 0;
  let maxScore = -999;
  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

  for (let keyCandidate = 0; keyCandidate < 12; keyCandidate++) {
    let currentKeyScore = 0;
    const allowedSemitones = MAJOR_SCALE_INTERVALS.map(i => (keyCandidate + i) % 12);

    melodyGrid.forEach((note, index) => {
      if (note.midiNote === 0) return;
      const melodySemitone = note.midiNote % 12;
      const isStrongBeat = note.col % 4 === 0;
      const weight = isStrongBeat ? 1.5 : 1.0;

      if (allowedSemitones.includes(melodySemitone)) {
        currentKeyScore += 10 * weight;
      } else {
        currentKeyScore -= 15 * weight;
      }

      if (index === 0 || index === melodyGrid.length - 1) {
        if (melodySemitone === keyCandidate) {
          currentKeyScore += 20;
        }
      }
    });

    if (currentKeyScore > maxScore) {
      maxScore = currentKeyScore;
      bestKey = keyCandidate;
    }
  }
  return bestKey;
}

export function convertDegreeToChord(
  degreeStr: string, 
  keyRootIdx: number, 
  complexity: 'Simple' | 'Standard' | 'Rich' = 'Standard',
  isTriadOnly: boolean = false
): string {
  if (degreeStr === "-") return "-";

  let mainDegree = degreeStr;
  let slashDegree: string | null = null;
  if (degreeStr.includes("/")) {
    const parts = degreeStr.split("/");
    mainDegree = parts[0];
    slashDegree = parts[1];
  }

  let rootInterval = 0;
  let isMinor = false;
  let chordExtension = "";

  if (mainDegree === "37") {
    rootInterval = 4;
    chordExtension = isTriadOnly ? "" : "7";
  } else if (mainDegree === "4m") {
    rootInterval = 5;
    isMinor = true;
  } else if (mainDegree === "4m6") {
    rootInterval = 5;
    isMinor = true;
    chordExtension = isTriadOnly ? "" : "6";
  } else if (mainDegree === "4#dim") {
    rootInterval = 6;
    chordExtension = "dim";
  } else if (mainDegree === "5m7") {
    rootInterval = 7;
    isMinor = true;
    chordExtension = isTriadOnly ? "" : "7";
  } else {
    rootInterval = BASE_DEGREE_INTERVALS[mainDegree] ?? 0;
    if (["2", "3", "6", "7"].includes(mainDegree)) {
      isMinor = true;
    }
  }

  const rootIdx = (keyRootIdx + rootInterval) % 12;
  const rootName = ALL_NOTES[rootIdx];

  let finalChord = rootName;

  if (isTriadOnly) {
    // ★ トライアード指定時はセブンス(M7, m7, 7)を付けずピュアな「C」「Am」「G」にする
    if (chordExtension && chordExtension !== "7") {
      finalChord += chordExtension;
    } else if (isMinor) {
      finalChord += "m";
    }
  } else {
    if (chordExtension) {
      finalChord += chordExtension;
    } else if (isMinor) {
      finalChord += "m7";
    } else {
      finalChord += (mainDegree === "5" || mainDegree === "b7") ? "7" : "M7";
    }
  }

  if (slashDegree) {
    const slashInterval = BASE_DEGREE_INTERVALS[slashDegree] ?? 0;
    const slashIdx = (keyRootIdx + slashInterval) % 12;
    finalChord += `/${ALL_NOTES[slashIdx]}`;
  }

  return finalChord;
}

function getChordPitchClasses(chordName: string): number[] {
  if (chordName === '-' || !chordName) return [];
  const [chord, slash] = chordName.split('/');
  let root = chord[1] === '#' || chord[1] === 'b' ? chord.slice(0, 2) : chord.slice(0, 1);
  let type = chord.slice(root.length);

  const rootIdx = ALL_NOTES.indexOf(root);
  if (rootIdx === -1) return [];

  let intervals = [0, 4, 7];
  if (type.includes('m') && !type.includes('dim')) intervals = [0, 3, 7];
  if (type.includes('dim')) intervals = [0, 3, 6];
  if (type.includes('7')) intervals.push(type.includes('M7') ? 11 : 10);
  if (type.includes('6')) intervals.push(9);

  const pitchClasses = intervals.map(i => (rootIdx + i) % 12);
  if (slash) {
    const slashIdx = ALL_NOTES.indexOf(slash);
    if (slashIdx !== -1 && !pitchClasses.includes(slashIdx)) {
      pitchClasses.push(slashIdx);
    }
  }
  return pitchClasses;
}

export interface ScoredChordResult {
  templateId: string;
  category: 'Chorus' | 'Verse' | 'Chill';
  categoryLabel: string;
  title: string;
  description: string;
  tags: string[];
  score: number;
  chordsMap: { Simple: string[]; Standard: string[]; Rich: string[] };
}

export function generateAndScoreChords(
  melodyGrid: NoteData[],
  manualTranspose: number = 0
): { detectedKeyName: string; currentKeyName: string; currentKeyIdx: number; suggestions: ScoredChordResult[] } {
  const detectedKeyIdx = detectBestKey(melodyGrid);
  const detectedKeyName = `${ALL_NOTES[detectedKeyIdx]} Major`;

  let currentKeyIdx = (detectedKeyIdx + manualTranspose) % 12;
  if (currentKeyIdx < 0) currentKeyIdx += 12;
  const currentKeyName = `${ALL_NOTES[currentKeyIdx]} Major`;

  const suggestions = CHORD_TEMPLATES.map(template => {
    let score = 85;

    // 4小節(8スロット)パターンの場合、自動でリピートして16スロットに補完拡張
    let fullDegrees = [...template.degrees];
    if (fullDegrees.length < 16) {
      while (fullDegrees.length < 16) {
        fullDegrees = fullDegrees.concat(template.degrees);
      }
      fullDegrees = fullDegrees.slice(0, 16);
    }

    const isTriadOnly = template.isTriadOnly || false;

    fullDegrees.forEach((degree, slotIdx) => {
      if (degree === "-") return;

      const chordNameStandard = convertDegreeToChord(degree, currentKeyIdx, 'Standard', isTriadOnly);
      const chordPitches = getChordPitchClasses(chordNameStandard);

      const startStep = slotIdx * 8;
      const endStep = startStep + 8;
      const notesInSlot = melodyGrid.filter(n => n.col >= startStep && n.col < endStep && n.midiNote !== 0);

      notesInSlot.forEach(note => {
        const transposedMidi = note.midiNote + manualTranspose;
        const melodyPitch = transposedMidi % 12;

        if (chordPitches.includes(melodyPitch)) {
          score += 3;
        } else {
          const hasHalfStepClash = chordPitches.some(cp => Math.abs(cp - melodyPitch) === 1 || Math.abs(cp - melodyPitch) === 11);
          if (hasHalfStepClash) {
            score -= 8;
          }
        }
      });
    });

    score = Math.max(60, Math.min(100, score));

    const convertedChords = fullDegrees.map(d => convertDegreeToChord(d, currentKeyIdx, 'Standard', isTriadOnly));

    const chordsMap = {
      Simple: convertedChords,
      Standard: convertedChords,
      Rich: convertedChords
    };

    return {
      templateId: template.id,
      category: template.category,
      categoryLabel: template.categoryLabel,
      title: template.title,
      description: template.description,
      tags: template.tags,
      score: Math.round(score),
      chordsMap
    };
  }).sort((a, b) => b.score - a.score);

  return { detectedKeyName, currentKeyName, currentKeyIdx, suggestions };
}