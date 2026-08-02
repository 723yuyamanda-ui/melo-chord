// src/lib/AudioAnalyzerCore.ts
import { KeyEstimator } from "./KeyEstimator";
import { NoteData, PitchFrame, AnalysisResult } from "../types";

const NOTE_NAMES_FLAT_JP = ["ド", "シ♭", "レ", "ミ♭", "ミ", "ファ", "ソ♭", "ソ", "ラ♭", "ラ", "シ♭", "シ"];
const NOTE_NAMES_SHARP_JP = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"];

export class AudioAnalyzerCore {
  private rawFrames: { pitch: number; clarity: number; timestamp: number }[] = [];

  public addFrame(pitch: number, clarity: number, timestamp: number) {
    if (clarity < 0.85 || pitch < 80 || pitch > 1000) {
      return;
    }
    this.rawFrames.push({ pitch, clarity, timestamp });
  }

  public reset() {
    this.rawFrames = [];
  }

  public analyze(): AnalysisResult {
    if (this.rawFrames.length === 0) {
      return {
        estimatedKey: "解析不能",
        detectedNotes: [],
        noteFrequencies: [],
        sustainedNotes: [],
        endingNote: "-",
        pitchHistory: [],
      };
    }

    const filteredFrames: PitchFrame[] = [];
    let consecutiveCount = 1;

    for (let i = 0; i < this.rawFrames.length; i++) {
      const current = this.rawFrames[i];
      const prev = this.rawFrames[i - 1];

      const currentIndex = KeyEstimator.pitchToNoteIndex(current.pitch);
      const prevIndex = prev ? KeyEstimator.pitchToNoteIndex(prev.pitch) : -1;

      if (currentIndex === prevIndex) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }

      if (consecutiveCount >= 4) {
        filteredFrames.push({
          timestamp: current.timestamp,
          pitch: current.pitch,
          clarity: current.clarity,
          noteJP: KeyEstimator.pitchToNoteNameJP(current.pitch),
          noteIndex: currentIndex,
        });
      }
    }

    if (filteredFrames.length === 0) {
      return {
        estimatedKey: "音程判定不可（ノイズのみ）",
        detectedNotes: [],
        noteFrequencies: [],
        sustainedNotes: [],
        endingNote: "-",
        pitchHistory: [],
      };
    }

    const chroma = new Array(12).fill(0);
    filteredFrames.forEach((frame) => {
      if (frame.noteIndex !== -1) {
        chroma[frame.noteIndex] += 1;
      }
    });

    const keyResult = KeyEstimator.estimateKey(chroma);
    const isFlatKey = keyResult.key.includes("♭") || keyResult.key.includes("Minor") || keyResult.key.includes("F");
    const noteNameMap = isFlatKey ? NOTE_NAMES_FLAT_JP : NOTE_NAMES_SHARP_JP;

    const noteCounts: Record<number, number> = {};
    filteredFrames.forEach((frame) => {
      noteCounts[frame.noteIndex] = (noteCounts[frame.noteIndex] || 0) + 1;
    });

    const totalValidFrames = filteredFrames.length;
    const allFrequencies = Object.entries(noteCounts)
      .map(([idxStr, count]) => {
        const idx = Number(idxStr);
        return {
          index: idx,
          name: noteNameMap[idx],
          percentage: Math.round((count / totalValidFrames) * 100),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const validFrequencies = allFrequencies.filter((item) => item.percentage >= 8);
    const detectedNotes = validFrequencies.map((item) => item.name);

    const sustainedMap: Record<number, number> = {};
    let currentIdx = -1;
    let currentDuration = 0;

    filteredFrames.forEach((frame) => {
      if (frame.noteIndex === currentIdx) {
        currentDuration += 1;
      } else {
        if (currentDuration >= 10 && currentIdx !== -1) {
          sustainedMap[currentIdx] = (sustainedMap[currentIdx] || 0) + currentDuration;
        }
        currentIdx = frame.noteIndex;
        currentDuration = 1;
      }
    });

    const sustainedNotes = Object.entries(sustainedMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([idxStr]) => noteNameMap[Number(idxStr)])
      .filter((note) => detectedNotes.includes(note));

    const tailFrames = filteredFrames.slice(-25);
    const tailCounts: Record<number, number> = {};
    tailFrames.forEach((f) => {
      tailCounts[f.noteIndex] = (tailCounts[f.noteIndex] || 0) + 1;
    });
    
    const topTailIdx = Object.entries(tailCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const endingNote = topTailIdx !== undefined ? noteNameMap[Number(topTailIdx)] : "-";

    return {
      estimatedKey: keyResult.key,
      detectedNotes,
      noteFrequencies: validFrequencies.map(({ name, percentage }) => ({ name, percentage })),
      sustainedNotes,
      endingNote,
      pitchHistory: filteredFrames,
    };
  }
}

/**
 * 解析されたピッチ履歴（pitchHistory）を Mero Chord の NoteData[] グリッドデータへ変換
 * ★ マイク入力遅延（AUDIO_LATENCY_OFFSET = 0.08秒 = 80ms）を差し引いて完全アタマ補正！
 */
export function convertPitchHistoryToMelodyGrid(
  pitchHistory: PitchFrame[],
  bpm: number,
  measures: number = 4
): NoteData[] {
  const grid: NoteData[] = [];
  const secondsPer16th = (60 / bpm) / 4;
  const totalSteps = measures === 4 ? 80 : 144;

  // ブラウザ・マイクの一般的な入力レイテンシー補正値（0.08秒）
  const AUDIO_LATENCY_OFFSET = 0.08; 

  for (let step = 16; step < totalSteps; step++) {
    // 遅延分（0.08秒）手前に補正した時間軸でマス目判定
    const stepStartTime = Math.max(0, (step - 16) * secondsPer16th - AUDIO_LATENCY_OFFSET);
    const stepEndTime = stepStartTime + secondsPer16th;

    const framesInStep = pitchHistory.filter(
      (f) => f.timestamp >= stepStartTime && f.timestamp < stepEndTime
    );

    if (framesInStep.length > 0) {
      const avgPitch = framesInStep.reduce((sum, f) => sum + f.pitch, 0) / framesInStep.length;
      const midiNote = Math.round(69 + 12 * Math.log2(avgPitch / 440));

      grid.push({
        col: step,
        midiNote: midiNote,
        duration: 2,
      });
    }
  }

  return grid;
}