// src/constants/presets.ts
import { NoteData } from '../types';

export interface PresetMelody {
  id: string;
  title: string;
  category: 'Chorus' | 'Verse' | 'Chill';
  description: string;
  bpm: number;
  bars: 4 | 8;
  notes: NoteData[];
}

export const PRESET_MELODIES: PresetMelody[] = [
  /*
  {
    id: "demo-1",
    title: "カノンメロディ (8小節)",
    category: "Verse",
    description: "8小節をフルに使った長尺のメロディ。シンプルな進行から壮大な展開まで試せます。",
    bpm: 110,
    bars: 8,
    notes: [
      { midiNote: 67, col: 16, duration: 2 }, { midiNote: 64, col: 20, duration: 2 },
      { midiNote: 65, col: 22, duration: 2 }, { midiNote: 67, col: 24, duration: 2 },
      { midiNote: 64, col: 28, duration: 2 }, { midiNote: 65, col: 30, duration: 2 },
      { midiNote: 67, col: 32, duration: 2 }, { midiNote: 55, col: 34, duration: 2 },
      { midiNote: 57, col: 36, duration: 2 }, { midiNote: 59, col: 38, duration: 2 },
      { midiNote: 60, col: 40, duration: 2 }, { midiNote: 62, col: 42, duration: 2 },
      { midiNote: 64, col: 44, duration: 2 }, { midiNote: 65, col: 46, duration: 2 },
      { midiNote: 64, col: 48, duration: 2 }, { midiNote: 60, col: 52, duration: 2 },
      { midiNote: 62, col: 54, duration: 2 }, { midiNote: 64, col: 56, duration: 2 },
      { midiNote: 52, col: 60, duration: 2 }, { midiNote: 53, col: 62, duration: 2 },
      { midiNote: 55, col: 64, duration: 2 }, { midiNote: 57, col: 66, duration: 2 },
      { midiNote: 55, col: 68, duration: 2 }, { midiNote: 53, col: 70, duration: 2 },
      { midiNote: 55, col: 72, duration: 2 }, { midiNote: 60, col: 74, duration: 2 },
      { midiNote: 59, col: 76, duration: 2 }, { midiNote: 60, col: 78, duration: 2 },
      { midiNote: 57, col: 80, duration: 2 }, { midiNote: 60, col: 84, duration: 2 },
      { midiNote: 59, col: 86, duration: 2 }, { midiNote: 57, col: 88, duration: 2 },
      { midiNote: 55, col: 92, duration: 2 }, { midiNote: 53, col: 94, duration: 2 },
      { midiNote: 55, col: 96, duration: 2 }, { midiNote: 53, col: 98, duration: 2 },
      { midiNote: 52, col: 100, duration: 2 }, { midiNote: 53, col: 102, duration: 2 },
      { midiNote: 55, col: 104, duration: 2 }, { midiNote: 57, col: 106, duration: 2 },
      { midiNote: 59, col: 108, duration: 2 }, { midiNote: 60, col: 110, duration: 2 },
      { midiNote: 57, col: 112, duration: 2 }, { midiNote: 60, col: 116, duration: 2 },
      { midiNote: 59, col: 118, duration: 2 }, { midiNote: 60, col: 120, duration: 2 },
      { midiNote: 59, col: 124, duration: 2 }, { midiNote: 57, col: 126, duration: 2 },
      { midiNote: 59, col: 128, duration: 2 }, { midiNote: 60, col: 130, duration: 2 },
      { midiNote: 62, col: 132, duration: 2 }, { midiNote: 60, col: 134, duration: 2 },
      { midiNote: 59, col: 136, duration: 2 }, { midiNote: 60, col: 138, duration: 2 },
      { midiNote: 57, col: 140, duration: 2 }, { midiNote: 59, col: 142, duration: 2 }
    ]
  },
  */

  {
    id: "demo-2",
    title: "王道キャッチーサビ",
    category: "Chorus",
    description: "J-POPのサビでよく聴く、高揚感のあるメロディ。4-5-3-6進行などがよく合います。",
    bpm: 110,
    bars: 4,
    notes: [
      // 全体の col に 16 を足して、第1小節（col:16）から開始するように修正
      // 1小節め: ソーラーシードー
      { midiNote: 67, col: 16, duration: 4 }, { midiNote: 69, col: 20, duration: 4 },
      { midiNote: 71, col: 24, duration: 4 }, { midiNote: 72, col: 28, duration: 4 },
      // 2小節め: レーミードーラー
      { midiNote: 74, col: 32, duration: 4 }, { midiNote: 76, col: 36, duration: 4 },
      { midiNote: 72, col: 40, duration: 4 }, { midiNote: 69, col: 44, duration: 4 },
      // 3小節め: ソーーーファミーレー
      { midiNote: 67, col: 48, duration: 8 }, { midiNote: 65, col: 56, duration: 4 },
      { midiNote: 64, col: 60, duration: 2 }, { midiNote: 62, col: 62, duration: 2 },
      // 4小節め: ドーーー
      { midiNote: 60, col: 64, duration: 16 }
    ]
  },

  {
    id: "demo-3",
    title: "夜の静かなAメロ",
    category: "Verse",
    description: "少し低めの音域で、語りかけるようなメロディ。エモい展開の起点に。",
    bpm: 85,
    bars: 4,
    notes: [
      // 1小節め (col 16-31): ララソラ
      { midiNote: 57, col: 16, duration: 4 }, { midiNote: 57, col: 20, duration: 4 },
      { midiNote: 55, col: 24, duration: 4 }, { midiNote: 57, col: 28, duration: 4 },
      // 2小節め (col 32-47): ドドシラ
      { midiNote: 60, col: 32, duration: 4 }, { midiNote: 60, col: 36, duration: 4 },
      { midiNote: 59, col: 40, duration: 4 }, { midiNote: 57, col: 44, duration: 4 },
      // 3小節め (col 48-63): ミーミレドレ
      { midiNote: 64, col: 48, duration: 6 }, { midiNote: 64, col: 54, duration: 2 },
      { midiNote: 62, col: 56, duration: 4 }, { midiNote: 60, col: 60, duration: 2 },
      { midiNote: 62, col: 62, duration: 2 },
      // 4小節め (col 64-79): ミーーー（溜め）
      { midiNote: 64, col: 64, duration: 16 }
    ]
  },

  {
    id: "demo-4",
    title: "疾走アニソン・イントロ",
    category: "Chill", // カテゴリに「Upbeat」とかあっても良さそうですが一旦Chill以外で
    description: "BPM180の高速フレーズ。16分音符の細かい動きにコードがどう追従するかチェック！",
    bpm: 160,
    bars: 4,
    notes: [
      // 1小節め: タータタタータタ（細かい刻み）
      { midiNote: 72, col: 16, duration: 2 }, { midiNote: 74, col: 18, duration: 1 }, { midiNote: 76, col: 19, duration: 1 },
      { midiNote: 79, col: 20, duration: 4 }, 
      { midiNote: 72, col: 24, duration: 2 }, { midiNote: 74, col: 26, duration: 1 }, { midiNote: 76, col: 27, duration: 1 },
      { midiNote: 81, col: 28, duration: 4 },
      // 2小節め: 駆け上がり
      { midiNote: 72, col: 32, duration: 2 }, { midiNote: 74, col: 34, duration: 2 },
      { midiNote: 76, col: 36, duration: 2 }, { midiNote: 77, col: 38, duration: 2 },
      { midiNote: 79, col: 40, duration: 2 }, { midiNote: 81, col: 42, duration: 2 },
      { midiNote: 83, col: 44, duration: 2 }, { midiNote: 84, col: 46, duration: 2 },
      // 3小節め: オクターブの跳躍
      { midiNote: 72, col: 48, duration: 4 }, { midiNote: 84, col: 52, duration: 4 },
      { midiNote: 79, col: 56, duration: 4 }, { midiNote: 72, col: 60, duration: 4 },
      // 4小節め: 締めのフレーズ
      { midiNote: 77, col: 64, duration: 2 }, { midiNote: 76, col: 66, duration: 2 },
      { midiNote: 74, col: 68, duration: 2 }, { midiNote: 72, col: 70, duration: 2 },
      { midiNote: 72, col: 72, duration: 8 }
    ]
  },

  {
    id: "demo-5",
    title: "熱いロックサビ",
    category: "Chorus",
    description: "力強いロングトーンとシンコペーション。王道の小室進行や4536進行がハマります。",
    bpm: 135,
    bars: 4,
    notes: [
      // 1小節め: ラーーーーソ・ファ（食い気味）
      { midiNote: 69, col: 16, duration: 12 }, { midiNote: 67, col: 28, duration: 2 }, { midiNote: 65, col: 30, duration: 2 },
      // 2小節め: ソーーー・ミドド（シンコペーション）
      { midiNote: 67, col: 32, duration: 8 }, { midiNote: 64, col: 40, duration: 4 },
      { midiNote: 60, col: 44, duration: 2 }, { midiNote: 60, col: 46, duration: 2 },
      // 3小節め: ファーーー・ソラシ（駆け上がり）
      { midiNote: 65, col: 48, duration: 8 }, { midiNote: 67, col: 56, duration: 2 },
      { midiNote: 69, col: 58, duration: 2 }, { midiNote: 71, col: 60, duration: 2 }, { midiNote: 72, col: 62, duration: 2 },
      // 4小節め: ドーーー（高音での着地）
      { midiNote: 72, col: 64, duration: 16 }
    ]
  },

  {
    id: "demo-6",
    title: "Future Pop Hook",
    category: "Chorus",
    description: "明るく跳ねるシンコペーション。セブンスコード（Richモード）で鳴らすと一気に今風になります。",
    bpm: 160,
    bars: 4,
    notes: [
      // 1小節め: ラー・ド・レー・ミ（タッタッタッター）
      { midiNote: 69, col: 16, duration: 3 }, { midiNote: 72, col: 19, duration: 3 }, 
      { midiNote: 74, col: 22, duration: 2 }, { midiNote: 76, col: 24, duration: 8 },
      // 2小節め: ソー・ミー・レ・ド
      { midiNote: 79, col: 32, duration: 3 }, { midiNote: 76, col: 35, duration: 3 }, 
      { midiNote: 74, col: 38, duration: 2 }, { midiNote: 72, col: 40, duration: 8 },
      // 3小節め: 1小節めの繰り返し
      { midiNote: 69, col: 48, duration: 3 }, { midiNote: 72, col: 51, duration: 3 }, 
      { midiNote: 74, col: 54, duration: 2 }, { midiNote: 76, col: 56, duration: 8 },
      // 4小節め: シーシラソラー（締め）
      { midiNote: 71, col: 64, duration: 4 }, { midiNote: 71, col: 68, duration: 2 },
      { midiNote: 69, col: 70, duration: 2 }, { midiNote: 67, col: 72, duration: 2 },
      { midiNote: 69, col: 74, duration: 6 }
    ]
  },
  {
    id: "demo-7",
    title: "Urban Night Walk",
    category: "Chill",
    description: "ジャズのテンション感が試せるメロディ。",
    bpm: 110,
    bars: 4,
    notes: [
      // 1小節め: （休み）〜ドシラソ
      { midiNote: 72, col: 20, duration: 4 }, { midiNote: 71, col: 24, duration: 4 },
      { midiNote: 69, col: 28, duration: 4 },
      // 2小節め: ファーーー（休み）〜ミファソ
      { midiNote: 65, col: 32, duration: 12 }, 
      { midiNote: 64, col: 44, duration: 2 }, { midiNote: 65, col: 46, duration: 2 },
      // 3小節め: ラーーシドーーー
      { midiNote: 69, col: 48, duration: 6 }, { midiNote: 71, col: 54, duration: 2 },
      { midiNote: 72, col: 56, duration: 8 },
      // 4小節め: シーソミー（脱力）
      { midiNote: 71, col: 64, duration: 4 }, { midiNote: 67, col: 68, duration: 4 },
      { midiNote: 64, col: 72, duration: 8 }
    ]
  },

  {
    id: "demo-8",
    title: "勇者の冒険",
    category: "Verse",
    description: "音階が激しく上下するチップチューン風。シンプルな三和音（Simpleモード）が似合います。",
    bpm: 160,
    bars: 4,
    notes: [
      // 1小節め: ドミソド・レファシレ
      { midiNote: 60, col: 16, duration: 2 }, { midiNote: 64, col: 18, duration: 2 },
      { midiNote: 67, col: 20, duration: 2 }, { midiNote: 72, col: 22, duration: 2 },
      { midiNote: 62, col: 24, duration: 2 }, { midiNote: 65, col: 26, duration: 2 },
      { midiNote: 71, col: 28, duration: 2 }, { midiNote: 74, col: 30, duration: 2 },
      // 2小節め: ミソドミ・レドシラ
      { midiNote: 64, col: 32, duration: 2 }, { midiNote: 67, col: 34, duration: 2 },
      { midiNote: 72, col: 36, duration: 2 }, { midiNote: 76, col: 38, duration: 2 },
      { midiNote: 74, col: 40, duration: 2 }, { midiNote: 72, col: 42, duration: 2 },
      { midiNote: 71, col: 44, duration: 2 }, { midiNote: 69, col: 46, duration: 2 },
      // 3小節め: ソーーーーーー（決めの長音）
      { midiNote: 67, col: 48, duration: 16 },
      // 4小節め: ソラシドレミファソ
      { midiNote: 67, col: 64, duration: 2 }, { midiNote: 69, col: 66, duration: 2 },
      { midiNote: 71, col: 68, duration: 2 }, { midiNote: 72, col: 70, duration: 2 },
      { midiNote: 74, col: 72, duration: 2 }, { midiNote: 76, col: 74, duration: 2 },
      { midiNote: 77, col: 76, duration: 2 }, { midiNote: 79, col: 78, duration: 2 }
    ]
  },

  {
    id: "demo-9",
    title: "雨上がりの空に",
    category: "Chorus",
    description: "ゆったりとした切ないバラード。4536進行や、分数コードの美しさを引き出します。",
    bpm: 85,
    bars: 4,
    notes: [
      // 1小節め: ドーーーシラソー（高音からの下降）
      { midiNote: 72, col: 16, duration: 12 }, { midiNote: 71, col: 28, duration: 2 },
      { midiNote: 69, col: 30, duration: 2 },
      // 2小節め: ソーーーファミーー
      { midiNote: 67, col: 32, duration: 12 }, { midiNote: 65, col: 44, duration: 2 },
      { midiNote: 64, col: 46, duration: 2 },
      // 3小節め: ファーミファ・ラーソー
      { midiNote: 65, col: 48, duration: 4 }, { midiNote: 64, col: 52, duration: 2 },
      { midiNote: 65, col: 54, duration: 2 }, { midiNote: 69, col: 56, duration: 4 },
      { midiNote: 67, col: 60, duration: 4 },
      // 4小節め: ドーーー（祈るような着地）
      { midiNote: 60, col: 64, duration: 16 }
    ]
  },

  {
    id: "demo-10",
    title: "ときめきハイタッチ！",
    category: "Chorus",
    description: "BPM160の王道アイドルポップ。主要三和音が抜群に似合います！",
    bpm: 160,
    bars: 4,
    notes: [
      // 1小節め: ドドドレ・ミミミファ
      { midiNote: 72, col: 16, duration: 2 }, { midiNote: 72, col: 18, duration: 2 },
      { midiNote: 72, col: 20, duration: 2 }, { midiNote: 74, col: 22, duration: 2 },
      { midiNote: 76, col: 24, duration: 2 }, { midiNote: 76, col: 26, duration: 2 },
      { midiNote: 76, col: 28, duration: 2 }, { midiNote: 77, col: 30, duration: 2 },
      // 2小節め: ソーファミ・レーー（休み）
      { midiNote: 79, col: 32, duration: 4 }, { midiNote: 77, col: 36, duration: 2 },
      { midiNote: 76, col: 38, duration: 2 }, { midiNote: 74, col: 40, duration: 8 },
      // 3小節め: ラララソ・ファファファミ
      { midiNote: 81, col: 48, duration: 2 }, { midiNote: 81, col: 50, duration: 2 },
      { midiNote: 81, col: 52, duration: 2 }, { midiNote: 79, col: 54, duration: 2 },
      { midiNote: 77, col: 56, duration: 2 }, { midiNote: 77, col: 58, duration: 2 },
      { midiNote: 77, col: 60, duration: 2 }, { midiNote: 76, col: 62, duration: 2 },
      // 4小節め: ソーーラ・ソーーー
      { midiNote: 79, col: 64, duration: 6 }, { midiNote: 81, col: 70, duration: 2 },
      { midiNote: 79, col: 72, duration: 8 }
    ]
  },
  {
    id: "demo-11",
    title: "電脳ディストーション",
    category: "Chorus",
    description: "16分音符が詰まったボカロ風メロディ。マイナー進行（Am→F→G→Cなど）がハマります。",
    bpm: 160,
    bars: 4,
    notes: [
      // 1小節め: ララシド・レレミファ（高速刻み）
      { midiNote: 69, col: 16, duration: 2 }, { midiNote: 69, col: 18, duration: 2 },
      { midiNote: 71, col: 20, duration: 2 }, { midiNote: 72, col: 22, duration: 2 },
      { midiNote: 74, col: 24, duration: 2 }, { midiNote: 74, col: 26, duration: 2 },
      { midiNote: 76, col: 28, duration: 2 }, { midiNote: 77, col: 30, duration: 2 },
      // 2小節め: ソーー（跳躍）ラーソーー
      { midiNote: 79, col: 32, duration: 4 }, { midiNote: 81, col: 36, duration: 4 },
      { midiNote: 79, col: 40, duration: 8 },
      // 3小節め: ファミレド・シラソシ
      { midiNote: 77, col: 48, duration: 2 }, { midiNote: 76, col: 50, duration: 2 },
      { midiNote: 74, col: 52, duration: 2 }, { midiNote: 72, col: 54, duration: 2 },
      { midiNote: 71, col: 56, duration: 2 }, { midiNote: 69, col: 58, duration: 2 },
      { midiNote: 67, col: 60, duration: 2 }, { midiNote: 71, col: 62, duration: 2 },
      // 4小節め: ラーーー（余韻）
      { midiNote: 69, col: 64, duration: 16 }
    ]
  },

  {
    id: "demo-12",
    title: "僕らの境界線",
    category: "Chorus",
    description: "爽やかなギターロック風アニソン。セブンスの響きを確認するのに最適。",
    bpm: 135,
    bars: 4,
    notes: [
      // 1小節め: ドシラソ・ファーソラ
      { midiNote: 72, col: 16, duration: 4 }, { midiNote: 71, col: 20, duration: 4 },
      { midiNote: 69, col: 24, duration: 4 }, { midiNote: 67, col: 28, duration: 4 },
      // 2小節め: ファーーソ・ラーーー
      { midiNote: 65, col: 32, duration: 6 }, { midiNote: 67, col: 38, duration: 2 },
      { midiNote: 69, col: 40, duration: 8 },
      // 3小節め: ソソラシ・ドードレ
      { midiNote: 67, col: 48, duration: 2 }, { midiNote: 67, col: 50, duration: 2 },
      { midiNote: 69, col: 52, duration: 2 }, { midiNote: 71, col: 54, duration: 2 },
      { midiNote: 72, col: 56, duration: 6 }, { midiNote: 74, col: 62, duration: 2 },
      // 4小節め: ミーーレ・ドーーー
      { midiNote: 76, col: 64, duration: 4 }, { midiNote: 74, col: 68, duration: 4 },
      { midiNote: 72, col: 72, duration: 8 }
    ]
  },

  {
    id: "demo-13",
    title: "トワイライト・レター",
    category: "Verse",
    description: "BPM85の切ないボカロバラード。",
    bpm: 85,
    bars: 4,
    notes: [
      // 1小節め: ミ・レ・ド・シ（下降）
      { midiNote: 64, col: 16, duration: 4 }, { midiNote: 62, col: 20, duration: 4 },
      { midiNote: 60, col: 24, duration: 4 }, { midiNote: 59, col: 28, duration: 4 },
      // 2小節め: ラ・シ・ド・ミ・レーー
      { midiNote: 57, col: 32, duration: 2 }, { midiNote: 59, col: 34, duration: 2 },
      { midiNote: 60, col: 36, duration: 4 }, { midiNote: 64, col: 40, duration: 4 },
      { midiNote: 62, col: 44, duration: 4 },
      // 3小節め: ミファ・ミレ・ドドシラ
      { midiNote: 64, col: 48, duration: 2 }, { midiNote: 65, col: 50, duration: 2 },
      { midiNote: 64, col: 52, duration: 2 }, { midiNote: 62, col: 54, duration: 2 },
      { midiNote: 60, col: 56, duration: 4 }, { midiNote: 59, col: 60, duration: 2 },
      { midiNote: 57, col: 62, duration: 2 },
      // 4小節め: シーーー（休符）ミーー
      { midiNote: 59, col: 64, duration: 8 }, { midiNote: 64, col: 72, duration: 8 }
    ]
  }
];