// src/constants/dummyChords.ts

export interface DummyChordPattern {
    id: string;
    title: string;
    genre: string;
    rating: number;
    tags: string[];
    description: string;
    chords: string[];
  }
  
  export const DUMMY_CHORD_PATTERNS: DummyChordPattern[] = [
    {
      id: 'pop-1',
      title: "王道のJ-POPサビ",
      genre: "👑 ヒットチャートの定番",
      rating: 5,
      tags: ["安心感", "サビ向け", "J-POP"],
      description: "誰もが一度は耳にしたことがある最も有名な進行です。圧倒的な安定感があり、メロディの良さを100%引き出します。",
      chords: ["F", "G", "Em", "Am", "F", "G", "C", "-"]
    },
    {
      id: 'emo-1',
      title: "夕暮れの都会",
      genre: "🌃 シティポップ / エモ",
      rating: 5,
      tags: ["おしゃれ", "少し切ない", "浮遊感"],
      description: "テンションコード（7th）を贅沢に使い、少し背伸びした大人な雰囲気を演出します。都会的な夜や、チルな楽曲にぴったりです。",
      chords: ["FM7", "E7", "Am7", "Gm7", "C7", "-", "-", "-"]
    },
    {
      id: 'vocaloid-1',
      title: "ドラマチックな疾走感",
      genre: "✨ ボカロ / アニソン",
      rating: 4,
      tags: ["激しい", "哀愁", "メロディアス"],
      description: "マイナーコードから始まる、どこか切なくも力強い進行です。アップテンポな曲に乗せると、胸を締め付けるようなドラマチックな展開を作れます。",
      chords: ["Am", "F", "G", "C", "Am", "F", "G", "E7"]
    },
    {
      id: 'western-1',
      title: "エモい別れと旅立ち",
      genre: "🎸 オンコード / 洋楽風",
      rating: 4,
      tags: ["泣きメロ", "ベースライン重視", "エモーショナル"],
      description: "分数コード（オンコード）を使い、ベースの音が滑らかに下降していく美しい進行です。バラードやアコースティックな曲で真価を発揮します。",
      chords: ["C", "G/B", "Am", "Em/G", "F", "C/E", "Dm", "G"]
    }
  ];