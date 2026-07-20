// src/lib/chordEngine.ts
import { NoteData } from '../types';
import { ALL_NOTES } from '../constants/music';

// 12のメジャースケール構成音（ルートからの半音数。キー判定およびアボイド判定の基準）
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// 度数(Degree)ごとのコードフォーミュラ定義
interface ChordFormulas {
  Simple: string;   
  Standard: string; 
  Rich: string;     
  rootDegree: number; 
  type: string;     
}

const DEGREE_MAP: Record<string, ChordFormulas> = {
  "1":   { Simple: "",   Standard: "M7",   Rich: "add9",  rootDegree: 0,  type: "M" },
  "2":   { Simple: "m",  Standard: "m7",   Rich: "m7",    rootDegree: 2,  type: "m" },
  "3":   { Simple: "m",  Standard: "m7",   Rich: "m7",    rootDegree: 4,  type: "m" },
  "4":   { Simple: "",   Standard: "M7",   Rich: "add9",  rootDegree: 5,  type: "M" },
  "5":   { Simple: "",   Standard: "7",    Rich: "/4",    rootDegree: 7,  type: "M" }, 
  "6":   { Simple: "m",  Standard: "m7",   Rich: "m7",    rootDegree: 9,  type: "m" },
  "7":   { Simple: "m",  Standard: "m7b5", Rich: "/5",    rootDegree: 11, type: "m7b5" },
  "b7":  { Simple: "",   Standard: "7",    Rich: "M7",    rootDegree: 10, type: "M" },
  "3sub":{ Simple: "",   Standard: "7",    Rich: "7",     rootDegree: 4,  type: "3sub" }, 
  "4m":  { Simple: "m",  Standard: "m6",   Rich: "m/1",   rootDegree: 5,  type: "m" },
};

export interface ChordTemplate {
  id: string;
  genre: string;
  genreLabel: string;
  title: string;
  tags: string[];
  degrees: string[];
}

