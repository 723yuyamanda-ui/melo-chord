// src/types.ts

export type NoteData = { 
    midiNote: number; // 例: 60 (C4), 61 (C#4), 0 (休符)
    col: number;      // 0〜143 (第0小節 16ステップ + 第1〜8小節 128ステップ = 計144ステップ)
    duration: number; 
  };
  
  export type GridMode = 8 | 16;
  export type TrackType = 'melody' | 'piano' | 'guitar' | 'bass' | 'drum';
  export type AccompPattern = 'whole' | 'fourOnTheFloor' | 'arpeggio';
  export type GenreType = 'pop' | 'emo' | 'jazz' | 'slash';
  
  export type SavedMelodyItem = {
    id: string;             // ユニークID (melo-タイムスタンプ)
    title: string;          // ユーザーが入力したメロディ名 (10文字以内)
    melodyGrid: NoteData[]; // メロディデータ本体
    bpm: number;            // テンポ（BPM）
    savedAt: string;        // 保存日時 (YYYY/MM/DD HH:mm)
    audioUrl?: string;      // 生音音声のBlob URL（オプション）
  };
  
  // ─── 新設：ピッチ・音声解析用の型定義 ───
  export interface PitchFrame {
    timestamp: number;
    pitch: number;
    clarity: number;
    noteJP: string;
    noteIndex: number; // 0:C, 1:C#, ..., 11:B
  }
  
  export interface AnalysisResult {
    estimatedKey: string;
    detectedNotes: string[];              // フィルター済みの主要使用音
    noteFrequencies: { name: string; percentage: number }[]; // 出現頻度
    sustainedNotes: string[];             // 長く鳴っている重要音候補
    endingNote: string;                   // 終止音
    pitchHistory: PitchFrame[];
  }