// 25パターンの度数マスタ
export const CHORD_TEMPLATES: ChordTemplate[] = [
  // 👑 王道・J-POP
  { id: "pop-1", genre: "pop", genreLabel: "👑 王道・J-POP", title: "純愛ヒットチャート", tags: ["安心感", "王道", "サビ向け"], degrees: ["4", "-", "5", "-", "3", "-", "6", "-", "4", "-", "5", "-", "1", "-", "-", "-"] },
  { id: "pop-2", genre: "pop", genreLabel: "👑 王道・J-POP", title: "カノン進行リバイバル", tags: ["伝統的", "感動", "名曲風"], degrees: ["1", "-", "5", "-", "6", "-", "3", "-", "4", "-", "1", "-", "4", "-", "5", "-"] },
  { id: "pop-3", genre: "pop", genreLabel: "👑 王道・J-POP", title: "小室リフレイン", tags: ["疾走感", "90s", "キャッチー"], degrees: ["6", "-", "4", "-", "5", "-", "1", "-", "6", "-", "4", "-", "5", "-", "1", "-"] },
  { id: "pop-4", genre: "pop", genreLabel: "👑 王道・J-POP", title: "切な王道セツナリフレイン", tags: ["涙腺崩壊", "サビ向け", "ドラマ"], degrees: ["4", "-", "5", "-", "3sub", "-", "6", "-", "4", "-", "5", "-", "1", "-", "1", "-"] },
  { id: "pop-5", genre: "pop", genreLabel: "👑 王道・J-POP", title: "スパークルロード", tags: ["爽快", "J-ROCK", "王道"], degrees: ["4", "-", "1", "-", "5", "-", "6", "-", "4", "-", "1", "-", "5", "-", "1", "-"] },

  // ☀️ ポジティブ
  { id: "pos-1", genre: "positive", genreLabel: "☀️ ポジティブ", title: "サンシャイン・ホリデー", tags: ["明るい", "元気", "日常系"], degrees: ["1", "-", "4", "-", "5", "-", "1", "-", "1", "-", "4", "-", "5", "-", "1", "-"] },
  { id: "pos-2", genre: "positive", genreLabel: "☀️ ポジティブ", title: "ステップ・バイ・ステップ", tags: ["前進", "笑顔", "オープニング"], degrees: ["4", "-", "5", "-", "1", "-", "6", "-", "4", "-", "5", "-", "1", "-", "-", "-"] },
  { id: "pos-3", genre: "positive", genreLabel: "☀️ ポジティブ", title: "グッドモーニング・カフェ", tags: ["アコースティック", "爽やか"], degrees: ["1", "-", "6", "-", "2", "-", "5", "-", "1", "-", "6", "-", "2", "-", "5", "-"] },
  { id: "pos-4", genre: "positive", genreLabel: "☀️ ポジティブ", title: "ブライト・スカイ", tags: ["開放感", "夏", "ポップ"], degrees: ["1", "-", "5", "-", "4", "-", "5", "-", "1", "-", "5", "-", "4", "-", "1", "-"] },
  { id: "pos-5", genre: "positive", genreLabel: "☀️ ポジティブ", title: "ビクトリー・ラン", tags: ["達成感", "応援", "メジャー進行"], degrees: ["4", "-", "5", "-", "6", "-", "1", "-", "4", "-", "5", "-", "1", "-", "-", "-"] },

  // 🌃 切ない・エモ
  { id: "emo-1", genre: "emotional", genreLabel: "🌃 切ない・エモ", title: "夕暮れのセンチメント", tags: ["切ない", "エモい", "ボカロバラード"], degrees: ["6", "-", "4", "-", "1", "-", "5", "-", "6", "-", "4", "-", "1", "-", "5", "-"] },
  { id: "emo-2", genre: "emotional", genreLabel: "🌃 切ない・エモ", title: "レイニー・ナイト", tags: ["哀愁", "孤独", "ミッドナイト"], degrees: ["6", "-", "3", "-", "4", "-", "1", "-", "6", "-", "3", "-", "4", "-", "5", "-"] },
  { id: "emo-3", genre: "emotional", genreLabel: "🌃 切ない・エモ", title: "ノスタルジック・メモリー", tags: ["思い出", "回想", "ピアノ向け"], degrees: ["4", "-", "1", "-", "6", "-", "5", "-", "4", "-", "1", "-", "2", "-", "6", "-"] },
  { id: "emo-4", genre: "emotional", genreLabel: "🌃 切ない・エモ", title: "サブカルチャー・トワイライト", tags: ["下北沢風", "エモロック"], degrees: ["6", "-", "2", "-", "5", "-", "1", "-", "6", "-", "2", "-", "4m", "-", "5", "-"] },
  { id: "emo-5", genre: "emotional", genreLabel: "🌃 切ない・エモ", title: "ロスト・ハート", tags: ["失恋", "悲哀", "ディープ"], degrees: ["2", "-", "5", "-", "3", "-", "6", "-", "2", "-", "5", "-", "6", "-", "-", "-"] },

  // ✨ アニソン劇的
  { id: "ani-1", genre: "anime", genreLabel: "✨ アニソン劇的", title: "限界突破のシグナル", tags: ["熱い", "主題歌風", "マイナー王道"], degrees: ["4", "5", "3sub", "6", "2", "5", "1", "-", "4", "5", "3sub", "6", "b7", "-", "5", "3sub"] },
  { id: "ani-2", genre: "anime", genreLabel: "✨ アニソン劇的", title: "ダーク・ヒロイン・アライズ", tags: ["ゴシック", "劇的", "シンフォニック"], degrees: ["6", "-", "5", "-", "4", "-", "3sub", "-", "6", "-", "5", "-", "4", "5", "6", "-"] },
  { id: "ani-3", genre: "anime", genreLabel: "✨ アニソン劇的", title: "セカンド・ギア", tags: ["アニロック", "転調感", "パワフル"], degrees: ["4", "-", "5", "-", "6", "-", "b7", "-", "4", "-", "5", "-", "1", "-", "-", "-"] },
  { id: "ani-4", genre: "anime", genreLabel: "✨ アニソン劇的", title: "ファンタジー・テイル", tags: ["RPG風", "冒険", "壮大"], degrees: ["6", "-", "4", "-", "5", "-", "3", "-", "6", "-", "4", "-", "2", "3sub", "6", "-"] },
  { id: "ani-5", genre: "anime", genreLabel: "✨ アニソン劇的", title: "エターナル・ボンド", tags: ["絆", "熱いサビ", "劇的変化"], degrees: ["4", "-", "5", "-", "3sub", "-", "6", "-", "2", "-", "3sub", "-", "6", "-", "b7", "5"] },

  // 🍸 アーバンお洒落
  { id: "urb-1", genre: "urban", genreLabel: "🍸 アーバンお洒落", title: "ミッドナイト・チル", tags: ["大人", "おしゃれ", "ジャズ風"], degrees: ["2", "-", "5", "-", "1", "-", "6", "-", "2", "-", "5", "-", "1", "-", "6", "-"] },
  { id: "urb-2", genre: "urban", genreLabel: "🍸 アーバンお洒落", title: "ネオン・シティ・グルーヴ", tags: ["シティポップ", "80s", "ダンサブル"], degrees: ["4", "-", "3", "-", "6", "-", "b7", "-", "4", "-", "3", "-", "6", "-", "2", "5"] },
  { id: "urb-3", genre: "urban", genreLabel: "🍸 アーバンお洒落", title: "レトロ・ラウンジ", tags: ["Lo-Fi", "チルホップ", "カフェ"], degrees: ["1", "-", "b7", "-", "4", "-", "1", "-", "1", "-", "b7", "-", "4", "-", "-", "-"] },
  { id: "urb-4", genre: "urban", genreLabel: "🍸 アーバンお洒落", title: "ジャジー・ステップ", tags: ["本格派", "ナイトライフ", "スウィング"], degrees: ["2", "-", "5", "-", "3sub", "-", "6", "-", "2", "-", "5", "-", "1", "-", "-", "-"] },
  { id: "urb-5", genre: "urban", genreLabel: "🍸 アーバンお洒落", title: "ベルベット・ドリーム", tags: ["R&B", "メロウ", "深夜"], degrees: ["4", "-", "3sub", "-", "6", "-", "b7", "-", "4", "-", "3sub", "-", "6", "-", "2", "-"] }
];

export function detectBestKey(melodyGrid: NoteData[]): number {
  if (melodyGrid.length === 0) return 0;
  let bestKey = 0;
  let maxScore = -999;

  for (let keyCandidate = 0; keyCandidate < 12; keyCandidate++) {
    let currentKeyScore = 0;
    const allowedSemitones = MAJOR_SCALE_INTERVALS.map(interval => (keyCandidate + interval) % 12);

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

function convertDegreeToChord(degreeStr: string, keyRootIdx: number, complexity: 'Simple' | 'Standard' | 'Rich'): string {
  if (degreeStr === "-") return "-";
  
  const formula = DEGREE_MAP[degreeStr];
  if (!formula) return "C";

  const chordRootIdx = (keyRootIdx + formula.rootDegree) % 12;
  const chordRootName = ALL_NOTES[chordRootIdx];

  if (complexity === 'Simple') {
    return `${chordRootName}${formula.type === 'm' ? 'm' : ''}`;
  } else if (complexity === 'Standard') {
    return `${chordRootName}${formula.Standard}`;
  } else {
    if (formula.Rich.startsWith("/")) {
      const slashDegree = parseInt(formula.Rich.replace("/", ""), 10);
      const slashRootIdx = (keyRootIdx + (slashDegree === 4 ? 5 : 7)) % 12;
      return `${chordRootName}/${ALL_NOTES[slashRootIdx]}`;
    }
    return `${chordRootName}${formula.Rich}`;
  }
}

export interface ScoredChordResult {
  templateId: string;
  genre: string;
  genreLabel: string;
  title: string;
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
    let score = 100; 

    template.degrees.forEach((degree, slotIdx) => {
      if (degree === "-") return;
      const formula = DEGREE_MAP[degree];
      if (!formula) return;

      const startStep = slotIdx * 8;
      const notesOnStep = melodyGrid.filter(n => n.col === startStep);

      notesOnStep.forEach(note => {
        if (note.midiNote === 0) return;
        
        const transposedMidi = note.midiNote + manualTranspose;
        const melodySemitone = transposedMidi % 12;
        const absoluteChordRoot = (currentKeyIdx + formula.rootDegree) % 12;
        
        const intervalFromRoot = Math.abs(melodySemitone - absoluteChordRoot);

        if (intervalFromRoot === 1 || intervalFromRoot === 11) {
          score -= 15;
        } else if (intervalFromRoot === 0 || intervalFromRoot === 7) {
          score += 5; 
        }
      });
    });

    score = Math.max(60, Math.min(100, score));

    const chordsMap = {
      Simple: template.degrees.map(d => convertDegreeToChord(d, currentKeyIdx, 'Simple')),
      Standard: template.degrees.map(d => convertDegreeToChord(d, currentKeyIdx, 'Standard')),
      Rich: template.degrees.map(d => convertDegreeToChord(d, currentKeyIdx, 'Rich'))
    };

    return {
      templateId: template.id,
      genre: template.genre,
      genreLabel: template.genreLabel,
      title: template.title,
      tags: template.tags,
      score: score, 
      chordsMap
    };
  }).sort((a, b) => b.score - a.score);

  return { detectedKeyName, currentKeyName, currentKeyIdx, suggestions };
}